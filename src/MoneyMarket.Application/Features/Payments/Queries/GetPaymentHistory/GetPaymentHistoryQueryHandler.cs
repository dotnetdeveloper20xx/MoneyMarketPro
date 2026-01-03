using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Payments.Queries.GetPaymentHistory;

public class GetPaymentHistoryQueryHandler : IQueryHandler<GetPaymentHistoryQuery, PaymentHistoryDto>
{
    private readonly IApplicationDbContext _context;

    public GetPaymentHistoryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaymentHistoryDto>> Handle(
        GetPaymentHistoryQuery request,
        CancellationToken cancellationToken)
    {
        var loanId = LoanId.From(request.LoanId);

        var loanExists = await _context.Loans
            .AnyAsync(l => l.Id == loanId, cancellationToken);

        if (!loanExists)
            return Result.Failure<PaymentHistoryDto>(DomainErrors.Loan.NotFound);

        var query = _context.Payments
            .Where(p => p.LoanId == loanId)
            .OrderByDescending(p => p.PaymentDate);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPaid = await query.SumAsync(p => p.TotalAmount.Amount, cancellationToken);

        var payments = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new PaymentDto(
                p.Id.Value,
                p.LoanId.Value,
                p.TotalAmount.Amount,
                p.PaymentDate,
                p.PrincipalAmount.Amount,
                p.InterestAmount.Amount,
                p.ExternalReference))
            .ToListAsync(cancellationToken);

        return Result.Success(new PaymentHistoryDto(
            payments,
            totalCount,
            request.Page,
            request.PageSize,
            totalPaid));
    }
}
