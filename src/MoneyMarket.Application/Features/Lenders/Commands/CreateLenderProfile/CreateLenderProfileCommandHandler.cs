using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Entities;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Features.Lenders.Commands.CreateLenderProfile;

public class CreateLenderProfileCommandHandler : ICommandHandler<CreateLenderProfileCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateLenderProfileCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        CreateLenderProfileCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == UserId.From(request.UserId), cancellationToken);

        if (user == null)
            return Result.Failure<Guid>(new Error("User.NotFound", "User not found."));

        if (!user.HasRole(UserRole.Lender))
            return Result.Failure<Guid>(new Error("User.InvalidRole", "User must have Lender role."));

        var existingProfile = await _context.LenderProfiles
            .AnyAsync(l => l.UserId == user.Id, cancellationToken);

        if (existingProfile)
            return Result.Failure<Guid>(new Error("Lender.ProfileExists", "Lender profile already exists."));

        var profile = LenderProfile.Create(user.Id);

        _context.LenderProfiles.Add(profile);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(profile.Id.Value);
    }
}
