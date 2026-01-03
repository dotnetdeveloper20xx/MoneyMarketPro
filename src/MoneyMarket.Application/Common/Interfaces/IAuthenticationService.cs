using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Common.Interfaces;

public interface IAuthenticationService
{
    Task<Result<AuthenticationResult>> RegisterAsync(
        string email,
        string password,
        string firstName,
        string lastName,
        string? phoneNumber,
        CancellationToken cancellationToken = default);

    Task<Result<AuthenticationResult>> LoginAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default);

    Task<Result<AuthenticationResult>> RefreshTokenAsync(
        string accessToken,
        string refreshToken,
        CancellationToken cancellationToken = default);

    Task<Result> RevokeTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default);

    Task<Result> ChangePasswordAsync(
        Guid userId,
        string currentPassword,
        string newPassword,
        CancellationToken cancellationToken = default);
}

public record AuthenticationResult(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiration,
    DateTime RefreshTokenExpiration,
    IReadOnlyList<string> Roles);
