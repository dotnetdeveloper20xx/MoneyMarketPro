using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Persistence.Configurations;

public class BorrowerProfileConfiguration : IEntityTypeConfiguration<BorrowerProfile>
{
    public void Configure(EntityTypeBuilder<BorrowerProfile> builder)
    {
        builder.ToTable("BorrowerProfiles");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id)
            .HasConversion(new BorrowerProfileIdConverter())
            .ValueGeneratedNever();

        builder.Property(b => b.UserId)
            .HasConversion(new UserIdConverter());

        builder.Property(b => b.Ssn)
            .HasMaxLength(20);

        builder.OwnsOne(b => b.Address, address =>
        {
            address.Property(a => a.Street).HasMaxLength(200).HasColumnName("AddressStreet");
            address.Property(a => a.City).HasMaxLength(100).HasColumnName("AddressCity");
            address.Property(a => a.State).HasMaxLength(50).HasColumnName("AddressState");
            address.Property(a => a.PostalCode).HasMaxLength(20).HasColumnName("AddressPostalCode");
            address.Property(a => a.Country).HasMaxLength(50).HasColumnName("AddressCountry");
            address.Property(a => a.Unit).HasMaxLength(50).HasColumnName("AddressUnit");
        });

        builder.Property(b => b.EmploymentStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(b => b.EmployerName).HasMaxLength(200);
        builder.Property(b => b.JobTitle).HasMaxLength(100);

        builder.OwnsOne(b => b.AnnualIncome, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AnnualIncome").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("AnnualIncomeCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(b => b.MonthlyDebtPayments, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MonthlyDebtPayments").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("MonthlyDebtPaymentsCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(b => b.RiskGrade, grade =>
        {
            grade.Property(g => g.Grade).HasColumnName("RiskGrade").HasMaxLength(2);
            grade.Property(g => g.Score).HasColumnName("RiskScore");
        });

        builder.Property(b => b.KycStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(b => b.KycVerificationId).HasMaxLength(100);

        builder.Property(b => b.IncomeVerificationStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.OwnsOne(b => b.TotalBorrowedAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalBorrowedAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalBorrowedCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(b => b.TotalRepaidAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalRepaidAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalRepaidCurrency").HasMaxLength(3);
        });

        builder.HasMany(b => b.LoanApplications)
            .WithOne(a => a.BorrowerProfile)
            .HasForeignKey(a => a.BorrowerProfileId);
    }
}
