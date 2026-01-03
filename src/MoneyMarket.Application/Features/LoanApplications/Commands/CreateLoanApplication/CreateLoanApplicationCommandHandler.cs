using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Entities;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.LoanApplications.Commands.CreateLoanApplication;

public class CreateLoanApplicationCommandHandler : ICommandHandler<CreateLoanApplicationCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateLoanApplicationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        CreateLoanApplicationCommand request,
        CancellationToken cancellationToken)
    {
        var borrowerProfile = await _context.BorrowerProfiles
            .FirstOrDefaultAsync(
                b => b.Id == BorrowerProfileId.From(request.BorrowerProfileId),
                cancellationToken);

        if (borrowerProfile == null)
            return Result.Failure<Guid>(DomainErrors.Borrower.NotFound);

        // Check for existing active application
        var hasActiveApplication = await _context.LoanApplications
            .AnyAsync(a =>
                a.BorrowerProfileId == borrowerProfile.Id &&
                (a.Status == LoanStatus.Draft ||
                 a.Status == LoanStatus.Submitted ||
                 a.Status == LoanStatus.UnderReview ||
                 a.Status == LoanStatus.Approved),
                cancellationToken);

        if (hasActiveApplication)
            return Result.Failure<Guid>(DomainErrors.Borrower.DuplicateApplication);

        var requestedAmount = Money.Create(request.RequestedAmount);
        var term = LoanTerm.Create(request.TermMonths);

        var application = LoanApplication.Create(
            borrowerProfile.Id,
            requestedAmount,
            term,
            request.Purpose,
            request.PurposeDescription);

        _context.LoanApplications.Add(application);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(application.Id.Value);
    }
}
