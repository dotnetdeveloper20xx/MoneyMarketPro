using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Entities;
using MoneyMarket.Domain.Enums;
using MoneyMarket.Domain.ValueObjects;

namespace MoneyMarket.Persistence;

/// <summary>
/// Seeds the database with demo data for development and testing.
/// </summary>
public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;
    private readonly IPasswordHasher _passwordHasher;

    private string _defaultPasswordHash = null!;

    public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger, IPasswordHasher passwordHasher)
    {
        _context = context;
        _logger = logger;
        _passwordHasher = passwordHasher;
    }

    public async Task SeedAsync()
    {
        try
        {
            _logger.LogInformation("Starting database seeding...");

            if (await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Database already seeded. Skipping.");
                return;
            }

            // Hash the default password once for all users
            _defaultPasswordHash = _passwordHasher.HashPassword("Password123!");

            // Seed in order of dependencies
            var users = await SeedUsersAsync();
            var (borrowerProfiles, lenderProfiles) = await SeedProfilesAsync(users);
            await SeedWalletsAsync(users);
            var loanApplications = await SeedLoanApplicationsAsync(borrowerProfiles);
            await SeedLoansAsync(loanApplications, lenderProfiles);

            _logger.LogInformation("Database seeding completed successfully!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task<List<User>> SeedUsersAsync()
    {
        _logger.LogInformation("Seeding users...");

        var users = new List<User>
        {
            // Admin user
            CreateUser("admin@moneymarket.com", "Admin", "User", UserRole.Admin),

            // CRM users
            CreateUser("sarah.johnson@moneymarket.com", "Sarah", "Johnson", UserRole.CRM),
            CreateUser("michael.chen@moneymarket.com", "Michael", "Chen", UserRole.CRM),

            // Support user
            CreateUser("support@moneymarket.com", "Support", "Team", UserRole.Support),

            // Borrower users
            CreateUser("john.smith@example.com", "John", "Smith", UserRole.Borrower),
            CreateUser("emma.wilson@example.com", "Emma", "Wilson", UserRole.Borrower),
            CreateUser("james.brown@example.com", "James", "Brown", UserRole.Borrower),
            CreateUser("olivia.davis@example.com", "Olivia", "Davis", UserRole.Borrower),
            CreateUser("william.taylor@example.com", "William", "Taylor", UserRole.Borrower),
            CreateUser("sophia.anderson@example.com", "Sophia", "Anderson", UserRole.Borrower),
            CreateUser("benjamin.martinez@example.com", "Benjamin", "Martinez", UserRole.Borrower),
            CreateUser("isabella.garcia@example.com", "Isabella", "Garcia", UserRole.Borrower),

            // Lender users
            CreateUser("david.investor@example.com", "David", "Thompson", UserRole.Lender),
            CreateUser("jennifer.capital@example.com", "Jennifer", "White", UserRole.Lender),
            CreateUser("robert.funds@example.com", "Robert", "Harris", UserRole.Lender),
            CreateUser("elizabeth.wealth@example.com", "Elizabeth", "Clark", UserRole.Lender),
            CreateUser("thomas.finance@example.com", "Thomas", "Lewis", UserRole.Lender),
            CreateUser("margaret.invest@example.com", "Margaret", "Walker", UserRole.Lender),
        };

        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} users.", users.Count);
        return users;
    }

    private User CreateUser(string email, string firstName, string lastName, UserRole role)
    {
        var user = User.Create(
            EmailAddress.Create(email),
            _defaultPasswordHash,
            firstName,
            lastName,
            role);

        user.ConfirmEmail();
        user.RecordLogin();

        return user;
    }

    private async Task<(List<BorrowerProfile>, List<LenderProfile>)> SeedProfilesAsync(List<User> users)
    {
        _logger.LogInformation("Seeding profiles...");

        var borrowerProfiles = new List<BorrowerProfile>();
        var lenderProfiles = new List<LenderProfile>();

        var borrowerUsers = users.Where(u => u.HasRole(UserRole.Borrower)).ToList();
        var lenderUsers = users.Where(u => u.HasRole(UserRole.Lender)).ToList();

        // Create borrower profiles with varied data
        var borrowerData = new[]
        {
            (EmploymentStatus.Employed, "Tech Corp", "Software Engineer", 5, 85000m, 750, "A"),
            (EmploymentStatus.Employed, "Finance Inc", "Accountant", 8, 72000m, 720, "B"),
            (EmploymentStatus.Employed, "Healthcare Plus", "Nurse", 3, 58000m, 680, "C"),
            (EmploymentStatus.SelfEmployed, "Self", "Consultant", 10, 95000m, 710, "B"),
            (EmploymentStatus.Employed, "Retail Co", "Manager", 6, 52000m, 650, "C"),
            (EmploymentStatus.Employed, "Education Dept", "Teacher", 12, 48000m, 690, "C"),
            (EmploymentStatus.SelfEmployed, "Gig Economy", "Driver", 2, 32000m, 620, "D"),
            (EmploymentStatus.Employed, "Manufacturing Ltd", "Engineer", 4, 68000m, 740, "B"),
        };

        var addresses = new[]
        {
            Address.Create("123 Main Street", "London", "Greater London", "SW1A 1AA", "UK"),
            Address.Create("456 Oak Avenue", "Manchester", "Greater Manchester", "M1 1AE", "UK"),
            Address.Create("789 Pine Road", "Birmingham", "West Midlands", "B1 1AA", "UK"),
            Address.Create("321 Elm Court", "Leeds", "West Yorkshire", "LS1 1BA", "UK"),
            Address.Create("654 Maple Drive", "Glasgow", "Scotland", "G1 1AA", "UK"),
            Address.Create("987 Cedar Lane", "Edinburgh", "Scotland", "EH1 1AA", "UK"),
            Address.Create("147 Birch Way", "Bristol", "Bristol", "BS1 1AA", "UK"),
            Address.Create("258 Willow Street", "Liverpool", "Merseyside", "L1 1AA", "UK"),
        };

        for (int i = 0; i < borrowerUsers.Count && i < borrowerData.Length; i++)
        {
            var user = borrowerUsers[i];
            var data = borrowerData[i];
            var address = addresses[i];

            var profile = BorrowerProfile.Create(user.Id);
            profile.UpdatePersonalInfo($"XXX-XX-{1000 + i:D4}", address);
            profile.UpdateEmploymentInfo(
                data.Item1,
                data.Item2,
                data.Item3,
                data.Item4,
                Money.Create(data.Item5, "GBP"));
            profile.UpdateFinancialInfo(Money.Create(data.Item5 / 12 * 0.3m, "GBP"));
            profile.UpdateCreditScore(data.Item6, RiskGrade.Create(data.Item7, data.Item6));
            profile.CompleteKycVerification(true);
            profile.VerifyIncome();

            user.SetBorrowerProfile(profile);
            borrowerProfiles.Add(profile);
        }

        // Create lender profiles with varied data
        var lenderData = new[]
        {
            (10000m, 50000m, "A,B", true),
            (5000m, 25000m, "A,B,C", false),
            (25000m, 100000m, "A", true),
            (2000m, 15000m, "B,C,D", false),
            (15000m, 75000m, "A,B", true),
            (8000m, 40000m, "A,B,C", false),
        };

        for (int i = 0; i < lenderUsers.Count && i < lenderData.Length; i++)
        {
            var user = lenderUsers[i];
            var data = lenderData[i];

            var profile = LenderProfile.Create(user.Id);
            profile.UpdateInvestmentPreferences(
                Money.Create(data.Item1, "GBP"),
                Money.Create(data.Item2, "GBP"),
                data.Item3.Split(','),
                data.Item4);
            profile.SetAccredited(DateTime.UtcNow.AddYears(2));

            user.SetLenderProfile(profile);
            lenderProfiles.Add(profile);
        }

        await _context.BorrowerProfiles.AddRangeAsync(borrowerProfiles);
        await _context.LenderProfiles.AddRangeAsync(lenderProfiles);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {BorrowerCount} borrower profiles and {LenderCount} lender profiles.",
            borrowerProfiles.Count, lenderProfiles.Count);

        return (borrowerProfiles, lenderProfiles);
    }

    private async Task SeedWalletsAsync(List<User> users)
    {
        _logger.LogInformation("Seeding wallets...");

        var wallets = new List<Wallet>();

        // Create wallets for borrowers and lenders
        var walletsNeeded = users.Where(u => u.HasRole(UserRole.Borrower) || u.HasRole(UserRole.Lender)).ToList();

        var random = new Random(42); // Fixed seed for reproducibility

        foreach (var user in walletsNeeded)
        {
            var wallet = Wallet.Create(user.Id, "GBP");

            // Add initial deposit for lenders
            if (user.HasRole(UserRole.Lender))
            {
                var depositAmount = random.Next(10000, 100000);
                wallet.Deposit(Money.Create(depositAmount, "GBP"), "Initial deposit");
            }
            else if (user.HasRole(UserRole.Borrower))
            {
                // Small balance for borrowers
                var depositAmount = random.Next(100, 1000);
                wallet.Deposit(Money.Create(depositAmount, "GBP"), "Initial deposit");
            }

            user.SetWallet(wallet);
            wallets.Add(wallet);
        }

        await _context.Wallets.AddRangeAsync(wallets);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} wallets.", wallets.Count);
    }

    private async Task<List<LoanApplication>> SeedLoanApplicationsAsync(List<BorrowerProfile> borrowerProfiles)
    {
        _logger.LogInformation("Seeding loan applications...");

        var applications = new List<LoanApplication>();

        var applicationData = new[]
        {
            // Approved applications (will become loans)
            (0, 15000m, 36, LoanPurpose.HomeImprovement, "Kitchen renovation project", LoanStatus.Approved),
            (1, 8000m, 24, LoanPurpose.DebtConsolidation, "Consolidate credit card debt", LoanStatus.Approved),
            (2, 5000m, 12, LoanPurpose.MedicalExpenses, "Dental surgery", LoanStatus.Approved),
            (3, 25000m, 48, LoanPurpose.BusinessExpansion, "New equipment purchase", LoanStatus.Approved),
            (4, 12000m, 36, LoanPurpose.Vehicle, "Used car purchase", LoanStatus.Approved),

            // Under review
            (5, 20000m, 36, LoanPurpose.Education, "MBA tuition fees", LoanStatus.UnderReview),
            (6, 7500m, 18, LoanPurpose.Wedding, "Wedding expenses", LoanStatus.UnderReview),

            // Submitted (pending review)
            (7, 10000m, 24, LoanPurpose.MajorPurchase, "Home appliances", LoanStatus.Submitted),
            (0, 3000m, 12, LoanPurpose.Vacation, "Family holiday", LoanStatus.Submitted),

            // Draft applications
            (1, 6000m, 18, LoanPurpose.MovingRelocation, "Moving costs", LoanStatus.Draft),
            (2, 4500m, 12, LoanPurpose.EmergencyFund, "Emergency fund", LoanStatus.Draft),

            // Rejected applications
            (3, 50000m, 60, LoanPurpose.Other, "Speculative investment", LoanStatus.Rejected),
        };

        foreach (var data in applicationData)
        {
            if (data.Item1 >= borrowerProfiles.Count) continue;

            var profile = borrowerProfiles[data.Item1];
            var application = LoanApplication.Create(
                profile.Id,
                Money.Create(data.Item2, "GBP"),
                LoanTerm.Create(data.Item3),
                data.Item4,
                data.Item5);

            // Progress the application based on target status
            if (data.Item6 != LoanStatus.Draft)
            {
                var creditScore = profile.CreditScore ?? 650;
                // Create a new RiskGrade instance to avoid EF Core tracking issues
                var riskGrade = RiskGrade.FromCreditScore(creditScore);
                application.Submit(creditScore, riskGrade, profile.DebtToIncomeRatio);
            }

            if (data.Item6 == LoanStatus.UnderReview || data.Item6 == LoanStatus.Approved || data.Item6 == LoanStatus.Rejected)
            {
                application.StartReview(Guid.NewGuid());
            }

            if (data.Item6 == LoanStatus.Approved)
            {
                var interestRate = GetInterestRateForGrade(profile.RiskGrade?.Grade ?? "C");
                // Create a new LoanTerm instance to avoid EF Core tracking issues with owned entities
                var approvedTerm = LoanTerm.Create(data.Item3);
                application.Approve(
                    Money.Create(data.Item2, "GBP"),
                    InterestRate.Create(interestRate),
                    approvedTerm,
                    "Application meets all criteria",
                    Guid.NewGuid());
            }

            if (data.Item6 == LoanStatus.Rejected)
            {
                application.Reject(
                    "Loan amount exceeds acceptable risk threshold for credit profile",
                    "DTI ratio too high for requested amount",
                    Guid.NewGuid());
            }

            applications.Add(application);
        }

        await _context.LoanApplications.AddRangeAsync(applications);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} loan applications.", applications.Count);
        return applications;
    }

    private async Task SeedLoansAsync(List<LoanApplication> applications, List<LenderProfile> lenderProfiles)
    {
        _logger.LogInformation("Seeding loans...");

        var approvedApplications = applications.Where(a => a.Status == LoanStatus.Approved).ToList();
        var loans = new List<Loan>();

        foreach (var application in approvedApplications)
        {
            var loanResult = application.CreateLoan(DateTime.UtcNow.AddDays(30));
            if (loanResult.IsSuccess)
            {
                loans.Add(loanResult.Value);
            }
        }

        await _context.Loans.AddRangeAsync(loans);
        await _context.SaveChangesAsync();

        // Add funding to some loans
        var random = new Random(42);
        var loanIndex = 0;

        foreach (var loan in loans)
        {
            // Vary the funding status
            if (loanIndex == 0)
            {
                // Fully funded
                await FullyFundLoan(loan, lenderProfiles, random);
            }
            else if (loanIndex == 1)
            {
                // Partially funded (60%)
                await PartiallyFundLoan(loan, lenderProfiles, random, 0.6m);
            }
            else if (loanIndex == 2)
            {
                // Partially funded (30%)
                await PartiallyFundLoan(loan, lenderProfiles, random, 0.3m);
            }
            // Rest remain pending funding

            loanIndex++;
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} loans with varied funding statuses.", loans.Count);
    }

    private async Task FullyFundLoan(Loan loan, List<LenderProfile> lenders, Random random)
    {
        var remainingAmount = loan.PrincipalAmount.Amount;
        var lenderIndex = 0;

        while (remainingAmount > 0 && lenderIndex < lenders.Count)
        {
            var lender = lenders[lenderIndex];
            var investmentAmount = Math.Min(remainingAmount, random.Next(1000, 5000));

            loan.AddFunding(lender.Id, Money.Create(investmentAmount, "GBP"));
            // Skip lender.RecordInvestment for seeding - it has currency issues with USD defaults

            remainingAmount -= investmentAmount;
            lenderIndex++;
        }

        // If still not fully funded, top up with first lender
        if (remainingAmount > 0 && lenders.Count > 0)
        {
            loan.AddFunding(lenders[0].Id, Money.Create(remainingAmount, "GBP"));
        }
    }

    private async Task PartiallyFundLoan(Loan loan, List<LenderProfile> lenders, Random random, decimal targetPercentage)
    {
        var targetAmount = loan.PrincipalAmount.Amount * targetPercentage;
        var fundedAmount = 0m;
        var lenderIndex = 0;

        while (fundedAmount < targetAmount && lenderIndex < lenders.Count)
        {
            var lender = lenders[lenderIndex];
            var investmentAmount = Math.Min(targetAmount - fundedAmount, random.Next(500, 3000));

            loan.AddFunding(lender.Id, Money.Create(investmentAmount, "GBP"));
            // Skip lender.RecordInvestment for seeding - it has currency issues with USD defaults

            fundedAmount += investmentAmount;
            lenderIndex++;
        }
    }

    private decimal GetInterestRateForGrade(string grade)
    {
        return grade switch
        {
            "A" => 6.5m,
            "B" => 9.5m,
            "C" => 13.5m,
            "D" => 17.5m,
            "E" => 22.5m,
            _ => 15.0m
        };
    }
}
