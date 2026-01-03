using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Payments.Commands.ProcessPayment;

public record ProcessPaymentCommand(
    Guid LoanId,
    decimal Amount,
    string? PaymentReference = null) : ICommand<Guid>;
