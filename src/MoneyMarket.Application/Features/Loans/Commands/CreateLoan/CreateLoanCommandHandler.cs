using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Loans.Commands.CreateLoan;

public class CreateLoanCommandHandler : ICommandHandler<CreateLoanCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeProvider _dateTimeProvider;

    public CreateLoanCommandHandler(
        IApplicationDbContext context,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<Guid>> Handle(
        CreateLoanCommand request,
        CancellationToken cancellationToken)
    {
        var application = await _context.LoanApplications
            .FirstOrDefaultAsync(
                a => a.Id == LoanApplicationId.From(request.ApplicationId),
                cancellationToken);

        if (application == null)
            return Result.Failure<Guid>(DomainErrors.Application.NotFound);

        var fundingDeadline = _dateTimeProvider.UtcNow.AddDays(request.FundingDeadlineDays);

        var loanResult = application.CreateLoan(fundingDeadline);

        if (loanResult.IsFailure)
            return Result.Failure<Guid>(loanResult.Error);

        _context.Loans.Add(loanResult.Value);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(loanResult.Value.Id.Value);
    }
}
