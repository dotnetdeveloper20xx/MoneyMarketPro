using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Lenders.Queries.GetLenderInvestments;

public class GetLenderInvestmentsQueryHandler : IQueryHandler<GetLenderInvestmentsQuery, LenderInvestmentsDto>
{
    private readonly IApplicationDbContext _context;

    public GetLenderInvestmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LenderInvestmentsDto>> Handle(
        GetLenderInvestmentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.LoanFundings
            .Include(f => f.Loan)
            .Where(f => f.LenderProfileId == LenderProfileId.From(request.LenderProfileId));

        if (request.ActiveOnly)
        {
            query = query.Where(f => !f.IsFullyReturned);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var investments = await query
            .OrderByDescending(f => f.FundedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new InvestmentDto(
                f.Id.Value,
                f.LoanId.Value,
                f.Amount.Amount,
                f.InterestRate.AnnualPercentage,
                f.FundedAt,
                f.ExpectedInterest.Amount,
                f.ReceivedPrincipal.Amount,
                f.ReceivedInterest.Amount,
                f.IsFullyReturned,
                f.SharePercentage,
                f.Loan.Status.ToString(),
                f.Loan.RiskGrade.Grade))
            .ToListAsync(cancellationToken);

        return Result.Success(new LenderInvestmentsDto(
            investments,
            totalCount,
            request.Page,
            request.PageSize));
    }
}
