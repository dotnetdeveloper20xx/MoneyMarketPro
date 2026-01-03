using MoneyMarket.Domain.Common;

namespace MoneyMarket.Domain.ValueObjects;

public sealed class InterestRate : ValueObject
{
    public decimal AnnualPercentage { get; }
    public InterestRateType Type { get; }

    private InterestRate(decimal annualPercentage, InterestRateType type)
    {
        AnnualPercentage = annualPercentage;
        Type = type;
    }

    public static InterestRate Create(decimal annualPercentage, InterestRateType type = InterestRateType.Fixed)
    {
        if (annualPercentage < 0 || annualPercentage > 100)
            throw new ArgumentOutOfRangeException(nameof(annualPercentage), "Interest rate must be between 0 and 100 percent.");

        return new InterestRate(Math.Round(annualPercentage, 4), type);
    }

    public decimal MonthlyRate => AnnualPercentage / 12 / 100;
    public decimal DailyRate => AnnualPercentage / 365 / 100;
    public decimal DecimalRate => AnnualPercentage / 100;

    public Money CalculateMonthlyInterest(Money principal)
    {
        return Money.Create(Math.Round(principal.Amount * MonthlyRate, 2), principal.Currency);
    }

    public Money CalculateAnnualInterest(Money principal)
    {
        return Money.Create(Math.Round(principal.Amount * DecimalRate, 2), principal.Currency);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return AnnualPercentage;
        yield return Type;
    }

    public override string ToString() => $"{AnnualPercentage:F2}% {Type}";
}

public enum InterestRateType
{
    Fixed,
    Variable
}
