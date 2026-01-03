using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Lenders.Queries.GetLenderProfile;

public class GetLenderProfileQueryHandler : IQueryHandler<GetLenderProfileQuery, LenderProfileDto>
{
    private readonly IApplicationDbContext _context;

    public GetLenderProfileQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LenderProfileDto>> Handle(
        GetLenderProfileQuery request,
        CancellationToken cancellationToken)
    {
        var profile = await _context.LenderProfiles
            .Include(l => l.User)
            .FirstOrDefaultAsync(
                l => l.Id == LenderProfileId.From(request.LenderProfileId),
                cancellationToken);

        if (profile == null)
            return Result.Failure<LenderProfileDto>(DomainErrors.Lender.NotFound);

        return Result.Success(MapToDto(profile));
    }

    private static LenderProfileDto MapToDto(Domain.Entities.LenderProfile profile)
    {
        return new LenderProfileDto(
            Id: profile.Id.Value,
            UserId: profile.UserId.Value,
            FullName: profile.User.FullName,
            Email: profile.User.Email,
            AccreditationStatus: profile.AccreditationStatus,
            AccreditationExpiresAt: profile.AccreditationExpiresAt,
            MinInvestmentAmount: profile.MinInvestmentAmount?.Amount,
            MaxInvestmentAmount: profile.MaxInvestmentAmount?.Amount,
            PreferredRiskGrades: profile.GetPreferredRiskGrades().ToList(),
            AutoInvestEnabled: profile.AutoInvestEnabled,
            TotalInvestmentsCount: profile.TotalInvestmentsCount,
            ActiveInvestmentsCount: profile.ActiveInvestmentsCount,
            TotalInvestedAmount: profile.TotalInvestedAmount.Amount,
            TotalEarnedInterest: profile.TotalEarnedInterest.Amount,
            TotalPrincipalReturned: profile.TotalPrincipalReturned.Amount,
            TotalLossesFromDefaults: profile.TotalLossesFromDefaults.Amount,
            NetReturn: profile.NetReturn,
            CreatedAt: profile.CreatedAt);
    }
}

public class GetLenderProfileByUserIdQueryHandler : IQueryHandler<GetLenderProfileByUserIdQuery, LenderProfileDto>
{
    private readonly IApplicationDbContext _context;

    public GetLenderProfileByUserIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LenderProfileDto>> Handle(
        GetLenderProfileByUserIdQuery request,
        CancellationToken cancellationToken)
    {
        var profile = await _context.LenderProfiles
            .Include(l => l.User)
            .FirstOrDefaultAsync(
                l => l.UserId == UserId.From(request.UserId),
                cancellationToken);

        if (profile == null)
            return Result.Failure<LenderProfileDto>(DomainErrors.Lender.NotFound);

        return Result.Success(MapToDto(profile));
    }

    private static LenderProfileDto MapToDto(Domain.Entities.LenderProfile profile)
    {
        return new LenderProfileDto(
            Id: profile.Id.Value,
            UserId: profile.UserId.Value,
            FullName: profile.User.FullName,
            Email: profile.User.Email,
            AccreditationStatus: profile.AccreditationStatus,
            AccreditationExpiresAt: profile.AccreditationExpiresAt,
            MinInvestmentAmount: profile.MinInvestmentAmount?.Amount,
            MaxInvestmentAmount: profile.MaxInvestmentAmount?.Amount,
            PreferredRiskGrades: profile.GetPreferredRiskGrades().ToList(),
            AutoInvestEnabled: profile.AutoInvestEnabled,
            TotalInvestmentsCount: profile.TotalInvestmentsCount,
            ActiveInvestmentsCount: profile.ActiveInvestmentsCount,
            TotalInvestedAmount: profile.TotalInvestedAmount.Amount,
            TotalEarnedInterest: profile.TotalEarnedInterest.Amount,
            TotalPrincipalReturned: profile.TotalPrincipalReturned.Amount,
            TotalLossesFromDefaults: profile.TotalLossesFromDefaults.Amount,
            NetReturn: profile.NetReturn,
            CreatedAt: profile.CreatedAt);
    }
}
