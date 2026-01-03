using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.LoanApplications.Commands.SubmitLoanApplication;

public class SubmitLoanApplicationCommandHandler : ICommandHandler<SubmitLoanApplicationCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICreditScoreService _creditScoreService;

    public SubmitLoanApplicationCommandHandler(
        IApplicationDbContext context,
        ICreditScoreService creditScoreService)
    {
        _context = context;
        _creditScoreService = creditScoreService;
    }

    public async Task<Result> Handle(
        SubmitLoanApplicationCommand request,
        CancellationToken cancellationToken)
    {
        var application = await _context.LoanApplications
            .Include(a => a.BorrowerProfile)
            .FirstOrDefaultAsync(
                a => a.Id == LoanApplicationId.From(request.ApplicationId),
                cancellationToken);

        if (application == null)
            return Result.Failure(DomainErrors.Application.NotFound);

        var borrowerProfile = application.BorrowerProfile;

        if (borrowerProfile.KycStatus != Domain.Enums.VerificationStatus.Verified)
            return Result.Failure(DomainErrors.Borrower.KycNotVerified);

        // Get credit score if not already available
        int creditScore;
        RiskGrade riskGrade;

        if (borrowerProfile.CreditScore.HasValue && borrowerProfile.RiskGrade != null)
        {
            creditScore = borrowerProfile.CreditScore.Value;
            riskGrade = borrowerProfile.RiskGrade;
        }
        else
        {
            // In a real scenario, we would fetch from credit bureau
            // For now, use a placeholder
            creditScore = 700;
            riskGrade = RiskGrade.FromCreditScore(creditScore);
            borrowerProfile.UpdateCreditScore(creditScore, riskGrade);
        }

        var result = application.Submit(creditScore, riskGrade, borrowerProfile.DebtToIncomeRatio);

        if (result.IsFailure)
            return result;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
