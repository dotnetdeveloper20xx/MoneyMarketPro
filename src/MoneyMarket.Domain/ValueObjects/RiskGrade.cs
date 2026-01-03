using MoneyMarket.Domain.Common;

namespace MoneyMarket.Domain.ValueObjects;

public sealed class RiskGrade : ValueObject
{
    public string Grade { get; }
    public int Score { get; }

    private static readonly Dictionary<string, (int MinScore, int MaxScore, decimal MinRate, decimal MaxRate)> GradeDefinitions = new()
    {
        ["A"] = (750, 850, 5.0m, 8.0m),
        ["B"] = (700, 749, 8.0m, 12.0m),
        ["C"] = (650, 699, 12.0m, 16.0m),
        ["D"] = (600, 649, 16.0m, 20.0m),
        ["E"] = (550, 599, 20.0m, 25.0m),
        ["F"] = (300, 549, 25.0m, 30.0m)
    };

    private RiskGrade(string grade, int score)
    {
        Grade = grade;
        Score = score;
    }

    public static RiskGrade Create(string grade, int score)
    {
        var normalizedGrade = grade.ToUpperInvariant();

        if (!GradeDefinitions.ContainsKey(normalizedGrade))
            throw new ArgumentException($"Invalid risk grade: {grade}. Valid grades are A, B, C, D, E, F.", nameof(grade));

        if (score < 300 || score > 850)
            throw new ArgumentOutOfRangeException(nameof(score), "Credit score must be between 300 and 850.");

        return new RiskGrade(normalizedGrade, score);
    }

    public static RiskGrade FromCreditScore(int creditScore)
    {
        if (creditScore < 300 || creditScore > 850)
            throw new ArgumentOutOfRangeException(nameof(creditScore), "Credit score must be between 300 and 850.");

        var grade = GradeDefinitions
            .First(g => creditScore >= g.Value.MinScore && creditScore <= g.Value.MaxScore)
            .Key;

        return new RiskGrade(grade, creditScore);
    }

    public decimal SuggestedMinInterestRate => GradeDefinitions[Grade].MinRate;
    public decimal SuggestedMaxInterestRate => GradeDefinitions[Grade].MaxRate;

    public bool IsHighRisk => Grade is "E" or "F";
    public bool IsLowRisk => Grade is "A" or "B";

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Grade;
        yield return Score;
    }

    public override string ToString() => $"Grade {Grade} (Score: {Score})";
}
