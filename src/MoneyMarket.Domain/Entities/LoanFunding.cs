using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents an investment/funding contribution from a lender to a loan.
/// </summary>
public class LoanFunding : Entity<LoanFundingId>, IAuditableEntity
{
    public LoanId LoanId { get; private set; } = null!;
    public Loan Loan { get; private set; } = null!;

    public LenderProfileId LenderProfileId { get; private set; } = null!;
    public LenderProfile LenderProfile { get; private set; } = null!;

    // Investment Details
    public Money Amount { get; private set; } = null!;
    public InterestRate InterestRate { get; private set; } = null!;
    public DateTime FundedAt { get; private set; }

    // Expected Returns
    public Money ExpectedInterest { get; private set; } = null!;
    public Money ExpectedTotal { get; private set; } = null!;

    // Actual Returns
    public Money ReceivedPrincipal { get; private set; } = Money.Zero();
    public Money ReceivedInterest { get; private set; } = Money.Zero();
    public bool IsFullyReturned { get; private set; }
    public DateTime? FullyReturnedAt { get; private set; }

    // Share of the loan
    public decimal SharePercentage { get; private set; }

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    private LoanFunding() { }

    internal static LoanFunding Create(
        LoanId loanId,
        LenderProfileId lenderProfileId,
        Money amount,
        InterestRate interestRate)
    {
        var funding = new LoanFunding
        {
            Id = LoanFundingId.Create(),
            LoanId = loanId,
            LenderProfileId = lenderProfileId,
            Amount = amount,
            InterestRate = interestRate,
            FundedAt = DateTime.UtcNow,
            ReceivedPrincipal = Money.Zero(amount.Currency),
            ReceivedInterest = Money.Zero(amount.Currency)
        };

        // Calculate expected returns (will be finalized when loan terms are set)
        funding.CalculateExpectedReturns();

        return funding;
    }

    private void CalculateExpectedReturns()
    {
        // This will be recalculated when the loan term is known
        // For now, estimate based on annual rate
        ExpectedInterest = InterestRate.CalculateAnnualInterest(Amount);
        ExpectedTotal = Amount.Add(ExpectedInterest);
    }

    public void SetSharePercentage(decimal loanTotalAmount)
    {
        if (loanTotalAmount > 0)
        {
            SharePercentage = Math.Round(Amount.Amount / loanTotalAmount * 100, 4);
        }
    }

    public void RecordPrincipalReturn(Money amount)
    {
        ReceivedPrincipal = ReceivedPrincipal.Add(amount);
        CheckIfFullyReturned();
    }

    public void RecordInterestPayment(Money amount)
    {
        ReceivedInterest = ReceivedInterest.Add(amount);
        CheckIfFullyReturned();
    }

    private void CheckIfFullyReturned()
    {
        if (ReceivedPrincipal >= Amount)
        {
            IsFullyReturned = true;
            FullyReturnedAt = DateTime.UtcNow;
        }
    }

    public Money TotalReceived => ReceivedPrincipal.Add(ReceivedInterest);

    public Money OutstandingPrincipal => Amount.Subtract(ReceivedPrincipal);

    public decimal ReturnOnInvestment
    {
        get
        {
            if (!Amount.IsPositive) return 0;
            return Math.Round((ReceivedInterest.Amount / Amount.Amount) * 100, 2);
        }
    }
}
