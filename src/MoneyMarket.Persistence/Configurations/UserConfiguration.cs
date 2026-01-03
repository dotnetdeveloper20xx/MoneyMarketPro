using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMarket.Domain.Entities;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id)
            .HasConversion(new UserIdConverter())
            .ValueGeneratedNever();

        builder.Property(u => u.Email)
            .HasConversion(
                email => email.Value,
                value => EmailAddress.Create(value))
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(u => u.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.OwnsOne(u => u.PhoneNumber, phone =>
        {
            phone.Property(p => p.CountryCode).HasMaxLength(5).HasColumnName("PhoneCountryCode");
            phone.Property(p => p.Number).HasMaxLength(20).HasColumnName("PhoneNumber");
        });

        // Map private _roles field
        builder.Property<string>("_roles")
            .HasColumnName("Roles")
            .HasMaxLength(200);

        builder.Ignore(u => u.Roles);

        builder.Property(u => u.IsActive)
            .HasDefaultValue(true);

        builder.Property(u => u.EmailConfirmed)
            .HasDefaultValue(false);

        builder.HasOne(u => u.BorrowerProfile)
            .WithOne(b => b.User)
            .HasForeignKey<BorrowerProfile>(b => b.UserId);

        builder.HasOne(u => u.LenderProfile)
            .WithOne(l => l.User)
            .HasForeignKey<LenderProfile>(l => l.UserId);

        builder.HasOne(u => u.Wallet)
            .WithOne(w => w.User)
            .HasForeignKey<Wallet>(w => w.UserId);

        builder.HasMany(u => u.RefreshTokens)
            .WithOne(rt => rt.User)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(u => !u.IsDeleted);

        builder.Ignore(u => u.DomainEvents);
    }
}
