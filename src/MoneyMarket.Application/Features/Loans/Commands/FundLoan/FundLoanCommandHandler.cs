using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.Loans.Commands.FundLoan;

public class FundLoanCommandHandler : ICommandHandler<FundLoanCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public FundLoanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        FundLoanCommand request,
        CancellationToken cancellationToken)
    {
        var loan = await _context.Loans
            .Include(l => l.Fundings)
            .FirstOrDefaultAsync(
                l => l.Id == LoanId.From(request.LoanId),
                cancellationToken);

        if (loan == null)
            return Result.Failure<Guid>(DomainErrors.Loan.NotFound);

        var lenderProfile = await _context.LenderProfiles
            .Include(l => l.User)
                .ThenInclude(u => u.Wallet)
            .FirstOrDefaultAsync(
                l => l.Id == LenderProfileId.From(request.LenderProfileId),
                cancellationToken);

        if (lenderProfile == null)
            return Result.Failure<Guid>(DomainErrors.Lender.NotFound);

        var wallet = lenderProfile.User.Wallet;
        if (wallet == null)
            return Result.Failure<Guid>(new Error("Wallet.NotFound", "Lender wallet not found."));

        var amount = Money.Create(request.Amount);

        // Reserve funds from wallet
        var reserveResult = wallet.Reserve(amount);
        if (reserveResult.IsFailure)
            return Result.Failure<Guid>(reserveResult.Error);

        // Add funding to loan
        var fundingResult = loan.AddFunding(lenderProfile.Id, amount);
        if (fundingResult.IsFailure)
        {
            // Release reservation on failure
            wallet.ReleaseReservation(amount);
            return Result.Failure<Guid>(fundingResult.Error);
        }

        // Commit the reservation
        wallet.CommitReservation(
            amount,
            Domain.Enums.TransactionType.Investment,
            $"Investment in Loan {loan.Id.Value}",
            fundingResult.Value.Id.Value.ToString());

        // Update lender statistics
        lenderProfile.RecordInvestment(amount);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(fundingResult.Value.Id.Value);
    }
}
