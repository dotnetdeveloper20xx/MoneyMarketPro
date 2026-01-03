using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.Payments.Commands.ProcessPayment;

public class ProcessPaymentCommandHandler : ICommandHandler<ProcessPaymentCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public ProcessPaymentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        ProcessPaymentCommand request,
        CancellationToken cancellationToken)
    {
        var loan = await _context.Loans
            .Include(l => l.BorrowerProfile)
                .ThenInclude(b => b.User)
                    .ThenInclude(u => u.Wallet)
            .Include(l => l.Fundings)
                .ThenInclude(f => f.LenderProfile)
                    .ThenInclude(lp => lp.User)
                        .ThenInclude(u => u.Wallet)
            .Include(l => l.PaymentSchedule)
            .FirstOrDefaultAsync(
                l => l.Id == LoanId.From(request.LoanId),
                cancellationToken);

        if (loan == null)
            return Result.Failure<Guid>(DomainErrors.Loan.NotFound);

        if (loan.Status != LoanStatus.Active && loan.Status != LoanStatus.Delinquent)
            return Result.Failure<Guid>(DomainErrors.Payment.LoanNotActive);

        var amount = Money.Create(request.Amount);
        var borrowerWallet = loan.BorrowerProfile.User.Wallet;

        // Check borrower has sufficient funds
        if (borrowerWallet == null || borrowerWallet.AvailableBalance.Amount < request.Amount)
            return Result.Failure<Guid>(DomainErrors.Payment.InsufficientFunds);

        // Record payment on loan (creates the payment entity)
        var paymentResult = loan.RecordPayment(amount, PaymentMethod.Wallet, request.PaymentReference);
        if (paymentResult.IsFailure)
            return Result.Failure<Guid>(paymentResult.Error);

        var payment = paymentResult.Value;

        // Debit borrower wallet
        var debitResult = borrowerWallet.Withdraw(
            amount,
            $"Payment for Loan {loan.Id.Value}",
            payment.Id.Value.ToString());

        if (debitResult.IsFailure)
            return Result.Failure<Guid>(debitResult.Error);

        // Distribute payment to lenders based on share percentage
        foreach (var funding in loan.Fundings)
        {
            var lenderShare = Money.Create(amount.Amount * (funding.SharePercentage / 100m));
            var lenderWallet = funding.LenderProfile.User.Wallet;

            if (lenderWallet != null)
            {
                lenderWallet.Credit(
                    lenderShare,
                    TransactionType.LoanRepayment,
                    $"Repayment from Loan {loan.Id.Value}",
                    payment.Id.Value.ToString());

                // Update lender earnings
                funding.LenderProfile.RecordInterestEarned(lenderShare);
            }
        }

        // Update borrower profile
        loan.BorrowerProfile.RecordLoanRepayment(amount);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(payment.Id.Value);
    }
}
