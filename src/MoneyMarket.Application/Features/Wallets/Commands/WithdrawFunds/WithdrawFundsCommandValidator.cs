using FluentValidation;

namespace MoneyMarket.Application.Features.Wallets.Commands.WithdrawFunds;

public class WithdrawFundsCommandValidator : AbstractValidator<WithdrawFundsCommand>
{
    public WithdrawFundsCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Withdrawal amount must be greater than zero");
    }
}
