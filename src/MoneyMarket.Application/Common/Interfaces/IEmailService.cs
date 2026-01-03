namespace MoneyMarket.Application.Common.Interfaces;

/// <summary>
/// Service for sending email notifications.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email asynchronously.
    /// </summary>
    Task SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an email using a template.
    /// </summary>
    Task SendTemplatedEmailAsync(
        string to,
        string templateName,
        object templateData,
        CancellationToken cancellationToken = default);
}
