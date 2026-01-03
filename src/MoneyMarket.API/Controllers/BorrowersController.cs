using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoneyMarket.API.Authorization;
using MoneyMarket.Application.Features.Borrowers.Commands.CreateBorrowerProfile;
using MoneyMarket.Application.Features.Borrowers.Commands.UpdateBorrowerProfile;
using MoneyMarket.Application.Features.Borrowers.Queries.GetBorrowerProfile;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.API.Controllers;

/// <summary>
/// API endpoints for borrower profile management.
/// </summary>
[Authorize]
public class BorrowersController : ApiControllerBase
{
    /// <summary>
    /// Creates a new borrower profile for a user.
    /// </summary>
    /// <param name="command">The create borrower profile command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created borrower profile ID.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.BorrowerOnly)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateBorrowerProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        return HandleCreatedResult(
            result,
            nameof(GetById),
            id => new { id },
            id => new { BorrowerProfileId = id });
    }

    /// <summary>
    /// Gets a borrower profile by ID.
    /// </summary>
    /// <param name="id">The borrower profile ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The borrower profile details.</returns>
    [HttpGet("{id:guid}", Name = nameof(GetById))]
    [ProducesResponseType(typeof(BorrowerProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new GetBorrowerProfileQuery(id),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Gets a borrower profile by user ID.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The borrower profile details.</returns>
    [HttpGet("by-user/{userId:guid}")]
    [ProducesResponseType(typeof(BorrowerProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByUserId(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new GetBorrowerProfileByUserIdQuery(userId),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Updates a borrower profile.
    /// </summary>
    /// <param name="id">The borrower profile ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = PolicyNames.BorrowerOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateBorrowerProfileRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateBorrowerProfileCommand(
            id,
            request.Ssn,
            request.Street,
            request.City,
            request.State,
            request.PostalCode,
            request.Country,
            request.EmploymentStatus,
            request.EmployerName,
            request.JobTitle,
            request.YearsEmployed,
            request.AnnualIncome,
            request.MonthlyDebtPayments);

        var result = await Mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return HandleResult(result);
    }
}

/// <summary>
/// Request model for updating a borrower profile.
/// </summary>
public record UpdateBorrowerProfileRequest(
    string? Ssn,
    string? Street,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    EmploymentStatus EmploymentStatus,
    string? EmployerName,
    string? JobTitle,
    int? YearsEmployed,
    decimal? AnnualIncome,
    decimal? MonthlyDebtPayments);
