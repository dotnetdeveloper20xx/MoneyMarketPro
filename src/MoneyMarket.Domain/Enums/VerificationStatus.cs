namespace MoneyMarket.Domain.Enums;

/// <summary>
/// Represents the verification status of user documents or identity.
/// </summary>
public enum VerificationStatus
{
    /// <summary>
    /// Verification has not been initiated
    /// </summary>
    NotStarted = 0,

    /// <summary>
    /// Verification documents have been submitted
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Verification is in progress
    /// </summary>
    InProgress = 2,

    /// <summary>
    /// Verification completed successfully
    /// </summary>
    Verified = 3,

    /// <summary>
    /// Verification failed - requires resubmission
    /// </summary>
    Failed = 4,

    /// <summary>
    /// Verification has expired and needs renewal
    /// </summary>
    Expired = 5
}
