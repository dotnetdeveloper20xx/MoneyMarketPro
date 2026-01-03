using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Entities;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Infrastructure.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthenticationService(
        IApplicationDbContext context,
        IJwtTokenService jwtTokenService,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<AuthenticationResult>> RegisterAsync(
        string email,
        string password,
        string firstName,
        string lastName,
        string? phoneNumber,
        CancellationToken cancellationToken = default)
    {
        // Validate email format
        EmailAddress emailAddress;
        try
        {
            emailAddress = EmailAddress.Create(email);
        }
        catch (ArgumentException)
        {
            return Result.Failure<AuthenticationResult>(
                new Error("Auth.InvalidEmail", "Invalid email format."));
        }

        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == emailAddress, cancellationToken);

        if (existingUser != null)
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.EmailAlreadyExists);

        // Validate password strength
        if (!IsPasswordStrong(password))
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.WeakPassword);

        // Create user
        var passwordHash = _passwordHasher.HashPassword(password);
        var user = User.Create(emailAddress, passwordHash, firstName, lastName, UserRole.Borrower);

        // Set phone number if provided
        if (!string.IsNullOrEmpty(phoneNumber))
        {
            try
            {
                var phone = PhoneNumber.CreateUS(phoneNumber);
                user.UpdateProfile(firstName, lastName, phone, null);
            }
            catch
            {
                // Ignore invalid phone number during registration
            }
        }

        // Create wallet for the user
        var wallet = Wallet.Create(user.Id);
        user.SetWallet(wallet);

        _context.Users.Add(user);
        _context.Wallets.Add(wallet);

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        var refreshTokenExpiration = _jwtTokenService.GetRefreshTokenExpiration();

        user.AddRefreshToken(refreshToken, refreshTokenExpiration);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new AuthenticationResult(
            user.Id.Value,
            user.Email.Value,
            user.FirstName,
            user.LastName,
            accessToken,
            refreshToken,
            _jwtTokenService.GetAccessTokenExpiration(),
            refreshTokenExpiration,
            user.Roles.Select(r => r.ToString()).ToList()));
    }

    public async Task<Result<AuthenticationResult>> LoginAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        EmailAddress emailAddress;
        try
        {
            emailAddress = EmailAddress.Create(email);
        }
        catch (ArgumentException)
        {
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.InvalidCredentials);
        }

        var user = await _context.Users
            .Include(u => u.BorrowerProfile)
            .Include(u => u.LenderProfile)
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Email == emailAddress, cancellationToken);

        if (user == null)
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.InvalidCredentials);

        if (!user.IsActive)
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.UserInactive);

        if (!_passwordHasher.VerifyPassword(password, user.PasswordHash))
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.InvalidCredentials);

        // Record login
        user.RecordLogin();

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        var refreshTokenExpiration = _jwtTokenService.GetRefreshTokenExpiration();

        user.AddRefreshToken(refreshToken, refreshTokenExpiration);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new AuthenticationResult(
            user.Id.Value,
            user.Email.Value,
            user.FirstName,
            user.LastName,
            accessToken,
            refreshToken,
            _jwtTokenService.GetAccessTokenExpiration(),
            refreshTokenExpiration,
            user.Roles.Select(r => r.ToString()).ToList()));
    }

    public async Task<Result<AuthenticationResult>> RefreshTokenAsync(
        string accessToken,
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        // Validate the access token (can be expired)
        var tokenData = _jwtTokenService.ValidateAccessToken(accessToken);
        if (tokenData == null)
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.InvalidToken);

        var (userId, _) = tokenData.Value;

        var user = await _context.Users
            .Include(u => u.BorrowerProfile)
            .Include(u => u.LenderProfile)
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == UserId.From(userId), cancellationToken);

        if (user == null)
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.UserNotFound);

        if (!user.IsActive)
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.UserInactive);

        // Find the refresh token
        var existingRefreshToken = user.GetActiveRefreshToken(refreshToken);
        if (existingRefreshToken == null)
            return Result.Failure<AuthenticationResult>(DomainErrors.Auth.InvalidRefreshToken);

        // Generate new tokens
        var newAccessToken = _jwtTokenService.GenerateAccessToken(user);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();
        var refreshTokenExpiration = _jwtTokenService.GetRefreshTokenExpiration();

        // Revoke old refresh token and add new one
        existingRefreshToken.Revoke(replacedByToken: newRefreshToken);
        user.AddRefreshToken(newRefreshToken, refreshTokenExpiration);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new AuthenticationResult(
            user.Id.Value,
            user.Email.Value,
            user.FirstName,
            user.LastName,
            newAccessToken,
            newRefreshToken,
            _jwtTokenService.GetAccessTokenExpiration(),
            refreshTokenExpiration,
            user.Roles.Select(r => r.ToString()).ToList()));
    }

    public async Task<Result> RevokeTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        var token = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken, cancellationToken);

        if (token == null || !token.IsActive)
            return Result.Failure(DomainErrors.Auth.InvalidRefreshToken);

        token.Revoke();

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> ChangePasswordAsync(
        Guid userId,
        string currentPassword,
        string newPassword,
        CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == UserId.From(userId), cancellationToken);

        if (user == null)
            return Result.Failure(DomainErrors.Auth.UserNotFound);

        if (!_passwordHasher.VerifyPassword(currentPassword, user.PasswordHash))
            return Result.Failure(DomainErrors.Auth.PasswordMismatch);

        if (!IsPasswordStrong(newPassword))
            return Result.Failure(DomainErrors.Auth.WeakPassword);

        var newPasswordHash = _passwordHasher.HashPassword(newPassword);
        user.UpdatePassword(newPasswordHash);

        // Revoke all refresh tokens on password change
        user.RevokeAllRefreshTokens();

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static bool IsPasswordStrong(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8)
            return false;

        var hasUpperCase = password.Any(char.IsUpper);
        var hasLowerCase = password.Any(char.IsLower);
        var hasDigit = password.Any(char.IsDigit);
        var hasSpecialChar = password.Any(c => !char.IsLetterOrDigit(c));

        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
    }
}
