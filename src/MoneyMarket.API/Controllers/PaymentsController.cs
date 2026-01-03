using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoneyMarket.API.Authorization;
using MoneyMarket.Application.Features.Payments.Commands.ProcessPayment;
using MoneyMarket.Application.Features.Payments.Queries.GetPaymentHistory;
using MoneyMarket.Application.Features.Payments.Queries.GetUpcomingPayments;

namespace MoneyMarket.API.Controllers;

/// <summary>
/// API endpoints for payment processing.
/// </summary>
[Authorize]
public class PaymentsController : ApiControllerBase
{
    /// <summary>
    /// Processes a payment for a loan.
    /// </summary>
    /// <param name="command">The process payment command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The payment ID.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.BorrowerOnly)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Process(
        [FromBody] ProcessPaymentCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
            return CreatedAtRoute(
                nameof(GetPaymentHistory),
                new { loanId = command.LoanId },
                new { PaymentId = result.Value });

        return HandleResult(result);
    }

    /// <summary>
    /// Gets payment history for a loan.
    /// </summary>
    /// <param name="loanId">The loan ID.</param>
    /// <param name="page">Page number.</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The payment history.</returns>
    [HttpGet("loan/{loanId:guid}", Name = nameof(GetPaymentHistory))]
    [ProducesResponseType(typeof(PaymentHistoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPaymentHistory(
        Guid loanId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(
            new GetPaymentHistoryQuery(loanId, page, pageSize),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Gets upcoming payments for a borrower.
    /// </summary>
    /// <param name="borrowerProfileId">The borrower profile ID.</param>
    /// <param name="daysAhead">Number of days to look ahead.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The upcoming payments.</returns>
    [HttpGet("upcoming/{borrowerProfileId:guid}")]
    [Authorize(Policy = PolicyNames.BorrowerOnly)]
    [ProducesResponseType(typeof(UpcomingPaymentsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUpcoming(
        Guid borrowerProfileId,
        [FromQuery] int daysAhead = 30,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(
            new GetUpcomingPaymentsQuery(borrowerProfileId, daysAhead),
            cancellationToken);

        return HandleResult(result);
    }
}
