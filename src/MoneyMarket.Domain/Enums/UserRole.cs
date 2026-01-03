namespace MoneyMarket.Domain.Enums;

/// <summary>
/// Represents user roles in the MoneyMarket platform.
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Users who apply for loans
    /// </summary>
    Borrower = 1,

    /// <summary>
    /// Users who invest in loans
    /// </summary>
    Lender = 2,

    /// <summary>
    /// Customer Relationship Managers who review applications
    /// </summary>
    CRM = 3,

    /// <summary>
    /// Platform administrators with full access
    /// </summary>
    Admin = 4,

    /// <summary>
    /// Customer support representatives
    /// </summary>
    Support = 5
}
