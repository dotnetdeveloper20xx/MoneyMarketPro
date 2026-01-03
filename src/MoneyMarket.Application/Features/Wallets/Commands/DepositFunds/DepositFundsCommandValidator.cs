using FluentValidation;

namespace MoneyMarket.Application.Features.Wallets.Commands.DepositFunds;

public class DepositFundsCommandValidator : AbstractValidator<DepositFundsCommand>
{
    public DepositFundsCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Deposit amount must be greater than zero")
            .LessThanOrEqualTo(100000)
            .WithMessage("Maximum deposit amount is 100,000");
    }
}
