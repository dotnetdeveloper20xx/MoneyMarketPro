using FluentValidation;

namespace MoneyMarket.Application.Features.Loans.Commands.FundLoan;

public class FundLoanCommandValidator : AbstractValidator<FundLoanCommand>
{
    public FundLoanCommandValidator()
    {
        RuleFor(x => x.LoanId)
            .NotEmpty();

        RuleFor(x => x.LenderProfileId)
            .NotEmpty();

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(25)
            .WithMessage("Minimum investment amount is $25.");
    }
}
