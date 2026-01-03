using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.LoanApplications.Queries.GetLoanApplication;

public record GetLoanApplicationQuery(Guid ApplicationId) : IQuery<LoanApplicationDto>;

public record LoanApplicationDto(
    Guid Id,
    Guid BorrowerProfileId,
    string BorrowerName,
    decimal RequestedAmount,
    int TermMonths,
    LoanPurpose Purpose,
    string? PurposeDescription,
    LoanStatus Status,
    DateTime? SubmittedAt,
    int? CreditScoreAtApplication,
    string? RiskGradeAtApplication,
    decimal? DebtToIncomeRatioAtApplication,
    decimal? ApprovedAmount,
    decimal? ApprovedInterestRate,
    int? ApprovedTermMonths,
    Guid? ReviewedBy,
    DateTime? ReviewedAt,
    string? ReviewNotes,
    string? RejectionReason,
    Guid? LoanId,
    DateTime CreatedAt);
