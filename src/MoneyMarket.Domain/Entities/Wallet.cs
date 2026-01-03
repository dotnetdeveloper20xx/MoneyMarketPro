using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents a user's wallet for managing funds.
/// </summary>
public class Wallet : AggregateRoot<WalletId>, IAuditableEntity
{
    public UserId UserId { get; private set; } = null!;
    public User User { get; private set; } = null!;

    public Money AvailableBalance { get; private set; } = Money.Zero();
    public Money PendingBalance { get; private set; } = Money.Zero();
    public Money ReservedBalance { get; private set; } = Money.Zero();

    public string? LinkedBankAccountId { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<WalletTransaction> _transactions = new();
    public IReadOnlyCollection<WalletTransaction> Transactions => _transactions.AsReadOnly();

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    private Wallet() { }

    public static Wallet Create(UserId userId, string currency = "USD")
    {
        return new Wallet
        {
            Id = WalletId.Create(),
            UserId = userId,
            AvailableBalance = Money.Zero(currency),
            PendingBalance = Money.Zero(currency),
            ReservedBalance = Money.Zero(currency),
            IsActive = true
        };
    }

    public Money TotalBalance => AvailableBalance.Add(PendingBalance).Add(ReservedBalance);

    public Result<WalletTransaction> Deposit(Money amount, string description, string? externalReference = null)
    {
        if (!amount.IsPositive)
            return Result.Failure<WalletTransaction>(new Error("Wallet.InvalidAmount", "Deposit amount must be positive."));

        AvailableBalance = AvailableBalance.Add(amount);

        var transaction = WalletTransaction.Create(
            Id,
            TransactionType.Deposit,
            amount,
            AvailableBalance,
            description,
            externalReference);

        _transactions.Add(transaction);

        return Result.Success(transaction);
    }

    public Result<WalletTransaction> Withdraw(Money amount, string description, string? externalReference = null)
    {
        if (!amount.IsPositive)
            return Result.Failure<WalletTransaction>(new Error("Wallet.InvalidAmount", "Withdrawal amount must be positive."));

        if (AvailableBalance < amount)
            return Result.Failure<WalletTransaction>(DomainErrors.Lender.InsufficientFunds);

        AvailableBalance = AvailableBalance.Subtract(amount);

        var transaction = WalletTransaction.Create(
            Id,
            TransactionType.Withdrawal,
            amount.Multiply(-1),
            AvailableBalance,
            description,
            externalReference);

        _transactions.Add(transaction);

        return Result.Success(transaction);
    }

    public Result Reserve(Money amount)
    {
        if (!amount.IsPositive)
            return Result.Failure(new Error("Wallet.InvalidAmount", "Reserve amount must be positive."));

        if (AvailableBalance < amount)
            return Result.Failure(DomainErrors.Lender.InsufficientFunds);

        AvailableBalance = AvailableBalance.Subtract(amount);
        ReservedBalance = ReservedBalance.Add(amount);

        return Result.Success();
    }

    public Result ReleaseReservation(Money amount)
    {
        if (!amount.IsPositive)
            return Result.Failure(new Error("Wallet.InvalidAmount", "Release amount must be positive."));

        if (ReservedBalance < amount)
            return Result.Failure(new Error("Wallet.InsufficientReserved", "Insufficient reserved balance."));

        ReservedBalance = ReservedBalance.Subtract(amount);
        AvailableBalance = AvailableBalance.Add(amount);

        return Result.Success();
    }

    public Result<WalletTransaction> CommitReservation(
        Money amount,
        TransactionType type,
        string description,
        string? reference = null)
    {
        if (ReservedBalance < amount)
            return Result.Failure<WalletTransaction>(new Error("Wallet.InsufficientReserved", "Insufficient reserved balance."));

        ReservedBalance = ReservedBalance.Subtract(amount);

        var transaction = WalletTransaction.Create(
            Id,
            type,
            amount.Multiply(-1),
            AvailableBalance,
            description,
            reference);

        _transactions.Add(transaction);

        return Result.Success(transaction);
    }

    public Result<WalletTransaction> Credit(
        Money amount,
        TransactionType type,
        string description,
        string? reference = null)
    {
        if (!amount.IsPositive)
            return Result.Failure<WalletTransaction>(new Error("Wallet.InvalidAmount", "Credit amount must be positive."));

        AvailableBalance = AvailableBalance.Add(amount);

        var transaction = WalletTransaction.Create(
            Id,
            type,
            amount,
            AvailableBalance,
            description,
            reference);

        _transactions.Add(transaction);

        return Result.Success(transaction);
    }

    public void LinkBankAccount(string bankAccountId)
    {
        LinkedBankAccountId = bankAccountId;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
