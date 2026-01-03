using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Wallets.Commands.WithdrawFunds;

public record WithdrawFundsCommand(
    Guid UserId,
    decimal Amount,
    string? BankAccountReference = null) : ICommand<Guid>;
