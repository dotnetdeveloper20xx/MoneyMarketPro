namespace MoneyMarket.Domain.Common;

public record Error(string Code, string Message)
{
    public static readonly Error None = new(string.Empty, string.Empty);
    public static readonly Error NullValue = new("Error.NullValue", "A null value was provided.");
}

public static class DomainErrors
{
    public static class Borrower
    {
        public static readonly Error NotFound = new("Borrower.NotFound", "Borrower profile not found.");
        public static readonly Error NotEligibleForLoan = new("Borrower.NotEligible", "Borrower is not eligible for a loan.");
        public static readonly Error KycNotVerified = new("Borrower.KycNotVerified", "KYC verification is required.");
        public static readonly Error DuplicateApplication = new("Borrower.DuplicateApplication", "An active application already exists.");
    }

    public static class Lender
    {
        public static readonly Error NotFound = new("Lender.NotFound", "Lender profile not found.");
        public static readonly Error InsufficientFunds = new("Lender.InsufficientFunds", "Insufficient wallet balance.");
        public static readonly Error NotAccredited = new("Lender.NotAccredited", "Accreditation required for this investment.");
    }

    public static class Loan
    {
        public static readonly Error NotFound = new("Loan.NotFound", "Loan not found.");
        public static readonly Error InvalidTransition = new("Loan.InvalidTransition", "Invalid state transition.");
        public static readonly Error OverFunded = new("Loan.OverFunded", "Investment would exceed loan amount.");
        public static readonly Error NotPendingFunding = new("Loan.NotPendingFunding", "Loan is not accepting funding.");
        public static readonly Error FundingExpired = new("Loan.FundingExpired", "Funding deadline has passed.");
        public static readonly Error AlreadyDisbursed = new("Loan.AlreadyDisbursed", "Loan has already been disbursed.");
    }

    public static class Payment
    {
        public static readonly Error InvalidAmount = new("Payment.InvalidAmount", "Payment amount is invalid.");
        public static readonly Error OverPayment = new("Payment.OverPayment", "Payment exceeds outstanding balance.");
        public static readonly Error DuplicateReference = new("Payment.DuplicateReference", "Payment reference already exists.");
        public static readonly Error LoanNotActive = new("Payment.LoanNotActive", "Loan is not active and cannot accept payments.");
        public static readonly Error InsufficientFunds = new("Payment.InsufficientFunds", "Insufficient wallet balance for payment.");
        public static readonly Error NotFound = new("Payment.NotFound", "Payment not found.");
    }

    public static class Wallet
    {
        public static readonly Error NotFound = new("Wallet.NotFound", "Wallet not found.");
        public static readonly Error InsufficientBalance = new("Wallet.InsufficientBalance", "Insufficient wallet balance.");
        public static readonly Error InvalidAmount = new("Wallet.InvalidAmount", "Invalid transaction amount.");
        public static readonly Error WithdrawalPending = new("Wallet.WithdrawalPending", "A withdrawal is already pending.");
    }

    public static class Application
    {
        public static readonly Error NotFound = new("Application.NotFound", "Loan application not found.");
        public static readonly Error AlreadySubmitted = new("Application.AlreadySubmitted", "Application has already been submitted.");
        public static readonly Error NotUnderReview = new("Application.NotUnderReview", "Application is not under review.");
    }

    public static class Auth
    {
        public static readonly Error InvalidCredentials = new("Auth.InvalidCredentials", "Invalid email or password.");
        public static readonly Error EmailAlreadyExists = new("Auth.EmailAlreadyExists", "An account with this email already exists.");
        public static readonly Error UserNotFound = new("Auth.UserNotFound", "User not found.");
        public static readonly Error UserInactive = new("Auth.UserInactive", "User account is inactive.");
        public static readonly Error InvalidToken = new("Auth.InvalidToken", "Invalid or expired token.");
        public static readonly Error InvalidRefreshToken = new("Auth.InvalidRefreshToken", "Invalid or expired refresh token.");
        public static readonly Error PasswordMismatch = new("Auth.PasswordMismatch", "Current password is incorrect.");
        public static readonly Error WeakPassword = new("Auth.WeakPassword", "Password does not meet security requirements.");
    }
}
