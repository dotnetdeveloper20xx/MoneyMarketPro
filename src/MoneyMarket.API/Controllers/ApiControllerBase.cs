using MediatR;
using Microsoft.AspNetCore.Mvc;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.API.Controllers;

/// <summary>
/// Base controller providing common functionality for all API controllers.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    private ISender? _mediator;

    protected ISender Mediator => _mediator ??=
        HttpContext.RequestServices.GetRequiredService<ISender>();

    /// <summary>
    /// Handles a Result and returns appropriate HTTP response.
    /// </summary>
    protected IActionResult HandleResult(Result result)
    {
        if (result.IsSuccess)
            return Ok();

        return HandleError(result.Error);
    }

    /// <summary>
    /// Handles a Result with value and returns appropriate HTTP response.
    /// </summary>
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
            return Ok(result.Value);

        return HandleError(result.Error);
    }

    /// <summary>
    /// Handles a Result with value and returns Created response on success.
    /// </summary>
    protected IActionResult HandleCreatedResult<T>(Result<T> result, string routeName, Func<T, object> routeValues)
    {
        if (result.IsSuccess)
            return CreatedAtRoute(routeName, routeValues(result.Value), result.Value);

        return HandleError(result.Error);
    }

    /// <summary>
    /// Handles a Result with value and returns Created response with custom body.
    /// </summary>
    protected IActionResult HandleCreatedResult<T, TResponse>(
        Result<T> result,
        string routeName,
        Func<T, object> routeValues,
        Func<T, TResponse> responseMapper)
    {
        if (result.IsSuccess)
            return CreatedAtRoute(routeName, routeValues(result.Value), responseMapper(result.Value));

        return HandleError(result.Error);
    }

    private IActionResult HandleError(Error error)
    {
        return error.Code switch
        {
            var code when code.Contains("NotFound") => NotFound(new { error.Code, error.Message }),
            var code when code.Contains("Unauthorized") => Unauthorized(new { error.Code, error.Message }),
            var code when code.Contains("Forbidden") => Forbid(),
            var code when code.Contains("Conflict") => Conflict(new { error.Code, error.Message }),
            _ => BadRequest(new { error.Code, error.Message })
        };
    }
}
