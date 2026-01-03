using Microsoft.EntityFrameworkCore;
using MoneyMarket.Domain.Entities;

namespace MoneyMarket.Application.Common.Interfaces;

/// <summary>
/// Abstraction for the application database context.
/// Defines the DbSets and save operations needed by the application layer.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<BorrowerProfile> BorrowerProfiles { get; }
    DbSet<LenderProfile> LenderProfiles { get; }
    DbSet<Wallet> Wallets { get; }
    DbSet<WalletTransaction> WalletTransactions { get; }
    DbSet<LoanApplication> LoanApplications { get; }
    DbSet<Loan> Loans { get; }
    DbSet<LoanFunding> LoanFundings { get; }
    DbSet<Payment> Payments { get; }
    DbSet<PaymentSchedule> PaymentSchedules { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
