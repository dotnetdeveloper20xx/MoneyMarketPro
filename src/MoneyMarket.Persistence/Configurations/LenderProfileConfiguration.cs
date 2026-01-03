using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Persistence.Configurations;

public class LenderProfileConfiguration : IEntityTypeConfiguration<LenderProfile>
{
    public void Configure(EntityTypeBuilder<LenderProfile> builder)
    {
        builder.ToTable("LenderProfiles");

        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id)
            .HasConversion(new LenderProfileIdConverter())
            .ValueGeneratedNever();

        builder.Property(l => l.UserId)
            .HasConversion(new UserIdConverter());

        builder.Property(l => l.AccreditationStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.OwnsOne(l => l.MinInvestmentAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MinInvestmentAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("MinInvestmentCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.MaxInvestmentAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MaxInvestmentAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("MaxInvestmentCurrency").HasMaxLength(3);
        });

        builder.Property(l => l.PreferredRiskGrades).HasMaxLength(50);

        builder.OwnsOne(l => l.TotalInvestedAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalInvestedAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalInvestedCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.TotalEarnedInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalEarnedInterest").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalEarnedInterestCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.TotalPrincipalReturned, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalPrincipalReturned").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalPrincipalReturnedCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.TotalLossesFromDefaults, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalLossesFromDefaults").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalLossesCurrency").HasMaxLength(3);
        });

        builder.HasMany(l => l.Investments)
            .WithOne(f => f.LenderProfile)
            .HasForeignKey(f => f.LenderProfileId);
    }
}
