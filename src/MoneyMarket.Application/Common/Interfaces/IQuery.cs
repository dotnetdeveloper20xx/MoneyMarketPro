using MediatR;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Application.Common.Interfaces;

/// <summary>
/// Marker interface for queries that return a Result with a value.
/// </summary>
/// <typeparam name="TResponse">The type of the response value.</typeparam>
public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}
