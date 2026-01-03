using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoneyMarket.API.Authorization;
using MoneyMarket.Application.Features.Wallets.Commands.DepositFunds;
using MoneyMarket.Application.Features.Wallets.Commands.WithdrawFunds;
using MoneyMarket.Application.Features.Wallets.Queries.GetTransactionHistory;
using MoneyMarket.Application.Features.Wallets.Queries.GetWalletBalance;
using MoneyMarket.Domain.Enums;

namespace MoneyMarket.API.Controllers;

/// <summary>
/// API endpoints for wallet management.
/// </summary>
[Authorize(Policy = PolicyNames.BorrowerOrLender)]
public class WalletsController : ApiControllerBase
{
    /// <summary>
    /// Gets wallet balance for a user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The wallet balance details.</returns>
    [HttpGet("{userId:guid}")]
    [ProducesResponseType(typeof(WalletBalanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBalance(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new GetWalletBalanceQuery(userId),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Gets transaction history for a user's wallet.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="type">Optional transaction type filter.</param>
    /// <param name="fromDate">Optional start date filter.</param>
    /// <param name="toDate">Optional end date filter.</param>
    /// <param name="page">Page number.</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The transaction history.</returns>
    [HttpGet("{userId:guid}/transactions")]
    [ProducesResponseType(typeof(TransactionHistoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransactions(
        Guid userId,
        [FromQuery] TransactionType? type,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(
            new GetTransactionHistoryQuery(userId, type, fromDate, toDate, page, pageSize),
            cancellationToken);

        return HandleResult(result);
    }

    /// <summary>
    /// Deposits funds into a user's wallet.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The deposit request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The transaction ID.</returns>
    [HttpPost("{userId:guid}/deposit")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deposit(
        Guid userId,
        [FromBody] DepositRequest request,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new DepositFundsCommand(userId, request.Amount, request.Reference),
            cancellationToken);

        if (result.IsSuccess)
            return CreatedAtRoute(
                null,
                new { userId },
                new { TransactionId = result.Value });

        return HandleResult(result);
    }

    /// <summary>
    /// Withdraws funds from a user's wallet.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The withdrawal request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The transaction ID.</returns>
    [HttpPost("{userId:guid}/withdraw")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Withdraw(
        Guid userId,
        [FromBody] WithdrawRequest request,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new WithdrawFundsCommand(userId, request.Amount, request.BankAccountReference),
            cancellationToken);

        if (result.IsSuccess)
            return CreatedAtRoute(
                null,
                new { userId },
                new { TransactionId = result.Value });

        return HandleResult(result);
    }
}

/// <summary>
/// Request model for depositing funds.
/// </summary>
public record DepositRequest(decimal Amount, string? Reference = null);

/// <summary>
/// Request model for withdrawing funds.
/// </summary>
public record WithdrawRequest(decimal Amount, string? BankAccountReference = null);
