using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Infrastructure.Configuration;

namespace MoneyMarket.Infrastructure.Services;

/// <summary>
/// Email service implementation.
/// In development, logs emails. In production, sends via configured provider.
/// </summary>
public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly EmailSettings _settings;

    public EmailService(
        ILogger<EmailService> logger,
        IOptions<EmailSettings> settings)
    {
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default)
    {
        // In development, just log the email
        if (_settings.UseDevelopmentMode)
        {
            _logger.LogInformation(
                "Development Email - To: {To}, Subject: {Subject}, Body: {Body}",
                to,
                subject,
                body);
            return;
        }

        // TODO: Implement actual email sending via SendGrid, Azure Communication Services, etc.
        _logger.LogInformation("Sending email to {To} with subject {Subject}", to, subject);

        await Task.CompletedTask;
    }

    public async Task SendTemplatedEmailAsync(
        string to,
        string templateName,
        object templateData,
        CancellationToken cancellationToken = default)
    {
        // In development, just log the template request
        if (_settings.UseDevelopmentMode)
        {
            _logger.LogInformation(
                "Development Templated Email - To: {To}, Template: {Template}, Data: {@Data}",
                to,
                templateName,
                templateData);
            return;
        }

        // TODO: Implement template resolution and email sending
        _logger.LogInformation(
            "Sending templated email to {To} using template {Template}",
            to,
            templateName);

        await Task.CompletedTask;
    }
}
