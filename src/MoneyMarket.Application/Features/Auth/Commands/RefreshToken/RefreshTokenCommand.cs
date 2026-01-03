using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(
    string AccessToken,
    string RefreshToken) : ICommand<AuthenticationResult>;
