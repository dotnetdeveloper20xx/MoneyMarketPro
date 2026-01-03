namespace MoneyMarket.Application.Common.Interfaces;

/// <summary>
/// Service for accessing the current authenticated user's information.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the unique identifier of the current user.
    /// </summary>
    Guid? UserId { get; }

    /// <summary>
    /// Gets the email address of the current user.
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Gets a value indicating whether a user is currently authenticated.
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Gets the roles assigned to the current user.
    /// </summary>
    IEnumerable<string> Roles { get; }

    /// <summary>
    /// Checks if the current user has the specified role.
    /// </summary>
    bool IsInRole(string role);
}
