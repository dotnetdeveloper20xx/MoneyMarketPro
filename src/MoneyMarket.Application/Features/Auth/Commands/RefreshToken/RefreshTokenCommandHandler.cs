using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : ICommandHandler<RefreshTokenCommand, AuthenticationResult>
{
    private readonly IAuthenticationService _authenticationService;

    public RefreshTokenCommandHandler(IAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    public async Task<Result<AuthenticationResult>> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        return await _authenticationService.RefreshTokenAsync(
            request.AccessToken,
            request.RefreshToken,
            cancellationToken);
    }
}
