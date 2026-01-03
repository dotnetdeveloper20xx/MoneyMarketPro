using Microsoft.Extensions.Logging;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Infrastructure.Services;

/// <summary>
/// Credit score service implementation.
/// Integrates with credit bureaus for score retrieval.
/// </summary>
public class CreditScoreService : ICreditScoreService
{
    private readonly ILogger<CreditScoreService> _logger;
    private readonly IDateTimeProvider _dateTimeProvider;

    public CreditScoreService(
        ILogger<CreditScoreService> logger,
        IDateTimeProvider dateTimeProvider)
    {
        _logger = logger;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<CreditScoreResult>> GetCreditScoreAsync(
        string ssn,
        string firstName,
        string lastName,
        Address address,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Retrieving credit score for {FirstName} {LastName}",
            firstName,
            lastName);

        try
        {
            // TODO: Implement actual credit bureau API integration
            // This would call Experian, TransUnion, Equifax APIs

            // For development, return a mock score
            var mockScore = new Random().Next(550, 800);
            var riskGrade = RiskGrade.FromCreditScore(mockScore);

            var result = new CreditScoreResult(
                Score: mockScore,
                Bureau: "Mock",
                RetrievedAt: _dateTimeProvider.UtcNow,
                RiskGrade: riskGrade);

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve credit score");
            return Result.Failure<CreditScoreResult>(
                new Error("CreditScore.RetrievalFailed", ex.Message));
        }
    }
}
