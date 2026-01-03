namespace MoneyMarket.Domain.Enums;

/// <summary>
/// Represents the type of notification sent to users.
/// </summary>
public enum NotificationType
{
    // Application related
    ApplicationSubmitted = 1,
    ApplicationApproved = 2,
    ApplicationRejected = 3,
    ApplicationRequiresInfo = 4,

    // Funding related
    LoanListed = 10,
    InvestmentReceived = 11,
    LoanFullyFunded = 12,
    LoanDisbursed = 13,
    FundingExpired = 14,

    // Payment related
    PaymentDue = 20,
    PaymentReceived = 21,
    PaymentOverdue = 22,
    PaymentFailed = 23,

    // Investment related
    InvestmentReturn = 30,
    InterestPaid = 31,
    LoanDefault = 32,
    LoanPaidOff = 33,

    // Account related
    WelcomeEmail = 40,
    KycRequired = 41,
    KycApproved = 42,
    KycRejected = 43,
    PasswordReset = 44,
    AccountLocked = 45,

    // General
    SystemAnnouncement = 90,
    Promotional = 91
}
