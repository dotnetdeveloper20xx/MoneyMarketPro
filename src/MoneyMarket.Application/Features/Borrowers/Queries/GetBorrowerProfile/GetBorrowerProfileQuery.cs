using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Borrowers.Queries.GetBorrowerProfile;

public record GetBorrowerProfileQuery(Guid BorrowerProfileId) : IQuery<BorrowerProfileDto>;

public record GetBorrowerProfileByUserIdQuery(Guid UserId) : IQuery<BorrowerProfileDto>;
