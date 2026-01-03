namespace MoneyMarket.Domain.Enums;

/// <summary>
/// Represents the intended purpose of a loan application.
/// </summary>
public enum LoanPurpose
{
    DebtConsolidation = 1,
    HomeImprovement = 2,
    MedicalExpenses = 3,
    BusinessExpansion = 4,
    Education = 5,
    Vehicle = 6,
    Wedding = 7,
    Vacation = 8,
    MovingRelocation = 9,
    MajorPurchase = 10,
    EmergencyFund = 11,
    Other = 99
}
