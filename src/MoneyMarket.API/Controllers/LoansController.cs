using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoneyMarket.API.Authorization;
using MoneyMarket.Application.Features.Loans.Commands.CreateLoan;
using MoneyMarket.Application.Features.Loans.Commands.DisburseLoan;
using MoneyMarket.Application.Features.Loans.Commands.FundLoan;
using MoneyMarket.Application.Features.Loans.Queries.GetLoan;
using MoneyMarket.Application.Features.Loans.Queries.GetMarketplaceLoans;

namespace MoneyMarket.API.Controllers;

/// <summary>
/// API endpoints for loan management and marketplace.
/// </summary>
[Authorize]
public class LoansController : ApiControllerBase
{
    /// <summary>
    /// Creates a new loan from an approved application.
    /// </summary>
    /// <param name="command">The create loan command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created loan ID.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.CrmOrAdmin)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateLoanCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        return HandleCreatedResult(
            result,
            nameof(GetLoanById),
            id => new { id },
            id => new { LoanId = id });
    }

    /// <summary>
    /// Gets a loan by ID with full details.
    /// </summary>
    /// <param name="id">The loan ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The loan details including fundings and schedule.</returns>
    [HttpGet("{id:guid}", Name = nameof(GetLoanById))]
    [ProducesResponseType(typeof(LoanDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLoanById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new GetLoanQuery(id),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Gets loans available in the marketplace.
    /// </summary>
    /// <param name="riskGrades">Filter by risk grades.</param>
    /// <param name="minAmount">Minimum loan amount.</param>
    /// <param name="maxAmount">Maximum loan amount.</param>
    /// <param name="minInterestRate">Minimum interest rate.</param>
    /// <param name="maxInterestRate">Maximum interest rate.</param>
    /// <param name="minTermMonths">Minimum term in months.</param>
    /// <param name="maxTermMonths">Maximum term in months.</param>
    /// <param name="sortBy">Sort field (amount, rate, term, funded, deadline).</param>
    /// <param name="sortDescending">Sort in descending order.</param>
    /// <param name="page">Page number.</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of marketplace loans.</returns>
    [HttpGet("marketplace")]
    [Authorize(Policy = PolicyNames.LenderOnly)]
    [ProducesResponseType(typeof(MarketplaceLoansDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMarketplace(
        [FromQuery] List<string>? riskGrades,
        [FromQuery] decimal? minAmount,
        [FromQuery] decimal? maxAmount,
        [FromQuery] decimal? minInterestRate,
        [FromQuery] decimal? maxInterestRate,
        [FromQuery] int? minTermMonths,
        [FromQuery] int? maxTermMonths,
        [FromQuery] string? sortBy,
        [FromQuery] bool sortDescending = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(
            new GetMarketplaceLoansQuery(
                riskGrades,
                minAmount,
                maxAmount,
                minInterestRate,
                maxInterestRate,
                minTermMonths,
                maxTermMonths,
                sortBy,
                sortDescending,
                page,
                pageSize),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Funds a loan as a lender.
    /// </summary>
    /// <param name="id">The loan ID.</param>
    /// <param name="request">The funding request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The funding ID.</returns>
    [HttpPost("{id:guid}/fund")]
    [Authorize(Policy = PolicyNames.LenderOnly)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Fund(
        Guid id,
        [FromBody] FundLoanRequest request,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new FundLoanCommand(id, request.LenderProfileId, request.Amount),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Disburses a fully funded loan to the borrower.
    /// </summary>
    /// <param name="id">The loan ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("{id:guid}/disburse")]
    [Authorize(Policy = PolicyNames.CrmOrAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Disburse(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new DisburseLoanCommand(id),
            cancellationToken);

        if (result.IsSuccess)
            return NoContent();

        return HandleResult(result);
    }
}

/// <summary>
/// Request model for funding a loan.
/// </summary>
public record FundLoanRequest(Guid LenderProfileId, decimal Amount);
