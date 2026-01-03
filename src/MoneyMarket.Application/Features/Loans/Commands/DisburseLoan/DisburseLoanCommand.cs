using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Loans.Commands.DisburseLoan;

public record DisburseLoanCommand(Guid LoanId) : ICommand;
