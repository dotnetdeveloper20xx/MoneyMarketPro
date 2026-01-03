using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Events;

/// <summary>
/// Event raised when a payment is received for a loan.
/// </summary>
public record PaymentReceivedEvent(
    LoanId LoanId,
    PaymentId PaymentId,
    Money Amount) : DomainEvent;

/// <summary>
/// Event raised when a payment is due soon.
/// </summary>
public record PaymentDueSoonEvent(
    LoanId LoanId,
    BorrowerProfileId BorrowerProfileId,
    Money Amount,
    DateTime DueDate) : DomainEvent;

/// <summary>
/// Event raised when a payment becomes overdue.
/// </summary>
public record PaymentOverdueEvent(
    LoanId LoanId,
    BorrowerProfileId BorrowerProfileId,
    Money Amount,
    int DaysOverdue) : DomainEvent;

/// <summary>
/// Event raised when a payment fails.
/// </summary>
public record PaymentFailedEvent(
    LoanId LoanId,
    PaymentId PaymentId,
    string Reason) : DomainEvent;
