using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Common.Interfaces;

/// <summary>
/// Abstraction for payment processing operations.
/// </summary>
public interface IPaymentGateway
{
    /// <summary>
    /// Processes a payment.
    /// </summary>
    Task<Result<PaymentResult>> ProcessPaymentAsync(
        string paymentMethodToken,
        Money amount,
        string description,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Initiates a refund for a previous payment.
    /// </summary>
    Task<Result<RefundResult>> RefundAsync(
        string transactionId,
        Money amount,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Transfers funds between accounts.
    /// </summary>
    Task<Result<TransferResult>> TransferAsync(
        string sourceAccountId,
        string destinationAccountId,
        Money amount,
        string description,
        CancellationToken cancellationToken = default);
}

public record PaymentResult(
    string TransactionId,
    bool IsSuccessful,
    string? FailureReason,
    DateTime ProcessedAt);

public record RefundResult(
    string RefundId,
    bool IsSuccessful,
    string? FailureReason,
    DateTime ProcessedAt);

public record TransferResult(
    string TransferId,
    bool IsSuccessful,
    string? FailureReason,
    DateTime ProcessedAt);
