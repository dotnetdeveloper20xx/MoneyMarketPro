namespace MoneyMarket.API.Authorization;

/// <summary>
/// Constants for authorization policy names.
/// </summary>
public static class PolicyNames
{
    /// <summary>
    /// Policy requiring Borrower role.
    /// </summary>
    public const string BorrowerOnly = "BorrowerOnly";

    /// <summary>
    /// Policy requiring Lender role.
    /// </summary>
    public const string LenderOnly = "LenderOnly";

    /// <summary>
    /// Policy requiring Borrower or Lender role.
    /// </summary>
    public const string BorrowerOrLender = "BorrowerOrLender";

    /// <summary>
    /// Policy requiring CRM, Admin, or Support role.
    /// </summary>
    public const string Staff = "Staff";

    /// <summary>
    /// Policy requiring CRM or Admin role.
    /// </summary>
    public const string CrmOrAdmin = "CrmOrAdmin";

    /// <summary>
    /// Policy requiring Admin role only.
    /// </summary>
    public const string AdminOnly = "AdminOnly";

    /// <summary>
    /// Policy requiring Support, CRM, or Admin role.
    /// </summary>
    public const string SupportOrAbove = "SupportOrAbove";
}
