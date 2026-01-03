using FluentAssertions;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Tests.ValueObjects;

public class MoneyTests
{
    [Fact]
    public void Create_WithValidAmount_ShouldCreateMoney()
    {
        // Act
        var money = Money.Create(100.50m, "USD");

        // Assert
        money.Amount.Should().Be(100.50m);
        money.Currency.Should().Be("USD");
    }

    [Fact]
    public void Create_WithNegativeAmount_ShouldThrowException()
    {
        // Act
        var act = () => Money.Create(-50m);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*cannot be negative*");
    }

    [Fact]
    public void Add_TwoMoneyValues_ShouldReturnSum()
    {
        // Arrange
        var money1 = Money.Create(100m, "USD");
        var money2 = Money.Create(50m, "USD");

        // Act
        var result = money1.Add(money2);

        // Assert
        result.Amount.Should().Be(150m);
    }

    [Fact]
    public void Add_DifferentCurrencies_ShouldThrowException()
    {
        // Arrange
        var usd = Money.Create(100m, "USD");
        var eur = Money.Create(50m, "EUR");

        // Act
        var act = () => usd.Add(eur);

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*different currencies*");
    }

    [Fact]
    public void Subtract_TwoMoneyValues_ShouldReturnDifference()
    {
        // Arrange
        var money1 = Money.Create(100m, "USD");
        var money2 = Money.Create(30m, "USD");

        // Act
        var result = money1.Subtract(money2);

        // Assert
        result.Amount.Should().Be(70m);
    }

    [Fact]
    public void IsGreaterThan_WhenGreater_ShouldReturnTrue()
    {
        // Arrange
        var money1 = Money.Create(100m, "USD");
        var money2 = Money.Create(50m, "USD");

        // Act & Assert
        money1.IsGreaterThan(money2).Should().BeTrue();
        (money1 > money2).Should().BeTrue();
    }

    [Fact]
    public void Zero_ShouldCreateZeroAmount()
    {
        // Act
        var zero = Money.Zero();

        // Assert
        zero.IsZero.Should().BeTrue();
        zero.Amount.Should().Be(0m);
    }

    [Fact]
    public void Equality_SameValues_ShouldBeEqual()
    {
        // Arrange
        var money1 = Money.Create(100m, "USD");
        var money2 = Money.Create(100m, "USD");

        // Assert
        money1.Should().Be(money2);
    }
}
