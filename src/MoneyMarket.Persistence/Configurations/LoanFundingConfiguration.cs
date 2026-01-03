using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Persistence.Configurations;

public class LoanFundingConfiguration : IEntityTypeConfiguration<LoanFunding>
{
    public void Configure(EntityTypeBuilder<LoanFunding> builder)
    {
        builder.ToTable("LoanFundings");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id)
            .HasConversion(new LoanFundingIdConverter())
            .ValueGeneratedNever();

        builder.Property(f => f.LoanId)
            .HasConversion(new LoanIdConverter());

        builder.Property(f => f.LenderProfileId)
            .HasConversion(new LenderProfileIdConverter());

        builder.OwnsOne(f => f.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("Currency").HasMaxLength(3);
        });

        builder.OwnsOne(f => f.InterestRate, rate =>
        {
            rate.Property(r => r.AnnualPercentage).HasColumnName("InterestRate").HasPrecision(6, 4);
            rate.Property(r => r.Type).HasColumnName("InterestRateType").HasConversion<string>().HasMaxLength(20);
        });

        builder.OwnsOne(f => f.ExpectedInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ExpectedInterest").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("ExpectedInterestCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(f => f.ExpectedTotal, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ExpectedTotal").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("ExpectedTotalCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(f => f.ReceivedPrincipal, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ReceivedPrincipal").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("ReceivedPrincipalCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(f => f.ReceivedInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ReceivedInterest").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("ReceivedInterestCurrency").HasMaxLength(3);
        });

        builder.Property(f => f.SharePercentage).HasPrecision(8, 4);

        builder.HasIndex(f => f.LoanId);
        builder.HasIndex(f => f.LenderProfileId);
    }
}
