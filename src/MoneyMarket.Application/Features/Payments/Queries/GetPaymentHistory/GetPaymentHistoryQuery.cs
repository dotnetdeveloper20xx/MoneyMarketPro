using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Payments.Queries.GetPaymentHistory;

public record GetPaymentHistoryQuery(
    Guid LoanId,
    int Page = 1,
    int PageSize = 20) : IQuery<PaymentHistoryDto>;

public record PaymentHistoryDto(
    List<PaymentDto> Payments,
    int TotalCount,
    int Page,
    int PageSize,
    decimal TotalPaid);

public record PaymentDto(
    Guid Id,
    Guid LoanId,
    decimal Amount,
    DateTime PaymentDate,
    decimal PrincipalPortion,
    decimal InterestPortion,
    string? Reference);
