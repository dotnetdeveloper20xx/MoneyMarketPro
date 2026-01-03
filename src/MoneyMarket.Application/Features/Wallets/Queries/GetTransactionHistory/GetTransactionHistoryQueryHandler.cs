using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Wallets.Queries.GetTransactionHistory;

public class GetTransactionHistoryQueryHandler : IQueryHandler<GetTransactionHistoryQuery, TransactionHistoryDto>
{
    private readonly IApplicationDbContext _context;

    public GetTransactionHistoryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TransactionHistoryDto>> Handle(
        GetTransactionHistoryQuery request,
        CancellationToken cancellationToken)
    {
        var userId = UserId.From(request.UserId);

        var wallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null)
            return Result.Failure<TransactionHistoryDto>(DomainErrors.Wallet.NotFound);

        var query = _context.WalletTransactions
            .Where(t => t.WalletId == wallet.Id);

        if (request.Type.HasValue)
        {
            query = query.Where(t => t.Type == request.Type.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(t => t.CreatedAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(t => t.CreatedAt <= request.ToDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var transactions = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new WalletTransactionDto(
                t.Id,
                t.Amount.Amount,
                t.Type,
                t.Description,
                t.ExternalReference,
                t.BalanceAfter.Amount,
                t.CreatedAt))
            .ToListAsync(cancellationToken);

        return Result.Success(new TransactionHistoryDto(
            transactions,
            totalCount,
            request.Page,
            request.PageSize));
    }
}
