using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Loans.Queries.GetLoan;

public class GetLoanQueryHandler : IQueryHandler<GetLoanQuery, LoanDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetLoanQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LoanDetailDto>> Handle(
        GetLoanQuery request,
        CancellationToken cancellationToken)
    {
        var loan = await _context.Loans
            .Include(l => l.BorrowerProfile)
                .ThenInclude(b => b.User)
            .Include(l => l.Fundings)
                .ThenInclude(f => f.LenderProfile)
                    .ThenInclude(lp => lp.User)
            .Include(l => l.PaymentSchedule)
            .FirstOrDefaultAsync(
                l => l.Id == LoanId.From(request.LoanId),
                cancellationToken);

        if (loan == null)
            return Result.Failure<LoanDetailDto>(DomainErrors.Loan.NotFound);

        var dto = new LoanDetailDto(
            Id: loan.Id.Value,
            ApplicationId: loan.ApplicationId.Value,
            BorrowerProfileId: loan.BorrowerProfileId.Value,
            BorrowerName: loan.BorrowerProfile.User.FullName,
            PrincipalAmount: loan.PrincipalAmount.Amount,
            InterestRate: loan.InterestRate.AnnualPercentage,
            TermMonths: loan.Term.Months,
            RiskGrade: loan.RiskGrade.Grade,
            Purpose: loan.Purpose,
            Status: loan.Status,
            TotalInterest: loan.TotalInterest.Amount,
            TotalRepaymentAmount: loan.TotalRepaymentAmount.Amount,
            MonthlyPaymentAmount: loan.MonthlyPaymentAmount.Amount,
            ListedAt: loan.ListedAt,
            FundingDeadline: loan.FundingDeadline,
            FullyFundedAt: loan.FullyFundedAt,
            DisbursedAt: loan.DisbursedAt,
            FirstPaymentDueDate: loan.FirstPaymentDueDate,
            MaturityDate: loan.MaturityDate,
            FundedAmount: loan.FundedAmount.Amount,
            FundingPercentage: loan.FundingPercentage,
            OutstandingPrincipal: loan.OutstandingPrincipal.Amount,
            OutstandingInterest: loan.OutstandingInterest.Amount,
            TotalPaidPrincipal: loan.TotalPaidPrincipal.Amount,
            TotalPaidInterest: loan.TotalPaidInterest.Amount,
            PaymentsMade: loan.PaymentsMade,
            PaymentsMissed: loan.PaymentsMissed,
            Fundings: loan.Fundings.Select(f => new LoanFundingDto(
                f.Id.Value,
                f.LenderProfileId.Value,
                f.LenderProfile.User.FullName,
                f.Amount.Amount,
                f.SharePercentage,
                f.FundedAt)).ToList(),
            Schedule: loan.PaymentSchedule
                .OrderBy(s => s.PaymentNumber)
                .Select(s => new PaymentScheduleDto(
                    s.PaymentNumber,
                    s.DueDate,
                    s.PrincipalDue.Amount,
                    s.InterestDue.Amount,
                    s.TotalDue.Amount,
                    s.Status.ToString(),
                    s.PaidAt)).ToList(),
            CreatedAt: loan.CreatedAt);

        return Result.Success(dto);
    }
}
