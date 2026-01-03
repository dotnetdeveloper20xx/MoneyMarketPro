using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Loans.Queries.GetMarketplaceLoans;

public record GetMarketplaceLoansQuery(
    List<string>? RiskGrades = null,
    decimal? MinAmount = null,
    decimal? MaxAmount = null,
    decimal? MinInterestRate = null,
    decimal? MaxInterestRate = null,
    int? MinTermMonths = null,
    int? MaxTermMonths = null,
    string? SortBy = null,
    bool SortDescending = false,
    int Page = 1,
    int PageSize = 20) : IQuery<MarketplaceLoansDto>;

public record MarketplaceLoansDto(
    List<MarketplaceLoanDto> Loans,
    int TotalCount,
    int Page,
    int PageSize);

public record MarketplaceLoanDto(
    Guid Id,
    decimal PrincipalAmount,
    decimal InterestRate,
    int TermMonths,
    string RiskGrade,
    LoanPurpose Purpose,
    decimal FundedAmount,
    int FundingPercentage,
    DateTime FundingDeadline,
    int DaysRemaining,
    int InvestorCount,
    DateTime ListedAt);
