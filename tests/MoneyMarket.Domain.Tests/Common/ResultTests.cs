using FluentAssertions;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Domain.Tests.Common;

public class ResultTests
{
    [Fact]
    public void Success_ShouldCreateSuccessfulResult()
    {
        // Act
        var result = Result.Success();

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
        result.Error.Should().Be(Error.None);
    }

    [Fact]
    public void Failure_ShouldCreateFailedResult()
    {
        // Arrange
        var error = new Error("Test.Error", "Test error message");

        // Act
        var result = Result.Failure(error);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(error);
    }

    [Fact]
    public void SuccessWithValue_ShouldCreateSuccessfulResultWithValue()
    {
        // Act
        var result = Result.Success(42);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(42);
    }

    [Fact]
    public void FailureWithValue_AccessingValue_ShouldThrowException()
    {
        // Arrange
        var error = new Error("Test.Error", "Test error");
        var result = Result.Failure<int>(error);

        // Act
        var act = () => result.Value;

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*failed result*");
    }

    [Fact]
    public void ImplicitConversion_ValueToResult_ShouldWork()
    {
        // Act
        Result<string> result = "test value";

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be("test value");
    }
}
