using Microsoft.Extensions.Logging;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Infrastructure.Services;

/// <summary>
/// Notification service implementation.
/// Handles in-app notifications, push notifications, etc.
/// </summary>
public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(ILogger<NotificationService> logger)
    {
        _logger = logger;
    }

    public async Task SendNotificationAsync(
        Guid userId,
        NotificationType type,
        string title,
        string message,
        object? data = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Sending notification to user {UserId}: [{Type}] {Title} - {Message}",
            userId,
            type,
            title,
            message);

        // TODO: Implement actual notification delivery
        // - Store in database for in-app notifications
        // - Send push notification via Azure Notification Hubs
        // - Trigger real-time update via SignalR

        await Task.CompletedTask;
    }

    public async Task SendBulkNotificationAsync(
        IEnumerable<Guid> userIds,
        NotificationType type,
        string title,
        string message,
        object? data = null,
        CancellationToken cancellationToken = default)
    {
        var userIdList = userIds.ToList();

        _logger.LogInformation(
            "Sending bulk notification to {Count} users: [{Type}] {Title}",
            userIdList.Count,
            type,
            title);

        foreach (var userId in userIdList)
        {
            await SendNotificationAsync(userId, type, title, message, data, cancellationToken);
        }
    }
}
