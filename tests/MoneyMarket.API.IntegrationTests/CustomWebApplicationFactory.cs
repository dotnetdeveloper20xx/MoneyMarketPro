using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace MoneyMarket.API.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, config) =>
        {
            var testConfig = new Dictionary<string, string?>
            {
                { "Jwt:Secret", "TestSecretKeyForIntegrationTestsThatIsLongEnough123456!" },
                { "Jwt:Issuer", "MoneyMarket.Test" },
                { "Jwt:Audience", "MoneyMarket.Test" },
                { "Jwt:AccessTokenExpirationMinutes", "60" },
                { "Jwt:RefreshTokenExpirationDays", "7" },
                { "ConnectionStrings:DefaultConnection", "Server=(localdb)\\mssqllocaldb;Database=MoneyMarketTestDb;Trusted_Connection=True;MultipleActiveResultSets=true" }
            };

            config.AddInMemoryCollection(testConfig);
        });

        builder.UseEnvironment("Testing");
    }
}
