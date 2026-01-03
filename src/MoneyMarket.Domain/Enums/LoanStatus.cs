namespace MoneyMarket.Domain.Enums;

/// <summary>
/// Represents the lifecycle states of a loan in the MoneyMarket platform.
/// Follows the state machine defined in the technical design document.
/// </summary>
public enum LoanStatus
{
    /// <summary>
    /// Initial draft state - borrower is completing the application
    /// </summary>
    Draft = 0,

    /// <summary>
    /// Application has been submitted and awaiting review
    /// </summary>
    Submitted = 1,

    /// <summary>
    /// Application is being reviewed by CRM/underwriting team
    /// </summary>
    UnderReview = 2,

    /// <summary>
    /// Application has been approved - awaiting funding
    /// </summary>
    Approved = 3,

    /// <summary>
    /// Application was rejected during review
    /// </summary>
    Rejected = 4,

    /// <summary>
    /// Loan is listed on marketplace and accepting investments
    /// </summary>
    PendingFunding = 5,

    /// <summary>
    /// Loan has received partial funding from lenders
    /// </summary>
    PartiallyFunded = 6,

    /// <summary>
    /// Loan is fully funded and awaiting disbursement
    /// </summary>
    FullyFunded = 7,

    /// <summary>
    /// Funds have been disbursed to the borrower
    /// </summary>
    Disbursed = 8,

    /// <summary>
    /// Loan is active - borrower is making repayments
    /// </summary>
    Active = 9,

    /// <summary>
    /// Payment is overdue beyond grace period
    /// </summary>
    Delinquent = 10,

    /// <summary>
    /// Loan is in default status
    /// </summary>
    Default = 11,

    /// <summary>
    /// Loan has been fully repaid
    /// </summary>
    PaidOff = 12,

    /// <summary>
    /// Loan was cancelled before disbursement
    /// </summary>
    Cancelled = 13,

    /// <summary>
    /// Funding deadline passed without reaching target
    /// </summary>
    Expired = 14
}
