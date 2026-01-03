using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.LoanApplications.Commands.ReviewLoanApplication;

public class StartReviewCommandHandler : ICommandHandler<StartReviewCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public StartReviewCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(StartReviewCommand request, CancellationToken cancellationToken)
    {
        var application = await _context.LoanApplications
            .FirstOrDefaultAsync(
                a => a.Id == LoanApplicationId.From(request.ApplicationId),
                cancellationToken);

        if (application == null)
            return Result.Failure(DomainErrors.Application.NotFound);

        var reviewerId = _currentUserService.UserId ?? Guid.Empty;
        var result = application.StartReview(reviewerId);

        if (result.IsFailure)
            return result;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public class ApproveLoanApplicationCommandHandler : ICommandHandler<ApproveLoanApplicationCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ApproveLoanApplicationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Guid>> Handle(
        ApproveLoanApplicationCommand request,
        CancellationToken cancellationToken)
    {
        var application = await _context.LoanApplications
            .FirstOrDefaultAsync(
                a => a.Id == LoanApplicationId.From(request.ApplicationId),
                cancellationToken);

        if (application == null)
            return Result.Failure<Guid>(DomainErrors.Application.NotFound);

        var approvedAmount = Money.Create(request.ApprovedAmount);
        var interestRate = InterestRate.Create(request.InterestRate);
        var approvedTerm = request.ApprovedTermMonths.HasValue
            ? LoanTerm.Create(request.ApprovedTermMonths.Value)
            : null;

        var reviewerId = _currentUserService.UserId ?? Guid.Empty;

        var result = application.Approve(
            approvedAmount,
            interestRate,
            approvedTerm,
            request.Notes,
            reviewerId);

        if (result.IsFailure)
            return Result.Failure<Guid>(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(application.Id.Value);
    }
}

public class RejectLoanApplicationCommandHandler : ICommandHandler<RejectLoanApplicationCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RejectLoanApplicationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(
        RejectLoanApplicationCommand request,
        CancellationToken cancellationToken)
    {
        var application = await _context.LoanApplications
            .FirstOrDefaultAsync(
                a => a.Id == LoanApplicationId.From(request.ApplicationId),
                cancellationToken);

        if (application == null)
            return Result.Failure(DomainErrors.Application.NotFound);

        var reviewerId = _currentUserService.UserId ?? Guid.Empty;

        var result = application.Reject(request.Reason, request.Notes, reviewerId);

        if (result.IsFailure)
            return result;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
