using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Loans.Commands.DisburseLoan;

public class DisburseLoanCommandHandler : ICommandHandler<DisburseLoanCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentGateway _paymentGateway;

    public DisburseLoanCommandHandler(
        IApplicationDbContext context,
        IPaymentGateway paymentGateway)
    {
        _context = context;
        _paymentGateway = paymentGateway;
    }

    public async Task<Result> Handle(
        DisburseLoanCommand request,
        CancellationToken cancellationToken)
    {
        var loan = await _context.Loans
            .Include(l => l.BorrowerProfile)
                .ThenInclude(b => b.User)
                    .ThenInclude(u => u.Wallet)
            .FirstOrDefaultAsync(
                l => l.Id == LoanId.From(request.LoanId),
                cancellationToken);

        if (loan == null)
            return Result.Failure(DomainErrors.Loan.NotFound);

        var disburseResult = loan.Disburse();
        if (disburseResult.IsFailure)
            return disburseResult;

        // Credit borrower's wallet
        var borrowerWallet = loan.BorrowerProfile.User.Wallet;
        if (borrowerWallet != null)
        {
            borrowerWallet.Credit(
                loan.PrincipalAmount,
                TransactionType.LoanDisbursement,
                $"Loan disbursement for Loan {loan.Id.Value}",
                loan.Id.Value.ToString());
        }

        // Update borrower statistics
        loan.BorrowerProfile.RecordLoanDisbursed(loan.PrincipalAmount);

        // Activate the loan
        loan.Activate();

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
