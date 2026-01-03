using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Persistence.Configurations;

public class LoanApplicationConfiguration : IEntityTypeConfiguration<LoanApplication>
{
    public void Configure(EntityTypeBuilder<LoanApplication> builder)
    {
        builder.ToTable("LoanApplications");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id)
            .HasConversion(new LoanApplicationIdConverter())
            .ValueGeneratedNever();

        builder.Property(a => a.BorrowerProfileId)
            .HasConversion(new BorrowerProfileIdConverter());

        builder.Property(a => a.LoanId)
            .HasConversion(new LoanIdConverter());

        builder.OwnsOne(a => a.RequestedAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RequestedAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("RequestedCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(a => a.Term, term =>
        {
            term.Property(t => t.Months).HasColumnName("RequestedTermMonths");
        });

        builder.Property(a => a.Purpose)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(a => a.PurposeDescription).HasMaxLength(1000);

        builder.Property(a => a.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(a => a.ReviewNotes).HasMaxLength(2000);
        builder.Property(a => a.RejectionReason).HasMaxLength(500);

        builder.OwnsOne(a => a.RiskGradeAtApplication, grade =>
        {
            grade.Property(g => g.Grade).HasColumnName("RiskGradeAtApplication").HasMaxLength(2);
            grade.Property(g => g.Score).HasColumnName("CreditScoreAtApplication");
        });

        builder.OwnsOne(a => a.ApprovedAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ApprovedAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("ApprovedCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(a => a.ApprovedInterestRate, rate =>
        {
            rate.Property(r => r.AnnualPercentage).HasColumnName("ApprovedInterestRate").HasPrecision(6, 4);
            rate.Property(r => r.Type).HasColumnName("ApprovedInterestRateType").HasConversion<string>().HasMaxLength(20);
        });

        builder.OwnsOne(a => a.ApprovedTerm, term =>
        {
            term.Property(t => t.Months).HasColumnName("ApprovedTermMonths");
        });

        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.SubmittedAt);

        builder.Ignore(a => a.DomainEvents);
    }
}
