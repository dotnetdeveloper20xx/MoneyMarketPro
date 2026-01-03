using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.Events;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents a loan in the MoneyMarket platform.
/// This is the main aggregate root for the lending domain.
/// </summary>
public class Loan : AggregateRoot<LoanId>, IAuditableEntity, ISoftDeletable
{
    public LoanApplicationId ApplicationId { get; private set; } = null!;
    public LoanApplication Application { get; private set; } = null!;

    public BorrowerProfileId BorrowerProfileId { get; private set; } = null!;
    public BorrowerProfile BorrowerProfile { get; private set; } = null!;

    // Loan Terms
    public Money PrincipalAmount { get; private set; } = null!;
    public InterestRate InterestRate { get; private set; } = null!;
    public LoanTerm Term { get; private set; } = null!;
    public RiskGrade RiskGrade { get; private set; } = null!;
    public LoanPurpose Purpose { get; private set; }

    // Calculated Values
    public Money TotalInterest { get; private set; } = null!;
    public Money TotalRepaymentAmount { get; private set; } = null!;
    public Money MonthlyPaymentAmount { get; private set; } = null!;

    // Status & Dates
    public LoanStatus Status { get; private set; }
    public DateTime? ListedAt { get; private set; }
    public DateTime FundingDeadline { get; private set; }
    public DateTime? FullyFundedAt { get; private set; }
    public DateTime? DisbursedAt { get; private set; }
    public DateTime? FirstPaymentDueDate { get; private set; }
    public DateTime? MaturityDate { get; private set; }
    public DateTime? ClosedAt { get; private set; }

    // Funding Progress
    public Money FundedAmount { get; private set; } = Money.Zero();
    public int FundingPercentage => PrincipalAmount.IsPositive
        ? (int)(FundedAmount.Amount / PrincipalAmount.Amount * 100)
        : 0;

    // Repayment Progress
    public Money OutstandingPrincipal { get; private set; } = Money.Zero();
    public Money OutstandingInterest { get; private set; } = Money.Zero();
    public Money TotalPaidPrincipal { get; private set; } = Money.Zero();
    public Money TotalPaidInterest { get; private set; } = Money.Zero();
    public int PaymentsMade { get; private set; }
    public int PaymentsMissed { get; private set; }

    // Collections
    private readonly List<LoanFunding> _fundings = new();
    public IReadOnlyCollection<LoanFunding> Fundings => _fundings.AsReadOnly();

    private readonly List<Payment> _payments = new();
    public IReadOnlyCollection<Payment> Payments => _payments.AsReadOnly();

    private readonly List<PaymentSchedule> _paymentSchedule = new();
    public IReadOnlyCollection<PaymentSchedule> PaymentSchedule => _paymentSchedule.AsReadOnly();

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    private Loan() { }

    internal static Loan Create(
        LoanApplicationId applicationId,
        BorrowerProfileId borrowerProfileId,
        Money principalAmount,
        InterestRate interestRate,
        LoanTerm term,
        RiskGrade riskGrade,
        LoanPurpose purpose,
        DateTime fundingDeadline)
    {
        var loan = new Loan
        {
            Id = LoanId.Create(),
            ApplicationId = applicationId,
            BorrowerProfileId = borrowerProfileId,
            PrincipalAmount = principalAmount,
            InterestRate = interestRate,
            Term = term,
            RiskGrade = riskGrade,
            Purpose = purpose,
            Status = LoanStatus.PendingFunding,
            FundingDeadline = fundingDeadline,
            FundedAmount = Money.Zero(principalAmount.Currency),
            OutstandingPrincipal = Money.Zero(principalAmount.Currency),
            OutstandingInterest = Money.Zero(principalAmount.Currency),
            TotalPaidPrincipal = Money.Zero(principalAmount.Currency),
            TotalPaidInterest = Money.Zero(principalAmount.Currency)
        };

        loan.CalculateLoanTerms();
        loan.ListedAt = DateTime.UtcNow;

        loan.RaiseDomainEvent(new LoanListedEvent(loan.Id, principalAmount, interestRate, riskGrade.Grade));

        return loan;
    }

    private void CalculateLoanTerms()
    {
        // Simple interest calculation
        TotalInterest = Money.Create(
            Math.Round(PrincipalAmount.Amount * InterestRate.DecimalRate * (Term.Months / 12m), 2),
            PrincipalAmount.Currency);

        TotalRepaymentAmount = PrincipalAmount.Add(TotalInterest);

        MonthlyPaymentAmount = Money.Create(
            Math.Round(TotalRepaymentAmount.Amount / Term.Months, 2),
            PrincipalAmount.Currency);
    }

    public Result<LoanFunding> AddFunding(LenderProfileId lenderProfileId, Money amount)
    {
        if (Status != LoanStatus.PendingFunding && Status != LoanStatus.PartiallyFunded)
            return Result.Failure<LoanFunding>(DomainErrors.Loan.NotPendingFunding);

        if (DateTime.UtcNow > FundingDeadline)
            return Result.Failure<LoanFunding>(DomainErrors.Loan.FundingExpired);

        var remainingAmount = PrincipalAmount.Subtract(FundedAmount);
        if (amount > remainingAmount)
            return Result.Failure<LoanFunding>(DomainErrors.Loan.OverFunded);

        var funding = LoanFunding.Create(Id, lenderProfileId, amount, InterestRate);
        _fundings.Add(funding);

        FundedAmount = FundedAmount.Add(amount);

        if (FundedAmount >= PrincipalAmount)
        {
            Status = LoanStatus.FullyFunded;
            FullyFundedAt = DateTime.UtcNow;
            RaiseDomainEvent(new LoanFullyFundedEvent(Id));
        }
        else
        {
            Status = LoanStatus.PartiallyFunded;
        }

        RaiseDomainEvent(new LoanFundingReceivedEvent(Id, lenderProfileId, amount, FundingPercentage));

        return Result.Success(funding);
    }

    public Result Disburse()
    {
        if (Status != LoanStatus.FullyFunded)
            return Result.Failure(new Error("Loan.NotFullyFunded", "Loan must be fully funded to disburse."));

        if (DisbursedAt.HasValue)
            return Result.Failure(DomainErrors.Loan.AlreadyDisbursed);

        Status = LoanStatus.Disbursed;
        DisbursedAt = DateTime.UtcNow;
        FirstPaymentDueDate = DateTime.UtcNow.AddMonths(1);
        MaturityDate = DateTime.UtcNow.AddMonths(Term.Months);

        OutstandingPrincipal = PrincipalAmount;
        OutstandingInterest = TotalInterest;

        GeneratePaymentSchedule();

        RaiseDomainEvent(new LoanDisbursedEvent(Id, BorrowerProfileId, PrincipalAmount));

        return Result.Success();
    }

    private void GeneratePaymentSchedule()
    {
        var monthlyPrincipal = Money.Create(
            Math.Round(PrincipalAmount.Amount / Term.Months, 2),
            PrincipalAmount.Currency);

        var monthlyInterest = Money.Create(
            Math.Round(TotalInterest.Amount / Term.Months, 2),
            TotalInterest.Currency);

        for (int i = 1; i <= Term.Months; i++)
        {
            var dueDate = DisbursedAt!.Value.AddMonths(i);
            var schedule = Entities.PaymentSchedule.Create(
                Id,
                i,
                dueDate,
                monthlyPrincipal,
                monthlyInterest);

            _paymentSchedule.Add(schedule);
        }
    }

    public Result Activate()
    {
        if (Status != LoanStatus.Disbursed)
            return Result.Failure(new Error("Loan.NotDisbursed", "Loan must be disbursed to activate."));

        Status = LoanStatus.Active;

        return Result.Success();
    }

    public Result<Payment> RecordPayment(Money amount, PaymentMethod method, string? reference = null)
    {
        if (Status != LoanStatus.Active && Status != LoanStatus.Delinquent)
            return Result.Failure<Payment>(new Error("Loan.NotActive", "Loan must be active to receive payments."));

        var totalOutstanding = OutstandingPrincipal.Add(OutstandingInterest);
        if (amount > totalOutstanding)
            return Result.Failure<Payment>(DomainErrors.Payment.OverPayment);

        // Allocate payment to interest first, then principal
        var interestPayment = amount <= OutstandingInterest
            ? amount
            : OutstandingInterest;

        var principalPayment = amount.Subtract(interestPayment);

        var payment = Payment.Create(
            Id,
            BorrowerProfileId,
            amount,
            principalPayment,
            interestPayment,
            method,
            reference);

        _payments.Add(payment);

        OutstandingInterest = OutstandingInterest.Subtract(interestPayment);
        OutstandingPrincipal = OutstandingPrincipal.Subtract(principalPayment);
        TotalPaidInterest = TotalPaidInterest.Add(interestPayment);
        TotalPaidPrincipal = TotalPaidPrincipal.Add(principalPayment);
        PaymentsMade++;

        // Update scheduled payment status
        var nextSchedule = _paymentSchedule
            .Where(s => s.Status == PaymentStatus.Scheduled || s.Status == PaymentStatus.Overdue)
            .OrderBy(s => s.DueDate)
            .FirstOrDefault();

        nextSchedule?.MarkAsPaid(payment.Id);

        // Check if loan is fully paid
        if (OutstandingPrincipal.IsZero && OutstandingInterest.IsZero)
        {
            Status = LoanStatus.PaidOff;
            ClosedAt = DateTime.UtcNow;
            RaiseDomainEvent(new LoanPaidOffEvent(Id, BorrowerProfileId));
        }
        else if (Status == LoanStatus.Delinquent)
        {
            // Check if back to current
            var overduePayments = _paymentSchedule.Count(s => s.Status == PaymentStatus.Overdue);
            if (overduePayments == 0)
            {
                Status = LoanStatus.Active;
            }
        }

        RaiseDomainEvent(new PaymentReceivedEvent(Id, payment.Id, amount));

        return Result.Success(payment);
    }

    public void MarkDelinquent()
    {
        if (Status == LoanStatus.Active)
        {
            Status = LoanStatus.Delinquent;
            PaymentsMissed++;
            RaiseDomainEvent(new LoanDelinquentEvent(Id, BorrowerProfileId));
        }
    }

    public void MarkDefault()
    {
        if (Status == LoanStatus.Delinquent)
        {
            Status = LoanStatus.Default;
            ClosedAt = DateTime.UtcNow;
            RaiseDomainEvent(new LoanDefaultedEvent(Id, BorrowerProfileId, OutstandingPrincipal));
        }
    }

    public void Cancel(string reason)
    {
        if (Status is LoanStatus.PendingFunding or LoanStatus.PartiallyFunded)
        {
            Status = LoanStatus.Cancelled;
            ClosedAt = DateTime.UtcNow;
            RaiseDomainEvent(new LoanCancelledEvent(Id, reason));
        }
    }

    public void Expire()
    {
        if ((Status is LoanStatus.PendingFunding or LoanStatus.PartiallyFunded)
            && DateTime.UtcNow > FundingDeadline)
        {
            Status = LoanStatus.Expired;
            ClosedAt = DateTime.UtcNow;
            RaiseDomainEvent(new LoanExpiredEvent(Id));
        }
    }

    public bool IsOpen => Status is LoanStatus.PendingFunding or LoanStatus.PartiallyFunded
        or LoanStatus.FullyFunded or LoanStatus.Disbursed or LoanStatus.Active or LoanStatus.Delinquent;

    public bool IsClosed => Status is LoanStatus.PaidOff or LoanStatus.Default
        or LoanStatus.Cancelled or LoanStatus.Expired;

    public bool CanReceiveFunding => (Status is LoanStatus.PendingFunding or LoanStatus.PartiallyFunded)
        && DateTime.UtcNow <= FundingDeadline;
}
