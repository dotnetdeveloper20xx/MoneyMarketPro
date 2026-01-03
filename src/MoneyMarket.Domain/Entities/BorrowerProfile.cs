using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents a borrower's profile containing financial and verification information.
/// </summary>
public class BorrowerProfile : Entity<BorrowerProfileId>, IAuditableEntity
{
    public UserId UserId { get; private set; } = null!;
    public User User { get; private set; } = null!;

    // Personal Information
    public string? Ssn { get; private set; }
    public Address? Address { get; private set; }

    // Employment Information
    public EmploymentStatus EmploymentStatus { get; private set; }
    public string? EmployerName { get; private set; }
    public string? JobTitle { get; private set; }
    public int? YearsEmployed { get; private set; }
    public Money? AnnualIncome { get; private set; }

    // Financial Information
    public Money? MonthlyDebtPayments { get; private set; }
    public RiskGrade? RiskGrade { get; private set; }
    public int? CreditScore { get; private set; }
    public DateTime? CreditScoreUpdatedAt { get; private set; }

    // Verification Status
    public VerificationStatus KycStatus { get; private set; }
    public string? KycVerificationId { get; private set; }
    public DateTime? KycVerifiedAt { get; private set; }
    public VerificationStatus IncomeVerificationStatus { get; private set; }
    public DateTime? IncomeVerifiedAt { get; private set; }

    // Loan History
    public int TotalLoansCount { get; private set; }
    public int ActiveLoansCount { get; private set; }
    public Money TotalBorrowedAmount { get; private set; } = Money.Zero();
    public Money TotalRepaidAmount { get; private set; } = Money.Zero();

    // Navigation
    private readonly List<LoanApplication> _loanApplications = new();
    public IReadOnlyCollection<LoanApplication> LoanApplications => _loanApplications.AsReadOnly();

    private readonly List<Loan> _loans = new();
    public IReadOnlyCollection<Loan> Loans => _loans.AsReadOnly();

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    private BorrowerProfile() { }

    public static BorrowerProfile Create(UserId userId)
    {
        return new BorrowerProfile
        {
            Id = BorrowerProfileId.Create(),
            UserId = userId,
            KycStatus = VerificationStatus.NotStarted,
            IncomeVerificationStatus = VerificationStatus.NotStarted,
            EmploymentStatus = EmploymentStatus.Other
        };
    }

    public void UpdatePersonalInfo(string ssn, Address address)
    {
        Ssn = ssn;
        Address = address;
    }

    public void UpdateEmploymentInfo(
        EmploymentStatus status,
        string? employerName,
        string? jobTitle,
        int? yearsEmployed,
        Money? annualIncome)
    {
        EmploymentStatus = status;
        EmployerName = employerName;
        JobTitle = jobTitle;
        YearsEmployed = yearsEmployed;
        AnnualIncome = annualIncome;
    }

    public void UpdateFinancialInfo(Money monthlyDebtPayments)
    {
        MonthlyDebtPayments = monthlyDebtPayments;
    }

    public void UpdateCreditScore(int score, RiskGrade riskGrade)
    {
        CreditScore = score;
        RiskGrade = riskGrade;
        CreditScoreUpdatedAt = DateTime.UtcNow;
    }

    public void StartKycVerification(string verificationId)
    {
        KycStatus = VerificationStatus.Pending;
        KycVerificationId = verificationId;
    }

    public void CompleteKycVerification(bool success)
    {
        if (success)
        {
            KycStatus = VerificationStatus.Verified;
            KycVerifiedAt = DateTime.UtcNow;
        }
        else
        {
            KycStatus = VerificationStatus.Failed;
        }
    }

    public void VerifyIncome()
    {
        IncomeVerificationStatus = VerificationStatus.Verified;
        IncomeVerifiedAt = DateTime.UtcNow;
    }

    public bool IsEligibleForLoan()
    {
        return KycStatus == VerificationStatus.Verified
               && CreditScore.HasValue
               && CreditScore.Value >= 550
               && AnnualIncome != null
               && AnnualIncome.IsPositive;
    }

    public decimal? DebtToIncomeRatio
    {
        get
        {
            if (AnnualIncome == null || !AnnualIncome.IsPositive || MonthlyDebtPayments == null)
                return null;

            var monthlyIncome = AnnualIncome.Amount / 12;
            return MonthlyDebtPayments.Amount / monthlyIncome * 100;
        }
    }

    public void RecordLoanDisbursed(Money amount)
    {
        TotalLoansCount++;
        ActiveLoansCount++;
        TotalBorrowedAmount = TotalBorrowedAmount.Add(amount);
    }

    public void RecordLoanRepayment(Money amount)
    {
        TotalRepaidAmount = TotalRepaidAmount.Add(amount);
    }

    public void RecordLoanCompleted()
    {
        ActiveLoansCount = Math.Max(0, ActiveLoansCount - 1);
    }
}
