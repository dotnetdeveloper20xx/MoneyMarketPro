using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Lenders.Queries.GetLenderInvestments;

public record GetLenderInvestmentsQuery(
    Guid LenderProfileId,
    bool ActiveOnly = false,
    int Page = 1,
    int PageSize = 20) : IQuery<LenderInvestmentsDto>;

public record LenderInvestmentsDto(
    List<InvestmentDto> Investments,
    int TotalCount,
    int Page,
    int PageSize);

public record InvestmentDto(
    Guid Id,
    Guid LoanId,
    decimal Amount,
    decimal InterestRate,
    DateTime FundedAt,
    decimal ExpectedInterest,
    decimal ReceivedPrincipal,
    decimal ReceivedInterest,
    bool IsFullyReturned,
    decimal SharePercentage,
    string LoanStatus,
    string RiskGrade);
