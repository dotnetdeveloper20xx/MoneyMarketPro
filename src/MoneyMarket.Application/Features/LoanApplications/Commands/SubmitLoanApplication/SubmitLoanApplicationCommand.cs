using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.LoanApplications.Commands.SubmitLoanApplication;

public record SubmitLoanApplicationCommand(Guid ApplicationId) : ICommand;
