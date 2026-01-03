namespace MoneyMarket.Infrastructure.Configuration;

/// <summary>
/// Payment gateway configuration settings.
/// </summary>
public class PaymentSettings
{
    public const string SectionName = "Payment";

    public bool UseSandbox { get; set; } = true;
    public string? ApiKey { get; set; }
    public string? SecretKey { get; set; }
    public string? WebhookSecret { get; set; }
}
