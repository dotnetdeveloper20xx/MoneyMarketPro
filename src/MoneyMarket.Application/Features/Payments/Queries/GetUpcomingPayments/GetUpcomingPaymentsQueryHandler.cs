using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Payments.Queries.GetUpcomingPayments;

public class GetUpcomingPaymentsQueryHandler : IQueryHandler<GetUpcomingPaymentsQuery, UpcomingPaymentsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeProvider _dateTimeProvider;

    public GetUpcomingPaymentsQueryHandler(
        IApplicationDbContext context,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<UpcomingPaymentsDto>> Handle(
        GetUpcomingPaymentsQuery request,
        CancellationToken cancellationToken)
    {
        var borrowerProfileId = BorrowerProfileId.From(request.BorrowerProfileId);
        var now = _dateTimeProvider.UtcNow;
        var cutoffDate = now.AddDays(request.DaysAhead);

        var borrowerExists = await _context.BorrowerProfiles
            .AnyAsync(b => b.Id == borrowerProfileId, cancellationToken);

        if (!borrowerExists)
            return Result.Failure<UpcomingPaymentsDto>(DomainErrors.Borrower.NotFound);

        var upcomingPayments = await _context.Loans
            .Where(l => l.BorrowerProfileId == borrowerProfileId &&
                        (l.Status == LoanStatus.Active || l.Status == LoanStatus.Delinquent))
            .SelectMany(l => l.PaymentSchedule
                .Where(s => (s.Status == PaymentStatus.Scheduled || s.Status == PaymentStatus.Overdue) &&
                            s.DueDate <= cutoffDate)
                .Select(s => new
                {
                    LoanId = l.Id.Value,
                    s.PaymentNumber,
                    s.DueDate,
                    PrincipalDue = s.PrincipalDue.Amount,
                    InterestDue = s.InterestDue.Amount,
                    TotalDue = s.PrincipalDue.Amount + s.InterestDue.Amount,
                    Status = s.Status.ToString()
                }))
            .OrderBy(x => x.DueDate)
            .ToListAsync(cancellationToken);

        var payments = upcomingPayments.Select(p => new UpcomingPaymentDto(
            p.LoanId,
            p.PaymentNumber,
            p.DueDate,
            p.PrincipalDue,
            p.InterestDue,
            p.TotalDue,
            (int)(p.DueDate - now).TotalDays,
            p.Status)).ToList();

        var totalAmountDue = payments.Sum(p => p.TotalDue);

        return Result.Success(new UpcomingPaymentsDto(payments, totalAmountDue));
    }
}
