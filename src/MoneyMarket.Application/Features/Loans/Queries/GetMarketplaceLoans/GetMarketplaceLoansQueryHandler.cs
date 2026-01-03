using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Loans.Queries.GetMarketplaceLoans;

public class GetMarketplaceLoansQueryHandler : IQueryHandler<GetMarketplaceLoansQuery, MarketplaceLoansDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeProvider _dateTimeProvider;

    public GetMarketplaceLoansQueryHandler(
        IApplicationDbContext context,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<MarketplaceLoansDto>> Handle(
        GetMarketplaceLoansQuery request,
        CancellationToken cancellationToken)
    {
        var now = _dateTimeProvider.UtcNow;

        var query = _context.Loans
            .Include(l => l.Fundings)
            .Where(l =>
                (l.Status == LoanStatus.PendingFunding || l.Status == LoanStatus.PartiallyFunded) &&
                l.FundingDeadline > now);

        // Apply filters
        if (request.RiskGrades?.Any() == true)
        {
            query = query.Where(l => request.RiskGrades.Contains(l.RiskGrade.Grade));
        }

        if (request.MinAmount.HasValue)
        {
            query = query.Where(l => l.PrincipalAmount.Amount >= request.MinAmount.Value);
        }

        if (request.MaxAmount.HasValue)
        {
            query = query.Where(l => l.PrincipalAmount.Amount <= request.MaxAmount.Value);
        }

        if (request.MinInterestRate.HasValue)
        {
            query = query.Where(l => l.InterestRate.AnnualPercentage >= request.MinInterestRate.Value);
        }

        if (request.MaxInterestRate.HasValue)
        {
            query = query.Where(l => l.InterestRate.AnnualPercentage <= request.MaxInterestRate.Value);
        }

        if (request.MinTermMonths.HasValue)
        {
            query = query.Where(l => l.Term.Months >= request.MinTermMonths.Value);
        }

        if (request.MaxTermMonths.HasValue)
        {
            query = query.Where(l => l.Term.Months <= request.MaxTermMonths.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "amount" => request.SortDescending
                ? query.OrderByDescending(l => l.PrincipalAmount.Amount)
                : query.OrderBy(l => l.PrincipalAmount.Amount),
            "rate" => request.SortDescending
                ? query.OrderByDescending(l => l.InterestRate.AnnualPercentage)
                : query.OrderBy(l => l.InterestRate.AnnualPercentage),
            "term" => request.SortDescending
                ? query.OrderByDescending(l => l.Term.Months)
                : query.OrderBy(l => l.Term.Months),
            "funded" => request.SortDescending
                ? query.OrderByDescending(l => l.FundedAmount.Amount)
                : query.OrderBy(l => l.FundedAmount.Amount),
            "deadline" => request.SortDescending
                ? query.OrderByDescending(l => l.FundingDeadline)
                : query.OrderBy(l => l.FundingDeadline),
            _ => query.OrderByDescending(l => l.ListedAt)
        };

        var loans = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(l => new MarketplaceLoanDto(
                l.Id.Value,
                l.PrincipalAmount.Amount,
                l.InterestRate.AnnualPercentage,
                l.Term.Months,
                l.RiskGrade.Grade,
                l.Purpose,
                l.FundedAmount.Amount,
                l.FundingPercentage,
                l.FundingDeadline,
                (int)(l.FundingDeadline - now).TotalDays,
                l.Fundings.Count,
                l.ListedAt ?? l.CreatedAt))
            .ToListAsync(cancellationToken);

        return Result.Success(new MarketplaceLoansDto(
            loans,
            totalCount,
            request.Page,
            request.PageSize));
    }
}
