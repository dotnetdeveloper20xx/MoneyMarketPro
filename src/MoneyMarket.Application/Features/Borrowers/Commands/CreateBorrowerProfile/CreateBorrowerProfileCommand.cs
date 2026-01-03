using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Borrowers.Commands.CreateBorrowerProfile;

public record CreateBorrowerProfileCommand(
    Guid UserId) : ICommand<Guid>;
