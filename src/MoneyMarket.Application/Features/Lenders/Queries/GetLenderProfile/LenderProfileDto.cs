using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Lenders.Queries.GetLenderProfile;

public record LenderProfileDto(
    Guid Id,
    Guid UserId,
    string FullName,
    string Email,
    AccreditationStatus AccreditationStatus,
    DateTime? AccreditationExpiresAt,
    decimal? MinInvestmentAmount,
    decimal? MaxInvestmentAmount,
    List<string> PreferredRiskGrades,
    bool AutoInvestEnabled,
    int TotalInvestmentsCount,
    int ActiveInvestmentsCount,
    decimal TotalInvestedAmount,
    decimal TotalEarnedInterest,
    decimal TotalPrincipalReturned,
    decimal TotalLossesFromDefaults,
    decimal NetReturn,
    DateTime CreatedAt);
