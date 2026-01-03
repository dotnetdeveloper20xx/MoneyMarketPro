using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Wallets.Queries.GetTransactionHistory;

public record GetTransactionHistoryQuery(
    Guid UserId,
    TransactionType? Type = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    int Page = 1,
    int PageSize = 20) : IQuery<TransactionHistoryDto>;

public record TransactionHistoryDto(
    List<WalletTransactionDto> Transactions,
    int TotalCount,
    int Page,
    int PageSize);

public record WalletTransactionDto(
    Guid Id,
    decimal Amount,
    TransactionType Type,
    string Description,
    string? Reference,
    decimal BalanceAfter,
    DateTime CreatedAt);
