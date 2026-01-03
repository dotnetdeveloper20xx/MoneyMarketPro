using Microsoft.EntityFrameworkCore;
using MoneyMarket.Application.Common.Interfaces;
using MoneyMarket.Domain.Common;
using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Persistence;

/// <summary>
/// The main database context for the MoneyMarket application.
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly ICurrentUserService _currentUserService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IDateTimeProvider dateTimeProvider,
        ICurrentUserService currentUserService)
        : base(options)
    {
        _dateTimeProvider = dateTimeProvider;
        _currentUserService = currentUserService;
    }

    // User & Profile DbSets
    public DbSet<User> Users => Set<User>();
    public DbSet<BorrowerProfile> BorrowerProfiles => Set<BorrowerProfile>();
    public DbSet<LenderProfile> LenderProfiles => Set<LenderProfile>();

    // Wallet DbSets
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();

    // Loan DbSets
    public DbSet<LoanApplication> LoanApplications => Set<LoanApplication>();
    public DbSet<Loan> Loans => Set<Loan>();
    public DbSet<LoanFunding> LoanFundings => Set<LoanFunding>();

    // Payment DbSets
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentSchedule> PaymentSchedules => Set<PaymentSchedule>();

    // Auth DbSets
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<IAuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = _dateTimeProvider.UtcNow;
                    entry.Entity.CreatedBy = _currentUserService.UserId;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = _dateTimeProvider.UtcNow;
                    entry.Entity.UpdatedBy = _currentUserService.UserId;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
