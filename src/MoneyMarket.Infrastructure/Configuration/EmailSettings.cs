namespace MoneyMarket.Infrastructure.Configuration;

/// <summary>
/// Email service configuration settings.
/// </summary>
public class EmailSettings
{
    public const string SectionName = "Email";

    public bool UseDevelopmentMode { get; set; } = true;
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public string? FromEmail { get; set; }
    public string? FromName { get; set; }
    public bool EnableSsl { get; set; } = true;
}
