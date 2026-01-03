using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    (Guid userId, string email)? ValidateAccessToken(string token);
    DateTime GetAccessTokenExpiration();
    DateTime GetRefreshTokenExpiration();
}
