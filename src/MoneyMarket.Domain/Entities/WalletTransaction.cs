using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents a transaction in a user's wallet.
/// </summary>
public class WalletTransaction : Entity<Guid>, IAuditableEntity
{
    public WalletId WalletId { get; private set; } = null!;
    public Wallet Wallet { get; private set; } = null!;

    public TransactionType Type { get; private set; }
    public Money Amount { get; private set; } = null!;
    public Money BalanceAfter { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public string? ExternalReference { get; private set; }
    public DateTime TransactionDate { get; private set; }

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    private WalletTransaction() { }

    internal static WalletTransaction Create(
        WalletId walletId,
        TransactionType type,
        Money amount,
        Money balanceAfter,
        string description,
        string? externalReference = null)
    {
        return new WalletTransaction
        {
            Id = Guid.NewGuid(),
            WalletId = walletId,
            Type = type,
            Amount = amount,
            BalanceAfter = balanceAfter,
            Description = description,
            ExternalReference = externalReference,
            TransactionDate = DateTime.UtcNow
        };
    }

    public bool IsCredit => Amount.IsPositive;
    public bool IsDebit => Amount.IsNegative;
}
