using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Wallets.Queries.GetWalletBalance;

public record GetWalletBalanceQuery(Guid UserId) : IQuery<WalletBalanceDto>;

public record WalletBalanceDto(
    Guid WalletId,
    Guid UserId,
    decimal AvailableBalance,
    decimal PendingBalance,
    decimal ReservedBalance,
    decimal TotalBalance,
    DateTime LastUpdatedAt);
