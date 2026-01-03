using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Events;

/// <summary>
/// Event raised when a loan is listed on the marketplace.
/// </summary>
public record LoanListedEvent(
    LoanId LoanId,
    Money Amount,
    InterestRate InterestRate,
    string RiskGrade) : DomainEvent;

/// <summary>
/// Event raised when funding is received for a loan.
/// </summary>
public record LoanFundingReceivedEvent(
    LoanId LoanId,
    LenderProfileId LenderProfileId,
    Money Amount,
    int FundingPercentage) : DomainEvent;

/// <summary>
/// Event raised when a loan becomes fully funded.
/// </summary>
public record LoanFullyFundedEvent(LoanId LoanId) : DomainEvent;

/// <summary>
/// Event raised when a loan is disbursed to the borrower.
/// </summary>
public record LoanDisbursedEvent(
    LoanId LoanId,
    BorrowerProfileId BorrowerProfileId,
    Money Amount) : DomainEvent;

/// <summary>
/// Event raised when a loan is paid off in full.
/// </summary>
public record LoanPaidOffEvent(
    LoanId LoanId,
    BorrowerProfileId BorrowerProfileId) : DomainEvent;

/// <summary>
/// Event raised when a loan becomes delinquent.
/// </summary>
public record LoanDelinquentEvent(
    LoanId LoanId,
    BorrowerProfileId BorrowerProfileId) : DomainEvent;

/// <summary>
/// Event raised when a loan goes into default.
/// </summary>
public record LoanDefaultedEvent(
    LoanId LoanId,
    BorrowerProfileId BorrowerProfileId,
    Money OutstandingAmount) : DomainEvent;

/// <summary>
/// Event raised when a loan is cancelled before disbursement.
/// </summary>
public record LoanCancelledEvent(
    LoanId LoanId,
    string Reason) : DomainEvent;

/// <summary>
/// Event raised when a loan funding period expires.
/// </summary>
public record LoanExpiredEvent(LoanId LoanId) : DomainEvent;
