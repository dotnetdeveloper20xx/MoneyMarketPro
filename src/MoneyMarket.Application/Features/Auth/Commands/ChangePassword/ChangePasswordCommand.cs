using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Auth.Commands.ChangePassword;

public record ChangePasswordCommand(
    Guid UserId,
    string CurrentPassword,
    string NewPassword) : ICommand;
