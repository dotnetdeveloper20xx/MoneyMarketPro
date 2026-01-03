using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Borrowers.Queries.GetBorrowerProfile;

public record BorrowerProfileDto(
    Guid Id,
    Guid UserId,
    string FullName,
    string Email,
    AddressDto? Address,
    EmploymentStatus EmploymentStatus,
    string? EmployerName,
    string? JobTitle,
    int? YearsEmployed,
    decimal? AnnualIncome,
    decimal? MonthlyDebtPayments,
    decimal? DebtToIncomeRatio,
    int? CreditScore,
    string? RiskGrade,
    VerificationStatus KycStatus,
    VerificationStatus IncomeVerificationStatus,
    int TotalLoansCount,
    int ActiveLoansCount,
    decimal TotalBorrowedAmount,
    decimal TotalRepaidAmount,
    bool IsEligibleForLoan,
    DateTime CreatedAt);

public record AddressDto(
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country,
    string? Unit);
