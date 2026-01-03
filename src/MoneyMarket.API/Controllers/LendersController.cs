using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoneyMarket.API.Authorization;
using MoneyMarket.Application.Features.Lenders.Commands.CreateLenderProfile;
using MoneyMarket.Application.Features.Lenders.Commands.UpdateInvestmentPreferences;
using MoneyMarket.Application.Features.Lenders.Queries.GetLenderInvestments;
using MoneyMarket.Application.Features.Lenders.Queries.GetLenderProfile;

namespace MoneyMarket.API.Controllers;

/// <summary>
/// API endpoints for lender profile management.
/// </summary>
[Authorize]
public class LendersController : ApiControllerBase
{
    /// <summary>
    /// Creates a new lender profile for a user.
    /// </summary>
    /// <param name="command">The create lender profile command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created lender profile ID.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.LenderOnly)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateLenderProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        return HandleCreatedResult(
            result,
            nameof(GetLenderById),
            id => new { id },
            id => new { LenderProfileId = id });
    }

    /// <summary>
    /// Gets a lender profile by ID.
    /// </summary>
    /// <param name="id">The lender profile ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The lender profile details.</returns>
    [HttpGet("{id:guid}", Name = nameof(GetLenderById))]
    [ProducesResponseType(typeof(LenderProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLenderById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new GetLenderProfileQuery(id),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Gets a lender profile by user ID.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The lender profile details.</returns>
    [HttpGet("by-user/{userId:guid}")]
    [ProducesResponseType(typeof(LenderProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByUserId(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new GetLenderProfileByUserIdQuery(userId),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Updates a lender's investment preferences.
    /// </summary>
    /// <param name="id">The lender profile ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPut("{id:guid}/preferences")]
    [Authorize(Policy = PolicyNames.LenderOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePreferences(
        Guid id,
        [FromBody] UpdateInvestmentPreferencesRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateInvestmentPreferencesCommand(
            id,
            request.MinInvestmentAmount,
            request.MaxInvestmentAmount,
            request.PreferredRiskGrades,
            request.AutoInvestEnabled);

        var result = await Mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return HandleResult(result);
    }

    /// <summary>
    /// Gets a lender's investments.
    /// </summary>
    /// <param name="id">The lender profile ID.</param>
    /// <param name="activeOnly">Filter to active investments only.</param>
    /// <param name="page">Page number.</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The lender's investments.</returns>
    [HttpGet("{id:guid}/investments")]
    [Authorize(Policy = PolicyNames.LenderOnly)]
    [ProducesResponseType(typeof(LenderInvestmentsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvestments(
        Guid id,
        [FromQuery] bool activeOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(
            new GetLenderInvestmentsQuery(id, activeOnly, page, pageSize),
            cancellationToken);

        return HandleResult(result);
    }
}

/// <summary>
/// Request model for updating investment preferences.
/// </summary>
public record UpdateInvestmentPreferencesRequest(
    decimal? MinInvestmentAmount,
    decimal? MaxInvestmentAmount,
    List<string>? PreferredRiskGrades,
    bool AutoInvestEnabled);
