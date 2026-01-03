using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Persistence.Configurations;

public class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> builder)
    {
        builder.ToTable("Loans");

        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id)
            .HasConversion(new LoanIdConverter())
            .ValueGeneratedNever();

        builder.Property(l => l.ApplicationId)
            .HasConversion(new LoanApplicationIdConverter());

        builder.Property(l => l.BorrowerProfileId)
            .HasConversion(new BorrowerProfileIdConverter());

        // Money value objects
        builder.OwnsOne(l => l.PrincipalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PrincipalAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("PrincipalCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.TotalInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalInterest").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("InterestCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.TotalRepaymentAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalRepaymentAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("RepaymentCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.MonthlyPaymentAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MonthlyPaymentAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("MonthlyPaymentCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.FundedAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("FundedAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("FundedCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.OutstandingPrincipal, money =>
        {
            money.Property(m => m.Amount).HasColumnName("OutstandingPrincipal").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("OutstandingPrincipalCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.OutstandingInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("OutstandingInterest").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("OutstandingInterestCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.TotalPaidPrincipal, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalPaidPrincipal").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalPaidPrincipalCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.TotalPaidInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalPaidInterest").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalPaidInterestCurrency").HasMaxLength(3);
        });

        // Interest Rate value object
        builder.OwnsOne(l => l.InterestRate, rate =>
        {
            rate.Property(r => r.AnnualPercentage).HasColumnName("InterestRate").HasPrecision(6, 4);
            rate.Property(r => r.Type).HasColumnName("InterestRateType").HasConversion<string>().HasMaxLength(20);
        });

        // Loan Term value object
        builder.OwnsOne(l => l.Term, term =>
        {
            term.Property(t => t.Months).HasColumnName("TermMonths");
        });

        // Risk Grade value object
        builder.OwnsOne(l => l.RiskGrade, grade =>
        {
            grade.Property(g => g.Grade).HasColumnName("RiskGrade").HasMaxLength(2);
            grade.Property(g => g.Score).HasColumnName("RiskScore");
        });

        builder.Property(l => l.Purpose)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(l => l.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        // Relationships
        builder.HasOne(l => l.Application)
            .WithOne(a => a.Loan)
            .HasForeignKey<Loan>(l => l.ApplicationId);

        builder.HasOne(l => l.BorrowerProfile)
            .WithMany(b => b.Loans)
            .HasForeignKey(l => l.BorrowerProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(l => l.Fundings)
            .WithOne(f => f.Loan)
            .HasForeignKey(f => f.LoanId);

        builder.HasMany(l => l.Payments)
            .WithOne(p => p.Loan)
            .HasForeignKey(p => p.LoanId);

        builder.HasMany(l => l.PaymentSchedule)
            .WithOne(s => s.Loan)
            .HasForeignKey(s => s.LoanId);

        builder.HasQueryFilter(l => !l.IsDeleted);

        builder.Ignore(l => l.DomainEvents);
    }
}
