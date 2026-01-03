namespace MoneyMarket.Domain.Enums;

/// <summary>
/// Represents the type of wallet transaction.
/// </summary>
public enum TransactionType
{
    /// <summary>
    /// Money deposited into wallet
    /// </summary>
    Deposit = 1,

    /// <summary>
    /// Money withdrawn from wallet
    /// </summary>
    Withdrawal = 2,

    /// <summary>
    /// Investment made in a loan
    /// </summary>
    Investment = 3,

    /// <summary>
    /// Return of investment from loan
    /// </summary>
    InvestmentReturn = 4,

    /// <summary>
    /// Interest earned from investment
    /// </summary>
    InterestEarned = 5,

    /// <summary>
    /// Loan disbursement to borrower
    /// </summary>
    LoanDisbursement = 6,

    /// <summary>
    /// Loan repayment from borrower
    /// </summary>
    LoanRepayment = 7,

    /// <summary>
    /// Platform fee charged
    /// </summary>
    Fee = 8,

    /// <summary>
    /// Refund of investment
    /// </summary>
    Refund = 9,

    /// <summary>
    /// Late payment penalty
    /// </summary>
    LateFee = 10
}
