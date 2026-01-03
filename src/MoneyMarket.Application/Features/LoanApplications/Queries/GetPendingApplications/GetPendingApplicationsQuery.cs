using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.LoanApplications.Queries.GetPendingApplications;

public record GetPendingApplicationsQuery(
    LoanStatus? Status = null,
    int Page = 1,
    int PageSize = 20) : IQuery<PendingApplicationsDto>;

public record PendingApplicationsDto(
    List<ApplicationSummaryDto> Applications,
    int TotalCount,
    int Page,
    int PageSize);

public record ApplicationSummaryDto(
    Guid Id,
    string BorrowerName,
    decimal RequestedAmount,
    int TermMonths,
    LoanPurpose Purpose,
    LoanStatus Status,
    int? CreditScore,
    string? RiskGrade,
    DateTime? SubmittedAt,
    DateTime CreatedAt);
