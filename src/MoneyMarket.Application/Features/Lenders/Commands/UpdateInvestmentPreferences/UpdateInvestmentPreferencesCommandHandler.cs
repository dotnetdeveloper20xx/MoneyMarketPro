using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.Lenders.Commands.UpdateInvestmentPreferences;

public class UpdateInvestmentPreferencesCommandHandler : ICommandHandler<UpdateInvestmentPreferencesCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateInvestmentPreferencesCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        UpdateInvestmentPreferencesCommand request,
        CancellationToken cancellationToken)
    {
        var profile = await _context.LenderProfiles
            .FirstOrDefaultAsync(
                l => l.Id == LenderProfileId.From(request.LenderProfileId),
                cancellationToken);

        if (profile == null)
            return Result.Failure(DomainErrors.Lender.NotFound);

        var minAmount = request.MinInvestmentAmount.HasValue
            ? Money.Create(request.MinInvestmentAmount.Value)
            : null;

        var maxAmount = request.MaxInvestmentAmount.HasValue
            ? Money.Create(request.MaxInvestmentAmount.Value)
            : null;

        profile.UpdateInvestmentPreferences(
            minAmount,
            maxAmount,
            request.PreferredRiskGrades,
            request.AutoInvestEnabled);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
