using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Lenders.Queries.GetLenderProfile;

public record GetLenderProfileQuery(Guid LenderProfileId) : IQuery<LenderProfileDto>;

public record GetLenderProfileByUserIdQuery(Guid UserId) : IQuery<LenderProfileDto>;
