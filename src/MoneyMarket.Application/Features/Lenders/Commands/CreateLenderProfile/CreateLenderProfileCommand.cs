using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Lenders.Commands.CreateLenderProfile;

public record CreateLenderProfileCommand(Guid UserId) : ICommand<Guid>;
