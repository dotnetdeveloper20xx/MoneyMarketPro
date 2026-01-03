using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Auth.Commands.Login;

public record LoginCommand(
    string Email,
    string Password) : ICommand<AuthenticationResult>;
