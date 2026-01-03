using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.LoanApplications.Queries.GetLoanApplication;

public class GetLoanApplicationQueryHandler : IQueryHandler<GetLoanApplicationQuery, LoanApplicationDto>
{
    private readonly IApplicationDbContext _context;

    public GetLoanApplicationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LoanApplicationDto>> Handle(
        GetLoanApplicationQuery request,
        CancellationToken cancellationToken)
    {
        var application = await _context.LoanApplications
            .Include(a => a.BorrowerProfile)
                .ThenInclude(b => b.User)
            .FirstOrDefaultAsync(
                a => a.Id == LoanApplicationId.From(request.ApplicationId),
                cancellationToken);

        if (application == null)
            return Result.Failure<LoanApplicationDto>(DomainErrors.Application.NotFound);

        var dto = new LoanApplicationDto(
            Id: application.Id.Value,
            BorrowerProfileId: application.BorrowerProfileId.Value,
            BorrowerName: application.BorrowerProfile.User.FullName,
            RequestedAmount: application.RequestedAmount.Amount,
            TermMonths: application.Term.Months,
            Purpose: application.Purpose,
            PurposeDescription: application.PurposeDescription,
            Status: application.Status,
            SubmittedAt: application.SubmittedAt,
            CreditScoreAtApplication: application.CreditScoreAtApplication,
            RiskGradeAtApplication: application.RiskGradeAtApplication?.Grade,
            DebtToIncomeRatioAtApplication: application.DebtToIncomeRatioAtApplication,
            ApprovedAmount: application.ApprovedAmount?.Amount,
            ApprovedInterestRate: application.ApprovedInterestRate?.AnnualPercentage,
            ApprovedTermMonths: application.ApprovedTerm?.Months,
            ReviewedBy: application.ReviewedBy,
            ReviewedAt: application.ReviewedAt,
            ReviewNotes: application.ReviewNotes,
            RejectionReason: application.RejectionReason,
            LoanId: application.LoanId?.Value,
            CreatedAt: application.CreatedAt);

        return Result.Success(dto);
    }
}
