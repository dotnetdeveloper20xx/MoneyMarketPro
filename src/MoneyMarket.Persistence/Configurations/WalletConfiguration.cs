using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Persistence.Configurations;

public class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> builder)
    {
        builder.ToTable("Wallets");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id)
            .HasConversion(new WalletIdConverter())
            .ValueGeneratedNever();

        builder.Property(w => w.UserId)
            .HasConversion(new UserIdConverter());

        builder.OwnsOne(w => w.AvailableBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AvailableBalance").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("AvailableCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(w => w.PendingBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PendingBalance").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("PendingCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(w => w.ReservedBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ReservedBalance").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("ReservedCurrency").HasMaxLength(3);
        });

        builder.Property(w => w.LinkedBankAccountId).HasMaxLength(100);

        builder.HasMany(w => w.Transactions)
            .WithOne(t => t.Wallet)
            .HasForeignKey(t => t.WalletId);

        builder.Ignore(w => w.DomainEvents);
    }
}

public class WalletTransactionConfiguration : IEntityTypeConfiguration<WalletTransaction>
{
    public void Configure(EntityTypeBuilder<WalletTransaction> builder)
    {
        builder.ToTable("WalletTransactions");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.WalletId)
            .HasConversion(new WalletIdConverter());

        builder.Property(t => t.Type)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.OwnsOne(t => t.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("Currency").HasMaxLength(3);
        });

        builder.OwnsOne(t => t.BalanceAfter, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BalanceAfter").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("BalanceAfterCurrency").HasMaxLength(3);
        });

        builder.Property(t => t.Description).HasMaxLength(500);
        builder.Property(t => t.ExternalReference).HasMaxLength(100);

        builder.HasIndex(t => t.TransactionDate);
    }
}
