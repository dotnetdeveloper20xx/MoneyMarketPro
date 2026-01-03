using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents a user in the MoneyMarket platform.
/// </summary>
public class User : AggregateRoot<UserId>, IAuditableEntity, ISoftDeletable
{
    public EmailAddress Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public PhoneNumber? PhoneNumber { get; private set; }
    public DateOnly? DateOfBirth { get; private set; }
    public bool IsActive { get; private set; }
    public bool EmailConfirmed { get; private set; }
    public DateTime? LastLoginAt { get; private set; }

    // Roles stored as comma-separated string
    private string _roles = string.Empty;
    public IReadOnlyList<UserRole> Roles
    {
        get
        {
            if (string.IsNullOrEmpty(_roles))
                return Array.Empty<UserRole>();

            return _roles.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(r => Enum.Parse<UserRole>(r))
                .ToList();
        }
    }

    // Navigation properties
    public BorrowerProfile? BorrowerProfile { get; private set; }
    public LenderProfile? LenderProfile { get; private set; }
    public Wallet? Wallet { get; private set; }

    private readonly List<RefreshToken> _refreshTokens = new();
    public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    private User() { }

    public static User Create(
        EmailAddress email,
        string passwordHash,
        string firstName,
        string lastName,
        UserRole role)
    {
        var user = new User
        {
            Id = UserId.Create(),
            Email = email,
            PasswordHash = passwordHash,
            FirstName = firstName,
            LastName = lastName,
            _roles = role.ToString(),
            IsActive = true,
            EmailConfirmed = false
        };

        return user;
    }

    public string FullName => $"{FirstName} {LastName}";

    public void UpdateProfile(
        string firstName,
        string lastName,
        PhoneNumber? phoneNumber,
        DateOnly? dateOfBirth)
    {
        FirstName = firstName;
        LastName = lastName;
        PhoneNumber = phoneNumber;
        DateOfBirth = dateOfBirth;
    }

    public void UpdatePassword(string passwordHash)
    {
        PasswordHash = passwordHash;
    }

    public void ConfirmEmail()
    {
        EmailConfirmed = true;
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void AddRole(UserRole role)
    {
        var currentRoles = Roles.ToList();
        if (!currentRoles.Contains(role))
        {
            currentRoles.Add(role);
            _roles = string.Join(",", currentRoles.Select(r => r.ToString()));
        }
    }

    public void RemoveRole(UserRole role)
    {
        var currentRoles = Roles.ToList();
        if (currentRoles.Contains(role))
        {
            currentRoles.Remove(role);
            _roles = string.Join(",", currentRoles.Select(r => r.ToString()));
        }
    }

    public bool HasRole(UserRole role)
    {
        return Roles.Contains(role);
    }

    public void SetBorrowerProfile(BorrowerProfile profile)
    {
        if (!HasRole(UserRole.Borrower))
            AddRole(UserRole.Borrower);

        BorrowerProfile = profile;
    }

    public void SetLenderProfile(LenderProfile profile)
    {
        if (!HasRole(UserRole.Lender))
            AddRole(UserRole.Lender);

        LenderProfile = profile;
    }

    public void SetWallet(Wallet wallet)
    {
        Wallet = wallet;
    }

    public RefreshToken AddRefreshToken(string token, DateTime expiresAt, string? createdByIp = null)
    {
        var refreshToken = RefreshToken.Create(Id, token, expiresAt, createdByIp);
        _refreshTokens.Add(refreshToken);
        return refreshToken;
    }

    public void RevokeAllRefreshTokens(string? revokedByIp = null)
    {
        foreach (var token in _refreshTokens.Where(t => t.IsActive))
        {
            token.Revoke(revokedByIp);
        }
    }

    public RefreshToken? GetActiveRefreshToken(string token)
    {
        return _refreshTokens.FirstOrDefault(t => t.Token == token && t.IsActive);
    }
}
