using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.LoanApplications.Commands.CreateLoanApplication;

public record CreateLoanApplicationCommand(
    Guid BorrowerProfileId,
    decimal RequestedAmount,
    int TermMonths,
    LoanPurpose Purpose,
    string? PurposeDescription) : ICommand<Guid>;
