using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Common.Behaviours;

/// <summary>
/// Pipeline behaviour that logs warnings for long-running requests.
/// </summary>
public class PerformanceBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly Stopwatch _timer;
    private readonly ILogger<PerformanceBehaviour<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUserService;

    private const int WarningThresholdMs = 500;

    public PerformanceBehaviour(
        ILogger<PerformanceBehaviour<TRequest, TResponse>> logger,
        ICurrentUserService currentUserService)
    {
        _timer = new Stopwatch();
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        _timer.Start();

        var response = await next();

        _timer.Stop();

        var elapsedMilliseconds = _timer.ElapsedMilliseconds;

        if (elapsedMilliseconds > WarningThresholdMs)
        {
            var requestName = typeof(TRequest).Name;
            var userId = _currentUserService.UserId;

            _logger.LogWarning(
                "Long Running Request: {RequestName} ({ElapsedMilliseconds}ms) for User {UserId} with {@Request}",
                requestName,
                elapsedMilliseconds,
                userId,
                request);
        }

        return response;
    }
}
