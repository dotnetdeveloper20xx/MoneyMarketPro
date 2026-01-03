using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoneyMarket.API.Authorization;
using MoneyMarket.Application.Features.LoanApplications.Commands.CreateLoanApplication;
using MoneyMarket.Application.Features.LoanApplications.Commands.ReviewLoanApplication;
using MoneyMarket.Application.Features.LoanApplications.Commands.SubmitLoanApplication;
using MoneyMarket.Application.Features.LoanApplications.Queries.GetLoanApplication;
using MoneyMarket.Application.Features.LoanApplications.Queries.GetPendingApplications;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.API.Controllers;

/// <summary>
/// API endpoints for loan application management.
/// </summary>
[Authorize]
public class LoanApplicationsController : ApiControllerBase
{
    /// <summary>
    /// Creates a new loan application.
    /// </summary>
    /// <param name="command">The create loan application command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created loan application ID.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.BorrowerOnly)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateLoanApplicationCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        return HandleCreatedResult(
            result,
            nameof(GetApplicationById),
            id => new { id },
            id => new { ApplicationId = id });
    }

    /// <summary>
    /// Gets a loan application by ID.
    /// </summary>
    /// <param name="id">The loan application ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The loan application details.</returns>
    [HttpGet("{id:guid}", Name = nameof(GetApplicationById))]
    [ProducesResponseType(typeof(LoanApplicationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetApplicationById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new GetLoanApplicationQuery(id),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Gets pending loan applications for review.
    /// </summary>
    /// <param name="status">Optional status filter.</param>
    /// <param name="page">Page number.</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of pending applications.</returns>
    [HttpGet("pending")]
    [Authorize(Policy = PolicyNames.CrmOrAdmin)]
    [ProducesResponseType(typeof(PendingApplicationsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPending(
        [FromQuery] LoanStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(
            new GetPendingApplicationsQuery(status, page, pageSize),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Submits a loan application for review.
    /// </summary>
    /// <param name="id">The loan application ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("{id:guid}/submit")]
    [Authorize(Policy = PolicyNames.BorrowerOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Submit(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new SubmitLoanApplicationCommand(id),
            cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return HandleResult(result);
    }

    /// <summary>
    /// Starts reviewing a loan application.
    /// </summary>
    /// <param name="id">The loan application ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("{id:guid}/start-review")]
    [Authorize(Policy = PolicyNames.CrmOrAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> StartReview(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new StartReviewCommand(id),
            cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return HandleResult(result);
    }

    /// <summary>
    /// Approves a loan application.
    /// </summary>
    /// <param name="id">The loan application ID.</param>
    /// <param name="request">The approval request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created loan ID.</returns>
    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = PolicyNames.CrmOrAdmin)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(
        Guid id,
        [FromBody] ApproveApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new ApproveLoanApplicationCommand(
                id,
                request.ApprovedAmount,
                request.InterestRate,
                request.ApprovedTermMonths,
                request.Notes),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Rejects a loan application.
    /// </summary>
    /// <param name="id">The loan application ID.</param>
    /// <param name="request">The rejection request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = PolicyNames.CrmOrAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reject(
        Guid id,
        [FromBody] RejectApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new RejectLoanApplicationCommand(id, request.Reason, request.Notes),
            cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return HandleResult(result);
    }
}

/// <summary>
/// Request model for approving an application.
/// </summary>
public record ApproveApplicationRequest(
    decimal ApprovedAmount,
    decimal InterestRate,
    int? ApprovedTermMonths = null,
    string? Notes = null);

/// <summary>
/// Request model for rejecting an application.
/// </summary>
public record RejectApplicationRequest(string Reason, string? Notes = null);
