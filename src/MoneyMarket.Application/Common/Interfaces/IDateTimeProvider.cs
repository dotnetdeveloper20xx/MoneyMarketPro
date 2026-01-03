namespace MoneyMarket.Application.Common.Interfaces;

/// <summary>
/// Abstraction for datetime operations to enable testability.
/// </summary>
public interface IDateTimeProvider
{
    /// <summary>
    /// Gets the current UTC date and time.
    /// </summary>
    DateTime UtcNow { get; }

    /// <summary>
    /// Gets the current date in UTC.
    /// </summary>
    DateOnly Today { get; }
}
