using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Persistence.Configurations;

/// <summary>
/// Value converter for Money value object.
/// Stores as decimal with USD as default currency.
/// </summary>
public class MoneyConverter : ValueConverter<Money, decimal>
{
    public MoneyConverter()
        : base(
            v => v.Amount,
            v => Money.Create(v, "USD"))
    {
    }
}

/// <summary>
/// Composite converter for Money that handles both amount and currency.
/// </summary>
public static class MoneyConfiguration
{
    public static void ConfigureMoneyProperty(
        this Microsoft.EntityFrameworkCore.Metadata.Builders.PropertyBuilder<Money> builder)
    {
        builder.HasConversion(new MoneyConverter())
            .HasPrecision(18, 2);
    }
}
