namespace MoneyMarket.Domain.Enums;

/// <summary>
/// Represents the payment method used for transactions.
/// </summary>
public enum PaymentMethod
{
    BankTransfer = 1,
    DebitCard = 2,
    CreditCard = 3,
    ACH = 4,
    Wire = 5,
    Wallet = 6
}
