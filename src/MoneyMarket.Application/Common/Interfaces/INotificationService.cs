using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Common.Interfaces;

/// <summary>
/// Service for sending notifications to users.
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Sends a notification to a specific user.
    /// </summary>
    Task SendNotificationAsync(
        Guid userId,
        NotificationType type,
        string title,
        string message,
        object? data = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notifications to multiple users.
    /// </summary>
    Task SendBulkNotificationAsync(
        IEnumerable<Guid> userIds,
        NotificationType type,
        string title,
        string message,
        object? data = null,
        CancellationToken cancellationToken = default);
}
