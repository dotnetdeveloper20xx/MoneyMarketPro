using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber = null) : ICommand<AuthenticationResult>;
