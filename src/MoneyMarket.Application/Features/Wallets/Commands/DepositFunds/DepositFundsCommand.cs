using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Wallets.Commands.DepositFunds;

public record DepositFundsCommand(
    Guid UserId,
    decimal Amount,
    string? Reference = null) : ICommand<Guid>;
