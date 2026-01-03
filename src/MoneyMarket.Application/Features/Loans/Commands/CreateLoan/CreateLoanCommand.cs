using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Loans.Commands.CreateLoan;

public record CreateLoanCommand(
    Guid ApplicationId,
    int FundingDeadlineDays = 30) : ICommand<Guid>;
