using MoneyMarket.Domain.Common;

namespace MoneyMarket.Domain.ValueObjects;

public sealed class LoanTerm : ValueObject
{
    public int Months { get; }

    private LoanTerm(int months)
    {
        Months = months;
    }

    public static LoanTerm Create(int months)
    {
        if (months <= 0)
            throw new ArgumentOutOfRangeException(nameof(months), "Loan term must be at least 1 month.");

        if (months > 360) // 30 years max
            throw new ArgumentOutOfRangeException(nameof(months), "Loan term cannot exceed 360 months (30 years).");

        return new LoanTerm(months);
    }

    public static LoanTerm FromYears(int years) => Create(years * 12);

    public int Years => Months / 12;
    public int RemainingMonths => Months % 12;

    public DateTime CalculateEndDate(DateTime startDate) => startDate.AddMonths(Months);

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Months;
    }

    public override string ToString()
    {
        if (Years > 0 && RemainingMonths > 0)
            return $"{Years} year(s) {RemainingMonths} month(s)";
        if (Years > 0)
            return $"{Years} year(s)";
        return $"{Months} month(s)";
    }
}
