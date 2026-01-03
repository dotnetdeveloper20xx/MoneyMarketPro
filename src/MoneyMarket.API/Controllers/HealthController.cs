using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MoneyMarket.API.Controllers;

/// <summary>
/// Health check endpoint for monitoring.
/// </summary>
[AllowAnonymous]
public class HealthController : ApiControllerBase
{
    /// <summary>
    /// Returns the health status of the API.
    /// </summary>
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0"
        });
    }
}
