using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : ICommandHandler<LoginCommand, AuthenticationResult>
{
    private readonly IAuthenticationService _authenticationService;

    public LoginCommandHandler(IAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    public async Task<Result<AuthenticationResult>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        return await _authenticationService.LoginAsync(
            request.Email,
            request.Password,
            cancellationToken);
    }
}
