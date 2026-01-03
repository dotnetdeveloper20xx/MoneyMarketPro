using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents a payment made by a borrower towards a loan.
/// </summary>
public class Payment : Entity<PaymentId>, IAuditableEntity
{
    public LoanId LoanId { get; private set; } = null!;
    public Loan Loan { get; private set; } = null!;

    public BorrowerProfileId BorrowerProfileId { get; private set; } = null!;
    public BorrowerProfile BorrowerProfile { get; private set; } = null!;

    // Payment Details
    public Money TotalAmount { get; private set; } = null!;
    public Money PrincipalAmount { get; private set; } = null!;
    public Money InterestAmount { get; private set; } = null!;
    public Money? LateFeeAmount { get; private set; }

    // Processing
    public PaymentMethod Method { get; private set; }
    public PaymentStatus Status { get; private set; }
    public string? ExternalReference { get; private set; }
    public string? TransactionId { get; private set; }

    // Dates
    public DateTime PaymentDate { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public DateTime? FailedAt { get; private set; }
    public string? FailureReason { get; private set; }

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    private Payment() { }

    internal static Payment Create(
        LoanId loanId,
        BorrowerProfileId borrowerProfileId,
        Money totalAmount,
        Money principalAmount,
        Money interestAmount,
        PaymentMethod method,
        string? externalReference = null)
    {
        return new Payment
        {
            Id = PaymentId.Create(),
            LoanId = loanId,
            BorrowerProfileId = borrowerProfileId,
            TotalAmount = totalAmount,
            PrincipalAmount = principalAmount,
            InterestAmount = interestAmount,
            Method = method,
            Status = PaymentStatus.Completed,
            ExternalReference = externalReference,
            PaymentDate = DateTime.UtcNow,
            ProcessedAt = DateTime.UtcNow
        };
    }

    public static Payment CreateScheduled(
        LoanId loanId,
        BorrowerProfileId borrowerProfileId,
        Money amount,
        PaymentMethod method,
        DateTime scheduledDate)
    {
        return new Payment
        {
            Id = PaymentId.Create(),
            LoanId = loanId,
            BorrowerProfileId = borrowerProfileId,
            TotalAmount = amount,
            PrincipalAmount = Money.Zero(amount.Currency),
            InterestAmount = Money.Zero(amount.Currency),
            Method = method,
            Status = PaymentStatus.Scheduled,
            PaymentDate = scheduledDate
        };
    }

    public void MarkAsProcessing(string transactionId)
    {
        Status = PaymentStatus.Processing;
        TransactionId = transactionId;
    }

    public void MarkAsCompleted(Money principalPaid, Money interestPaid, Money? lateFee = null)
    {
        Status = PaymentStatus.Completed;
        PrincipalAmount = principalPaid;
        InterestAmount = interestPaid;
        LateFeeAmount = lateFee;
        ProcessedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string reason)
    {
        Status = PaymentStatus.Failed;
        FailureReason = reason;
        FailedAt = DateTime.UtcNow;
    }

    public void AddLateFee(Money fee)
    {
        LateFeeAmount = fee;
        TotalAmount = TotalAmount.Add(fee);
    }
}
