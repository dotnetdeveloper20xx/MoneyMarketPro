using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.Events;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Domain.Entities;

/// <summary>
/// Represents a loan application submitted by a borrower.
/// </summary>
public class LoanApplication : AggregateRoot<LoanApplicationId>, IAuditableEntity
{
    public BorrowerProfileId BorrowerProfileId { get; private set; } = null!;
    public BorrowerProfile BorrowerProfile { get; private set; } = null!;

    // Loan Details
    public Money RequestedAmount { get; private set; } = null!;
    public LoanTerm Term { get; private set; } = null!;
    public LoanPurpose Purpose { get; private set; }
    public string? PurposeDescription { get; private set; }

    // Application State
    public LoanStatus Status { get; private set; }
    public DateTime? SubmittedAt { get; private set; }

    // Review Information
    public Guid? ReviewedBy { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public string? ReviewNotes { get; private set; }
    public string? RejectionReason { get; private set; }

    // Credit Assessment (captured at time of application)
    public int? CreditScoreAtApplication { get; private set; }
    public RiskGrade? RiskGradeAtApplication { get; private set; }
    public decimal? DebtToIncomeRatioAtApplication { get; private set; }

    // Approved Terms (may differ from requested)
    public Money? ApprovedAmount { get; private set; }
    public InterestRate? ApprovedInterestRate { get; private set; }
    public LoanTerm? ApprovedTerm { get; private set; }

    // Resulting Loan
    public LoanId? LoanId { get; private set; }
    public Loan? Loan { get; private set; }

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    private LoanApplication() { }

    public static LoanApplication Create(
        BorrowerProfileId borrowerProfileId,
        Money requestedAmount,
        LoanTerm term,
        LoanPurpose purpose,
        string? purposeDescription = null)
    {
        var application = new LoanApplication
        {
            Id = LoanApplicationId.Create(),
            BorrowerProfileId = borrowerProfileId,
            RequestedAmount = requestedAmount,
            Term = term,
            Purpose = purpose,
            PurposeDescription = purposeDescription,
            Status = LoanStatus.Draft
        };

        return application;
    }

    public Result Submit(int creditScore, RiskGrade riskGrade, decimal? debtToIncomeRatio)
    {
        if (Status != LoanStatus.Draft)
            return Result.Failure(DomainErrors.Application.AlreadySubmitted);

        CreditScoreAtApplication = creditScore;
        RiskGradeAtApplication = riskGrade;
        DebtToIncomeRatioAtApplication = debtToIncomeRatio;

        Status = LoanStatus.Submitted;
        SubmittedAt = DateTime.UtcNow;

        RaiseDomainEvent(new LoanApplicationSubmittedEvent(Id, BorrowerProfileId));

        return Result.Success();
    }

    public Result StartReview(Guid reviewerId)
    {
        if (Status != LoanStatus.Submitted)
            return Result.Failure(new Error("Application.NotSubmitted", "Application must be submitted to start review."));

        Status = LoanStatus.UnderReview;
        ReviewedBy = reviewerId;

        return Result.Success();
    }

    public Result Approve(
        Money approvedAmount,
        InterestRate interestRate,
        LoanTerm? approvedTerm,
        string? notes,
        Guid reviewerId)
    {
        if (Status != LoanStatus.UnderReview)
            return Result.Failure(DomainErrors.Application.NotUnderReview);

        if (approvedAmount > RequestedAmount)
            return Result.Failure(new Error("Application.ExceedsRequested", "Approved amount cannot exceed requested amount."));

        ApprovedAmount = approvedAmount;
        ApprovedInterestRate = interestRate;
        ApprovedTerm = approvedTerm ?? Term;
        ReviewNotes = notes;
        ReviewedBy = reviewerId;
        ReviewedAt = DateTime.UtcNow;
        Status = LoanStatus.Approved;

        RaiseDomainEvent(new LoanApplicationApprovedEvent(Id, BorrowerProfileId, approvedAmount, interestRate));

        return Result.Success();
    }

    public Result Reject(string reason, string? notes, Guid reviewerId)
    {
        if (Status != LoanStatus.UnderReview)
            return Result.Failure(DomainErrors.Application.NotUnderReview);

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(new Error("Application.ReasonRequired", "Rejection reason is required."));

        RejectionReason = reason;
        ReviewNotes = notes;
        ReviewedBy = reviewerId;
        ReviewedAt = DateTime.UtcNow;
        Status = LoanStatus.Rejected;

        RaiseDomainEvent(new LoanApplicationRejectedEvent(Id, BorrowerProfileId, reason));

        return Result.Success();
    }

    public Result<Loan> CreateLoan(DateTime fundingDeadline)
    {
        if (Status != LoanStatus.Approved)
            return Result.Failure<Loan>(new Error("Application.NotApproved", "Application must be approved to create a loan."));

        if (LoanId != null)
            return Result.Failure<Loan>(new Error("Application.LoanExists", "A loan has already been created for this application."));

        var loan = Loan.Create(
            Id,
            BorrowerProfileId,
            ApprovedAmount!,
            ApprovedInterestRate!,
            ApprovedTerm!,
            RiskGradeAtApplication!,
            Purpose,
            fundingDeadline);

        LoanId = loan.Id;
        Loan = loan;
        Status = LoanStatus.PendingFunding;

        return Result.Success(loan);
    }

    public bool CanBeEdited => Status == LoanStatus.Draft;
    public bool IsApproved => Status == LoanStatus.Approved;
    public bool IsRejected => Status == LoanStatus.Rejected;
    public bool IsPending => Status is LoanStatus.Submitted or LoanStatus.UnderReview;
}
