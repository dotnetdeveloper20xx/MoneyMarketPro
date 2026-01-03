using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.LoanApplications.Queries.GetPendingApplications;

public class GetPendingApplicationsQueryHandler : IQueryHandler<GetPendingApplicationsQuery, PendingApplicationsDto>
{
    private readonly IApplicationDbContext _context;

    public GetPendingApplicationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PendingApplicationsDto>> Handle(
        GetPendingApplicationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.LoanApplications
            .Include(a => a.BorrowerProfile)
                .ThenInclude(b => b.User)
            .AsQueryable();

        if (request.Status.HasValue)
        {
            query = query.Where(a => a.Status == request.Status.Value);
        }
        else
        {
            // Default to pending applications
            query = query.Where(a =>
                a.Status == LoanStatus.Submitted ||
                a.Status == LoanStatus.UnderReview);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var applications = await query
            .OrderByDescending(a => a.SubmittedAt ?? a.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new ApplicationSummaryDto(
                a.Id.Value,
                a.BorrowerProfile.User.FirstName + " " + a.BorrowerProfile.User.LastName,
                a.RequestedAmount.Amount,
                a.Term.Months,
                a.Purpose,
                a.Status,
                a.CreditScoreAtApplication,
                a.RiskGradeAtApplication != null ? a.RiskGradeAtApplication.Grade : null,
                a.SubmittedAt,
                a.CreatedAt))
            .ToListAsync(cancellationToken);

        return Result.Success(new PendingApplicationsDto(
            applications,
            totalCount,
            request.Page,
            request.PageSize));
    }
}
