using FluentValidation;

namespace MoneyMarket.Application.Features.LoanApplications.Commands.CreateLoanApplication;

public class CreateLoanApplicationCommandValidator : AbstractValidator<CreateLoanApplicationCommand>
{
    public CreateLoanApplicationCommandValidator()
    {
        RuleFor(x => x.BorrowerProfileId)
            .NotEmpty();

        RuleFor(x => x.RequestedAmount)
            .GreaterThanOrEqualTo(1000)
            .WithMessage("Minimum loan amount is $1,000.")
            .LessThanOrEqualTo(100000)
            .WithMessage("Maximum loan amount is $100,000.");

        RuleFor(x => x.TermMonths)
            .InclusiveBetween(6, 60)
            .WithMessage("Loan term must be between 6 and 60 months.");

        RuleFor(x => x.Purpose)
            .IsInEnum()
            .WithMessage("Invalid loan purpose.");

        RuleFor(x => x.PurposeDescription)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrEmpty(x.PurposeDescription));
    }
}
