using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Common.Interfaces;

/// <summary>
/// Service for retrieving credit scores from external bureaus.
/// </summary>
public interface ICreditScoreService
{
    /// <summary>
    /// Retrieves the credit score for a borrower.
    /// </summary>
    Task<Result<CreditScoreResult>> GetCreditScoreAsync(
        string ssn,
        string firstName,
        string lastName,
        Address address,
        CancellationToken cancellationToken = default);
}

public record CreditScoreResult(
    int Score,
    string Bureau,
    DateTime RetrievedAt,
    RiskGrade RiskGrade);
