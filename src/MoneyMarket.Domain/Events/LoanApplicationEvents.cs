using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Events;

/// <summary>
/// Event raised when a loan application is submitted.
/// </summary>
public record LoanApplicationSubmittedEvent(
    LoanApplicationId ApplicationId,
    BorrowerProfileId BorrowerProfileId) : DomainEvent;

/// <summary>
/// Event raised when a loan application is approved.
/// </summary>
public record LoanApplicationApprovedEvent(
    LoanApplicationId ApplicationId,
    BorrowerProfileId BorrowerProfileId,
    Money ApprovedAmount,
    InterestRate InterestRate) : DomainEvent;

/// <summary>
/// Event raised when a loan application is rejected.
/// </summary>
public record LoanApplicationRejectedEvent(
    LoanApplicationId ApplicationId,
    BorrowerProfileId BorrowerProfileId,
    string Reason) : DomainEvent;
