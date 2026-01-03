using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents a lender's profile containing investment preferences and history.
/// </summary>
public class LenderProfile : Entity<LenderProfileId>, IAuditableEntity
{
    public UserId UserId { get; private set; } = null!;
    public User User { get; private set; } = null!;

    // Accreditation
    public AccreditationStatus AccreditationStatus { get; private set; }
    public DateTime? AccreditationVerifiedAt { get; private set; }
    public DateTime? AccreditationExpiresAt { get; private set; }

    // Investment Preferences
    public Money? MinInvestmentAmount { get; private set; }
    public Money? MaxInvestmentAmount { get; private set; }
    public string? PreferredRiskGrades { get; private set; } // Comma-separated: "A,B,C"
    public bool AutoInvestEnabled { get; private set; }

    // Investment Statistics
    public int TotalInvestmentsCount { get; private set; }
    public int ActiveInvestmentsCount { get; private set; }
    public Money TotalInvestedAmount { get; private set; } = Money.Zero();
    public Money TotalEarnedInterest { get; private set; } = Money.Zero();
    public Money TotalPrincipalReturned { get; private set; } = Money.Zero();
    public Money TotalLossesFromDefaults { get; private set; } = Money.Zero();

    // Navigation
    private readonly List<LoanFunding> _investments = new();
    public IReadOnlyCollection<LoanFunding> Investments => _investments.AsReadOnly();

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    private LenderProfile() { }

    public static LenderProfile Create(UserId userId)
    {
        return new LenderProfile
        {
            Id = LenderProfileId.Create(),
            UserId = userId,
            AccreditationStatus = AccreditationStatus.NotAccredited,
            AutoInvestEnabled = false
        };
    }

    public void SetAccredited(DateTime expiresAt)
    {
        AccreditationStatus = AccreditationStatus.Accredited;
        AccreditationVerifiedAt = DateTime.UtcNow;
        AccreditationExpiresAt = expiresAt;
    }

    public void ExpireAccreditation()
    {
        AccreditationStatus = AccreditationStatus.Expired;
    }

    public void UpdateInvestmentPreferences(
        Money? minAmount,
        Money? maxAmount,
        IEnumerable<string>? preferredGrades,
        bool autoInvest)
    {
        MinInvestmentAmount = minAmount;
        MaxInvestmentAmount = maxAmount;
        PreferredRiskGrades = preferredGrades != null
            ? string.Join(",", preferredGrades)
            : null;
        AutoInvestEnabled = autoInvest;
    }

    public IEnumerable<string> GetPreferredRiskGrades()
    {
        if (string.IsNullOrWhiteSpace(PreferredRiskGrades))
            return Enumerable.Empty<string>();

        return PreferredRiskGrades.Split(',', StringSplitOptions.RemoveEmptyEntries);
    }

    public bool IsInterestedInGrade(string grade)
    {
        var preferences = GetPreferredRiskGrades().ToList();
        return preferences.Count == 0 || preferences.Contains(grade, StringComparer.OrdinalIgnoreCase);
    }

    public void RecordInvestment(Money amount)
    {
        TotalInvestmentsCount++;
        ActiveInvestmentsCount++;
        TotalInvestedAmount = TotalInvestedAmount.Add(amount);
    }

    public void RecordInterestEarned(Money amount)
    {
        TotalEarnedInterest = TotalEarnedInterest.Add(amount);
    }

    public void RecordPrincipalReturned(Money amount)
    {
        TotalPrincipalReturned = TotalPrincipalReturned.Add(amount);
    }

    public void RecordInvestmentCompleted()
    {
        ActiveInvestmentsCount = Math.Max(0, ActiveInvestmentsCount - 1);
    }

    public void RecordDefault(Money lossAmount)
    {
        TotalLossesFromDefaults = TotalLossesFromDefaults.Add(lossAmount);
        ActiveInvestmentsCount = Math.Max(0, ActiveInvestmentsCount - 1);
    }

    public decimal NetReturn
    {
        get
        {
            if (!TotalInvestedAmount.IsPositive)
                return 0;

            var netEarnings = TotalEarnedInterest.Amount + TotalPrincipalReturned.Amount - TotalLossesFromDefaults.Amount;
            return (netEarnings / TotalInvestedAmount.Amount) * 100;
        }
    }
}
