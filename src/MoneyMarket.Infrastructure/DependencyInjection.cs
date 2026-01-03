using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Infrastructure.Configuration;
using MoneyMarket.Infrastructure.Services;

namespace MoneyMarket.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure settings
        services.Configure<EmailSettings>(
            configuration.GetSection(EmailSettings.SectionName));
        services.Configure<PaymentSettings>(
            configuration.GetSection(PaymentSettings.SectionName));
        services.Configure<JwtSettings>(
            configuration.GetSection(JwtSettings.SectionName));

        // Register services
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IPaymentGateway, PaymentGatewayService>();
        services.AddScoped<ICreditScoreService, CreditScoreService>();
        services.AddScoped<IKycVerificationService, KycVerificationService>();

        // Auth services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();

        // Add HTTP context accessor for current user service
        services.AddHttpContextAccessor();

        // Configure JWT Authentication
        var jwtSettings = configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
            ?? new JwtSettings();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers["Token-Expired"] = "true";
                    }
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization(options =>
        {
            // Role-based policies
            options.AddPolicy("BorrowerOnly", policy =>
                policy.RequireRole("Borrower"));

            options.AddPolicy("LenderOnly", policy =>
                policy.RequireRole("Lender"));

            options.AddPolicy("BorrowerOrLender", policy =>
                policy.RequireRole("Borrower", "Lender"));

            options.AddPolicy("Staff", policy =>
                policy.RequireRole("CRM", "Admin", "Support"));

            options.AddPolicy("CrmOrAdmin", policy =>
                policy.RequireRole("CRM", "Admin"));

            options.AddPolicy("AdminOnly", policy =>
                policy.RequireRole("Admin"));

            options.AddPolicy("SupportOrAbove", policy =>
                policy.RequireRole("Support", "CRM", "Admin"));
        });

        return services;
    }
}
