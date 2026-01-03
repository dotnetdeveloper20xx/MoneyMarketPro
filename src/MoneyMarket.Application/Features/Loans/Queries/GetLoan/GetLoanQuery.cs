using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Loans.Queries.GetLoan;

public record GetLoanQuery(Guid LoanId) : IQuery<LoanDetailDto>;

public record LoanDetailDto(
    Guid Id,
    Guid ApplicationId,
    Guid BorrowerProfileId,
    string BorrowerName,
    decimal PrincipalAmount,
    decimal InterestRate,
    int TermMonths,
    string RiskGrade,
    LoanPurpose Purpose,
    LoanStatus Status,
    decimal TotalInterest,
    decimal TotalRepaymentAmount,
    decimal MonthlyPaymentAmount,
    DateTime? ListedAt,
    DateTime FundingDeadline,
    DateTime? FullyFundedAt,
    DateTime? DisbursedAt,
    DateTime? FirstPaymentDueDate,
    DateTime? MaturityDate,
    decimal FundedAmount,
    int FundingPercentage,
    decimal OutstandingPrincipal,
    decimal OutstandingInterest,
    decimal TotalPaidPrincipal,
    decimal TotalPaidInterest,
    int PaymentsMade,
    int PaymentsMissed,
    List<LoanFundingDto> Fundings,
    List<PaymentScheduleDto> Schedule,
    DateTime CreatedAt);

public record LoanFundingDto(
    Guid Id,
    Guid LenderProfileId,
    string LenderName,
    decimal Amount,
    decimal SharePercentage,
    DateTime FundedAt);

public record PaymentScheduleDto(
    int PaymentNumber,
    DateTime DueDate,
    decimal PrincipalDue,
    decimal InterestDue,
    decimal TotalDue,
    string Status,
    DateTime? PaidAt);
