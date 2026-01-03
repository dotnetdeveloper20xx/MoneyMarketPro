using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.Wallets.Commands.WithdrawFunds;

public class WithdrawFundsCommandHandler : ICommandHandler<WithdrawFundsCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public WithdrawFundsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        WithdrawFundsCommand request,
        CancellationToken cancellationToken)
    {
        var userId = UserId.From(request.UserId);

        var wallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null)
            return Result.Failure<Guid>(DomainErrors.Wallet.NotFound);

        var amount = Money.Create(request.Amount);

        if (wallet.AvailableBalance.Amount < request.Amount)
            return Result.Failure<Guid>(DomainErrors.Wallet.InsufficientBalance);

        var withdrawResult = wallet.Withdraw(
            amount,
            "Withdrawal from wallet",
            request.BankAccountReference);

        if (withdrawResult.IsFailure)
            return Result.Failure<Guid>(withdrawResult.Error);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(withdrawResult.Value.Id);
    }
}
