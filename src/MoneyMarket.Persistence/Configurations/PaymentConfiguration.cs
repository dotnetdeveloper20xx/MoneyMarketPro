using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasConversion(new PaymentIdConverter())
            .ValueGeneratedNever();

        builder.Property(p => p.LoanId)
            .HasConversion(new LoanIdConverter());

        builder.Property(p => p.BorrowerProfileId)
            .HasConversion(new BorrowerProfileIdConverter());

        builder.OwnsOne(p => p.TotalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("Currency").HasMaxLength(3);
        });

        builder.OwnsOne(p => p.PrincipalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PrincipalAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("PrincipalCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(p => p.InterestAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("InterestAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("InterestCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(p => p.LateFeeAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("LateFeeAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("LateFeeCurrency").HasMaxLength(3);
        });

        builder.Property(p => p.Method)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(p => p.ExternalReference).HasMaxLength(100);
        builder.Property(p => p.TransactionId).HasMaxLength(100);
        builder.Property(p => p.FailureReason).HasMaxLength(500);

        builder.HasIndex(p => p.LoanId);
        builder.HasIndex(p => p.PaymentDate);
        builder.HasIndex(p => p.Status);
    }
}

public class PaymentScheduleConfiguration : IEntityTypeConfiguration<PaymentSchedule>
{
    public void Configure(EntityTypeBuilder<PaymentSchedule> builder)
    {
        builder.ToTable("PaymentSchedules");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.LoanId)
            .HasConversion(new LoanIdConverter());

        builder.Property(s => s.PaymentId)
            .HasConversion(new PaymentIdConverter());

        builder.OwnsOne(s => s.PrincipalDue, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PrincipalDue").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("PrincipalDueCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(s => s.InterestDue, money =>
        {
            money.Property(m => m.Amount).HasColumnName("InterestDue").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("InterestDueCurrency").HasMaxLength(3);
        });

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasIndex(s => s.LoanId);
        builder.HasIndex(s => s.DueDate);
        builder.HasIndex(s => s.Status);
    }
}
