using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Application.Features.Auth.Commands.ChangePassword;
using MoneyMarket.Application.Features.Auth.Commands.Login;
using MoneyMarket.Application.Features.Auth.Commands.RefreshToken;
using MoneyMarket.Application.Features.Auth.Commands.Register;

namespace MoneyMarket.API.Controllers;

/// <summary>
/// API endpoints for authentication and authorization.
/// </summary>
public class AuthController : ApiControllerBase
{
    private readonly ICurrentUserService _currentUserService;

    public AuthController(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Registers a new user account.
    /// </summary>
    /// <param name="request">The registration request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Authentication result with tokens.</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthenticationResultResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var command = new RegisterCommand(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName,
            request.PhoneNumber);

        var result = await Mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            SetRefreshTokenCookie(result.Value.RefreshToken, result.Value.RefreshTokenExpiration);
            return CreatedAtAction(null, ToResponse(result.Value));
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Authenticates a user and returns access tokens.
    /// </summary>
    /// <param name="request">The login request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Authentication result with tokens.</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthenticationResultResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var command = new LoginCommand(request.Email, request.Password);

        var result = await Mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            SetRefreshTokenCookie(result.Value.RefreshToken, result.Value.RefreshTokenExpiration);
            return Ok(ToResponse(result.Value));
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Refreshes the access token using a refresh token.
    /// </summary>
    /// <param name="request">The refresh token request (optional if using cookie).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>New authentication tokens.</returns>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthenticationResultResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken(
        [FromBody] RefreshTokenRequest? request,
        CancellationToken cancellationToken)
    {
        var refreshToken = request?.RefreshToken ?? Request.Cookies["refreshToken"];
        var accessToken = request?.AccessToken ?? GetAccessTokenFromHeader();

        if (string.IsNullOrEmpty(refreshToken) || string.IsNullOrEmpty(accessToken))
        {
            return BadRequest(new { Code = "Auth.MissingTokens", Message = "Access token and refresh token are required." });
        }

        var command = new RefreshTokenCommand(accessToken, refreshToken);

        var result = await Mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            SetRefreshTokenCookie(result.Value.RefreshToken, result.Value.RefreshTokenExpiration);
            return Ok(ToResponse(result.Value));
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Logs out the current user by revoking tokens.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (!string.IsNullOrEmpty(refreshToken))
        {
            var authService = HttpContext.RequestServices.GetRequiredService<IAuthenticationService>();
            await authService.RevokeTokenAsync(refreshToken, cancellationToken);
        }

        // Clear the refresh token cookie
        Response.Cookies.Delete("refreshToken");

        return NoContent();
    }

    /// <summary>
    /// Changes the current user's password.
    /// </summary>
    /// <param name="request">The change password request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
            return Unauthorized();

        var command = new ChangePasswordCommand(
            userId.Value,
            request.CurrentPassword,
            request.NewPassword);

        var result = await Mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            // Clear refresh token cookie after password change
            Response.Cookies.Delete("refreshToken");
            return NoContent();
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Gets the current user's profile.
    /// </summary>
    /// <returns>Current user information.</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(CurrentUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetCurrentUser()
    {
        var userId = _currentUserService.UserId;
        var email = _currentUserService.Email;

        if (!userId.HasValue || string.IsNullOrEmpty(email))
            return Unauthorized();

        return Ok(new CurrentUserResponse(
            userId.Value,
            email,
            User.Claims.FirstOrDefault(c => c.Type == "given_name")?.Value ?? "",
            User.Claims.FirstOrDefault(c => c.Type == "family_name")?.Value ?? "",
            User.Claims.Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
                .Select(c => c.Value).ToList()));
    }

    private void SetRefreshTokenCookie(string token, DateTime expires)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = expires,
            SameSite = SameSiteMode.Strict,
            Secure = true
        };

        Response.Cookies.Append("refreshToken", token, cookieOptions);
    }

    private string? GetAccessTokenFromHeader()
    {
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            return null;

        return authHeader["Bearer ".Length..];
    }

    private static AuthenticationResultResponse ToResponse(AuthenticationResult result)
    {
        return new AuthenticationResultResponse(
            result.UserId,
            result.Email,
            result.FirstName,
            result.LastName,
            result.AccessToken,
            result.AccessTokenExpiration,
            result.Roles.ToList());
    }
}

/// <summary>
/// Request model for user registration.
/// </summary>
public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber = null);

/// <summary>
/// Request model for user login.
/// </summary>
public record LoginRequest(
    string Email,
    string Password);

/// <summary>
/// Request model for token refresh.
/// </summary>
public record RefreshTokenRequest(
    string AccessToken,
    string RefreshToken);

/// <summary>
/// Request model for password change.
/// </summary>
public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);

/// <summary>
/// Response model for authentication operations.
/// </summary>
public record AuthenticationResultResponse(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string AccessToken,
    DateTime AccessTokenExpiration,
    List<string> Roles);

/// <summary>
/// Response model for current user info.
/// </summary>
public record CurrentUserResponse(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    List<string> Roles);
