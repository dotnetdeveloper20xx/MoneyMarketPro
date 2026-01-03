using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.Application.Common.Interfaces;

/// <summary>
/// Service for Know Your Customer (KYC) verification.
/// </summary>
public interface IKycVerificationService
{
    /// <summary>
    /// Initiates KYC verification for a user.
    /// </summary>
    Task<Result<KycVerificationResult>> InitiateVerificationAsync(
        Guid userId,
        KycVerificationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks the status of a pending verification.
    /// </summary>
    Task<Result<KycStatusResult>> CheckVerificationStatusAsync(
        string verificationId,
        CancellationToken cancellationToken = default);
}

public record KycVerificationRequest(
    string FirstName,
    string LastName,
    DateOnly DateOfBirth,
    string Ssn,
    string AddressLine1,
    string City,
    string State,
    string PostalCode,
    string Country);

public record KycVerificationResult(
    string VerificationId,
    VerificationStatus Status,
    DateTime InitiatedAt);

public record KycStatusResult(
    string VerificationId,
    VerificationStatus Status,
    string? FailureReason,
    DateTime? CompletedAt);
