using FluentAssertions;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Tests.ValueObjects;

public class RiskGradeTests
{
    [Theory]
    [InlineData(750, "A")]
    [InlineData(800, "A")]
    [InlineData(700, "B")]
    [InlineData(650, "C")]
    [InlineData(600, "D")]
    [InlineData(550, "E")]
    [InlineData(400, "F")]
    public void FromCreditScore_ShouldAssignCorrectGrade(int score, string expectedGrade)
    {
        // Act
        var riskGrade = RiskGrade.FromCreditScore(score);

        // Assert
        riskGrade.Grade.Should().Be(expectedGrade);
        riskGrade.Score.Should().Be(score);
    }

    [Fact]
    public void FromCreditScore_BelowMinimum_ShouldThrowException()
    {
        // Act
        var act = () => RiskGrade.FromCreditScore(299);

        // Assert
        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void FromCreditScore_AboveMaximum_ShouldThrowException()
    {
        // Act
        var act = () => RiskGrade.FromCreditScore(851);

        // Assert
        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Theory]
    [InlineData("A", false)]
    [InlineData("B", false)]
    [InlineData("C", false)]
    [InlineData("D", false)]
    [InlineData("E", true)]
    [InlineData("F", true)]
    public void IsHighRisk_ShouldReturnCorrectValue(string grade, bool expectedHighRisk)
    {
        // Arrange
        var riskGrade = RiskGrade.Create(grade, 600);

        // Assert
        riskGrade.IsHighRisk.Should().Be(expectedHighRisk);
    }

    [Theory]
    [InlineData("A", true)]
    [InlineData("B", true)]
    [InlineData("C", false)]
    [InlineData("D", false)]
    public void IsLowRisk_ShouldReturnCorrectValue(string grade, bool expectedLowRisk)
    {
        // Arrange
        var riskGrade = RiskGrade.Create(grade, 700);

        // Assert
        riskGrade.IsLowRisk.Should().Be(expectedLowRisk);
    }
}
