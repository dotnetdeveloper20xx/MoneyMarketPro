using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Borrowers.Queries.GetBorrowerProfile;

public class GetBorrowerProfileQueryHandler : IQueryHandler<GetBorrowerProfileQuery, BorrowerProfileDto>
{
    private readonly IApplicationDbContext _context;

    public GetBorrowerProfileQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BorrowerProfileDto>> Handle(
        GetBorrowerProfileQuery request,
        CancellationToken cancellationToken)
    {
        var profile = await _context.BorrowerProfiles
            .Include(b => b.User)
            .FirstOrDefaultAsync(
                b => b.Id == BorrowerProfileId.From(request.BorrowerProfileId),
                cancellationToken);

        if (profile == null)
            return Result.Failure<BorrowerProfileDto>(DomainErrors.Borrower.NotFound);

        return Result.Success(MapToDto(profile));
    }

    private static BorrowerProfileDto MapToDto(Domain.Entities.BorrowerProfile profile)
    {
        return new BorrowerProfileDto(
            Id: profile.Id.Value,
            UserId: profile.UserId.Value,
            FullName: profile.User.FullName,
            Email: profile.User.Email,
            Address: profile.Address != null
                ? new AddressDto(
                    profile.Address.Street,
                    profile.Address.City,
                    profile.Address.State,
                    profile.Address.PostalCode,
                    profile.Address.Country,
                    profile.Address.Unit)
                : null,
            EmploymentStatus: profile.EmploymentStatus,
            EmployerName: profile.EmployerName,
            JobTitle: profile.JobTitle,
            YearsEmployed: profile.YearsEmployed,
            AnnualIncome: profile.AnnualIncome?.Amount,
            MonthlyDebtPayments: profile.MonthlyDebtPayments?.Amount,
            DebtToIncomeRatio: profile.DebtToIncomeRatio,
            CreditScore: profile.CreditScore,
            RiskGrade: profile.RiskGrade?.Grade,
            KycStatus: profile.KycStatus,
            IncomeVerificationStatus: profile.IncomeVerificationStatus,
            TotalLoansCount: profile.TotalLoansCount,
            ActiveLoansCount: profile.ActiveLoansCount,
            TotalBorrowedAmount: profile.TotalBorrowedAmount.Amount,
            TotalRepaidAmount: profile.TotalRepaidAmount.Amount,
            IsEligibleForLoan: profile.IsEligibleForLoan(),
            CreatedAt: profile.CreatedAt);
    }
}

public class GetBorrowerProfileByUserIdQueryHandler : IQueryHandler<GetBorrowerProfileByUserIdQuery, BorrowerProfileDto>
{
    private readonly IApplicationDbContext _context;

    public GetBorrowerProfileByUserIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BorrowerProfileDto>> Handle(
        GetBorrowerProfileByUserIdQuery request,
        CancellationToken cancellationToken)
    {
        var profile = await _context.BorrowerProfiles
            .Include(b => b.User)
            .FirstOrDefaultAsync(
                b => b.UserId == UserId.From(request.UserId),
                cancellationToken);

        if (profile == null)
            return Result.Failure<BorrowerProfileDto>(DomainErrors.Borrower.NotFound);

        return Result.Success(MapToDto(profile));
    }

    private static BorrowerProfileDto MapToDto(Domain.Entities.BorrowerProfile profile)
    {
        return new BorrowerProfileDto(
            Id: profile.Id.Value,
            UserId: profile.UserId.Value,
            FullName: profile.User.FullName,
            Email: profile.User.Email,
            Address: profile.Address != null
                ? new AddressDto(
                    profile.Address.Street,
                    profile.Address.City,
                    profile.Address.State,
                    profile.Address.PostalCode,
                    profile.Address.Country,
                    profile.Address.Unit)
                : null,
            EmploymentStatus: profile.EmploymentStatus,
            EmployerName: profile.EmployerName,
            JobTitle: profile.JobTitle,
            YearsEmployed: profile.YearsEmployed,
            AnnualIncome: profile.AnnualIncome?.Amount,
            MonthlyDebtPayments: profile.MonthlyDebtPayments?.Amount,
            DebtToIncomeRatio: profile.DebtToIncomeRatio,
            CreditScore: profile.CreditScore,
            RiskGrade: profile.RiskGrade?.Grade,
            KycStatus: profile.KycStatus,
            IncomeVerificationStatus: profile.IncomeVerificationStatus,
            TotalLoansCount: profile.TotalLoansCount,
            ActiveLoansCount: profile.ActiveLoansCount,
            TotalBorrowedAmount: profile.TotalBorrowedAmount.Amount,
            TotalRepaidAmount: profile.TotalRepaidAmount.Amount,
            IsEligibleForLoan: profile.IsEligibleForLoan(),
            CreatedAt: profile.CreatedAt);
    }
}
