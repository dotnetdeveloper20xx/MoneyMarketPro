namespace MoneyMarket.Domain.Enums;

/// <summary>
/// Represents the accreditation status of a lender.
/// Accredited investors may have access to different investment options.
/// </summary>
public enum AccreditationStatus
{
    /// <summary>
    /// Not an accredited investor
    /// </summary>
    NotAccredited = 0,

    /// <summary>
    /// Accreditation pending verification
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Verified accredited investor
    /// </summary>
    Accredited = 2,

    /// <summary>
    /// Accreditation expired - needs renewal
    /// </summary>
    Expired = 3
}
