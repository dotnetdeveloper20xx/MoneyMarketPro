using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Payments.Queries.GetUpcomingPayments;

public record GetUpcomingPaymentsQuery(
    Guid BorrowerProfileId,
    int DaysAhead = 30) : IQuery<UpcomingPaymentsDto>;

public record UpcomingPaymentsDto(
    List<UpcomingPaymentDto> Payments,
    decimal TotalAmountDue);

public record UpcomingPaymentDto(
    Guid LoanId,
    int PaymentNumber,
    DateTime DueDate,
    decimal PrincipalDue,
    decimal InterestDue,
    decimal TotalDue,
    int DaysUntilDue,
    string Status);
