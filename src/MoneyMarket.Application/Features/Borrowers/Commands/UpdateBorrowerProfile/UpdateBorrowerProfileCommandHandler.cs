using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.Borrowers.Commands.UpdateBorrowerProfile;

public class UpdateBorrowerProfileCommandHandler : ICommandHandler<UpdateBorrowerProfileCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateBorrowerProfileCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        UpdateBorrowerProfileCommand request,
        CancellationToken cancellationToken)
    {
        var profile = await _context.BorrowerProfiles
            .FirstOrDefaultAsync(
                b => b.Id == BorrowerProfileId.From(request.BorrowerProfileId),
                cancellationToken);

        if (profile == null)
            return Result.Failure(DomainErrors.Borrower.NotFound);

        // Update personal info if provided
        if (!string.IsNullOrWhiteSpace(request.Ssn) &&
            !string.IsNullOrWhiteSpace(request.Street))
        {
            var address = Address.Create(
                request.Street!,
                request.City!,
                request.State!,
                request.PostalCode!,
                request.Country!);

            profile.UpdatePersonalInfo(request.Ssn!, address);
        }

        // Update employment info
        var annualIncome = request.AnnualIncome.HasValue
            ? Money.Create(request.AnnualIncome.Value)
            : null;

        profile.UpdateEmploymentInfo(
            request.EmploymentStatus,
            request.EmployerName,
            request.JobTitle,
            request.YearsEmployed,
            annualIncome);

        // Update financial info
        if (request.MonthlyDebtPayments.HasValue)
        {
            profile.UpdateFinancialInfo(Money.Create(request.MonthlyDebtPayments.Value));
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
