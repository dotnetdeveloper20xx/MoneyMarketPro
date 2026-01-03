using FluentValidation;

namespace MoneyMarket.Application.Features.Borrowers.Commands.UpdateBorrowerProfile;

public class UpdateBorrowerProfileCommandValidator : AbstractValidator<UpdateBorrowerProfileCommand>
{
    public UpdateBorrowerProfileCommandValidator()
    {
        RuleFor(x => x.BorrowerProfileId)
            .NotEmpty();

        When(x => !string.IsNullOrWhiteSpace(x.Ssn), () =>
        {
            RuleFor(x => x.Ssn)
                .Matches(@"^\d{3}-?\d{2}-?\d{4}$")
                .WithMessage("SSN must be in format XXX-XX-XXXX or XXXXXXXXX");
        });

        When(x => !string.IsNullOrWhiteSpace(x.Street), () =>
        {
            RuleFor(x => x.City).NotEmpty().WithMessage("City is required when address is provided.");
            RuleFor(x => x.State).NotEmpty().WithMessage("State is required when address is provided.");
            RuleFor(x => x.PostalCode).NotEmpty().WithMessage("Postal code is required when address is provided.");
            RuleFor(x => x.Country).NotEmpty().WithMessage("Country is required when address is provided.");
        });

        RuleFor(x => x.AnnualIncome)
            .GreaterThan(0)
            .When(x => x.AnnualIncome.HasValue)
            .WithMessage("Annual income must be positive.");

        RuleFor(x => x.MonthlyDebtPayments)
            .GreaterThanOrEqualTo(0)
            .When(x => x.MonthlyDebtPayments.HasValue)
            .WithMessage("Monthly debt payments cannot be negative.");

        RuleFor(x => x.YearsEmployed)
            .InclusiveBetween(0, 60)
            .When(x => x.YearsEmployed.HasValue)
            .WithMessage("Years employed must be between 0 and 60.");
    }
}
