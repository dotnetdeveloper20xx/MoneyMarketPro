using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.Wallets.Commands.DepositFunds;

public class DepositFundsCommandHandler : ICommandHandler<DepositFundsCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public DepositFundsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        DepositFundsCommand request,
        CancellationToken cancellationToken)
    {
        var userId = UserId.From(request.UserId);

        var wallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null)
            return Result.Failure<Guid>(DomainErrors.Wallet.NotFound);

        var amount = Money.Create(request.Amount);

        var depositResult = wallet.Deposit(
            amount,
            "Deposit to wallet",
            request.Reference);

        if (depositResult.IsFailure)
            return Result.Failure<Guid>(depositResult.Error);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(depositResult.Value.Id);
    }
}
