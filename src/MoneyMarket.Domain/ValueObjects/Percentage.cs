using MoneyMarket.Domain.Common;

namespace MoneyMarket.Domain.ValueObjects;

public sealed class Percentage : ValueObject
{
    public decimal Value { get; }

    private Percentage(decimal value)
    {
        Value = value;
    }

    public static Percentage Create(decimal value)
    {
        if (value < 0 || value > 100)
            throw new ArgumentOutOfRangeException(nameof(value), "Percentage must be between 0 and 100.");

        return new Percentage(Math.Round(value, 4));
    }

    public static Percentage FromDecimal(decimal decimalValue)
    {
        if (decimalValue < 0 || decimalValue > 1)
            throw new ArgumentOutOfRangeException(nameof(decimalValue), "Decimal value must be between 0 and 1.");

        return new Percentage(Math.Round(decimalValue * 100, 4));
    }

    public decimal ToDecimal() => Value / 100;

    public Money ApplyTo(Money amount)
    {
        return Money.Create(Math.Round(amount.Amount * ToDecimal(), 2), amount.Currency);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => $"{Value:F2}%";

    public static Percentage operator +(Percentage left, Percentage right) =>
        Create(left.Value + right.Value);

    public static Percentage operator -(Percentage left, Percentage right) =>
        Create(left.Value - right.Value);
}
