using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Borrowers.Commands.UpdateBorrowerProfile;

public record UpdateBorrowerProfileCommand(
    Guid BorrowerProfileId,
    string? Ssn,
    string? Street,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    EmploymentStatus EmploymentStatus,
    string? EmployerName,
    string? JobTitle,
    int? YearsEmployed,
    decimal? AnnualIncome,
    decimal? MonthlyDebtPayments) : ICommand;
