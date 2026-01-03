using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents a scheduled payment in the loan amortization schedule.
/// </summary>
public class PaymentSchedule : Entity<Guid>, IAuditableEntity
{
    public LoanId LoanId { get; private set; } = null!;
    public Loan Loan { get; private set; } = null!;

    public int PaymentNumber { get; private set; }
    public DateTime DueDate { get; private set; }

    public Money PrincipalDue { get; private set; } = null!;
    public Money InterestDue { get; private set; } = null!;
    public Money TotalDue => PrincipalDue.Add(InterestDue);

    public PaymentStatus Status { get; private set; }
    public PaymentId? PaymentId { get; private set; }
    public DateTime? PaidAt { get; private set; }

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    private PaymentSchedule() { }

    internal static PaymentSchedule Create(
        LoanId loanId,
        int paymentNumber,
        DateTime dueDate,
        Money principalDue,
        Money interestDue)
    {
        return new PaymentSchedule
        {
            Id = Guid.NewGuid(),
            LoanId = loanId,
            PaymentNumber = paymentNumber,
            DueDate = dueDate,
            PrincipalDue = principalDue,
            InterestDue = interestDue,
            Status = PaymentStatus.Scheduled
        };
    }

    public void MarkAsPaid(PaymentId paymentId)
    {
        Status = PaymentStatus.Completed;
        PaymentId = paymentId;
        PaidAt = DateTime.UtcNow;
    }

    public void MarkAsOverdue()
    {
        if (Status == PaymentStatus.Scheduled && DateTime.UtcNow > DueDate)
        {
            Status = PaymentStatus.Overdue;
        }
    }

    public bool IsOverdue => Status == PaymentStatus.Scheduled && DateTime.UtcNow > DueDate;
    public bool IsPaid => Status == PaymentStatus.Completed;
    public bool IsDueSoon => Status == PaymentStatus.Scheduled && DueDate <= DateTime.UtcNow.AddDays(7);
}
