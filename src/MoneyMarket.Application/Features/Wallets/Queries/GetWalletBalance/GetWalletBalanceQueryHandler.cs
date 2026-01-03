using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Wallets.Queries.GetWalletBalance;

public class GetWalletBalanceQueryHandler : IQueryHandler<GetWalletBalanceQuery, WalletBalanceDto>
{
    private readonly IApplicationDbContext _context;

    public GetWalletBalanceQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<WalletBalanceDto>> Handle(
        GetWalletBalanceQuery request,
        CancellationToken cancellationToken)
    {
        var userId = UserId.From(request.UserId);

        var wallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null)
            return Result.Failure<WalletBalanceDto>(DomainErrors.Wallet.NotFound);

        var totalBalance = wallet.AvailableBalance.Amount +
                           wallet.PendingBalance.Amount +
                           wallet.ReservedBalance.Amount;

        return Result.Success(new WalletBalanceDto(
            wallet.Id.Value,
            wallet.UserId.Value,
            wallet.AvailableBalance.Amount,
            wallet.PendingBalance.Amount,
            wallet.ReservedBalance.Amount,
            totalBalance,
            wallet.UpdatedAt ?? wallet.CreatedAt));
    }
}
