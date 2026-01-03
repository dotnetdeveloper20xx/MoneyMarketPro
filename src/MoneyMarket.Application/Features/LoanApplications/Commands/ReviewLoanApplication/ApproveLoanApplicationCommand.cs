using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Application.Features.LoanApplications.Commands.ReviewLoanApplication;

public record ApproveLoanApplicationCommand(
    Guid ApplicationId,
    decimal ApprovedAmount,
    decimal InterestRate,
    int? ApprovedTermMonths,
    string? Notes) : ICommand<Guid>;

public record RejectLoanApplicationCommand(
    Guid ApplicationId,
    string Reason,
    string? Notes) : ICommand;

public record StartReviewCommand(Guid ApplicationId) : ICommand;
