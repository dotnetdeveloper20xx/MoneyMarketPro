using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Loans.Commands.FundLoan;

public record FundLoanCommand(
    Guid LoanId,
    Guid LenderProfileId,
    decimal Amount) : ICommand<Guid>;
