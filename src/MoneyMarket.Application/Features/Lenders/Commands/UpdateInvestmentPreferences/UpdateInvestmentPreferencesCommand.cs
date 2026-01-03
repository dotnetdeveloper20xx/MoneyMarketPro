using MoneyMarket.Application.Common.Interfaces;

namespace MoneyMarket.Application.Features.Lenders.Commands.UpdateInvestmentPreferences;

public record UpdateInvestmentPreferencesCommand(
    Guid LenderProfileId,
    decimal? MinInvestmentAmount,
    decimal? MaxInvestmentAmount,
    List<string>? PreferredRiskGrades,
    bool AutoInvestEnabled) : ICommand;
