using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Infrastructure.Services;

/// <summary>
/// Default implementation of IDateTimeProvider.
/// </summary>
public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;

    public DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);
}
