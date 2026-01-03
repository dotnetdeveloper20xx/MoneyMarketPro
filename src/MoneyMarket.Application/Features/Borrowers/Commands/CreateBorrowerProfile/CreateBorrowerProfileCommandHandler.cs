using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Exceptions;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Entities;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Borrowers.Commands.CreateBorrowerProfile;

public class CreateBorrowerProfileCommandHandler : ICommandHandler<CreateBorrowerProfileCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateBorrowerProfileCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        CreateBorrowerProfileCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == UserId.From(request.UserId), cancellationToken);

        if (user == null)
            return Result.Failure<Guid>(new Error("User.NotFound", "User not found."));

        if (!user.HasRole(UserRole.Borrower))
            return Result.Failure<Guid>(new Error("User.InvalidRole", "User must have Borrower role."));

        var existingProfile = await _context.BorrowerProfiles
            .AnyAsync(b => b.UserId == user.Id, cancellationToken);

        if (existingProfile)
            return Result.Failure<Guid>(new Error("Borrower.ProfileExists", "Borrower profile already exists."));

        var profile = BorrowerProfile.Create(user.Id);

        _context.BorrowerProfiles.Add(profile);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(profile.Id.Value);
    }
}
