import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Investment, Wallet, MarketplaceLoan } from '../../../core/models';

@Component({
  selector: 'app-lender-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <h1 class="mm-page-header__title">
            Welcome back, {{ authService.currentUser()?.firstName }}!
          </h1>
          <p class="mm-page-header__subtitle">
            Here's an overview of your investment portfolio
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="mm-quick-actions">
          <a routerLink="/lender/marketplace" mat-raised-button class="mm-btn-primary">
            <mat-icon>search</mat-icon>
            Browse marketplace
          </a>
          <a routerLink="/lender/wallet" mat-button class="mm-btn-outline">
            <mat-icon>account_balance_wallet</mat-icon>
            Deposit funds
          </a>
        </div>

        <!-- Stats Grid -->
        <div class="mm-dashboard-grid">
          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--primary">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ wallet()?.availableBalance | currency:'GBP' }}</div>
            <div class="mm-stat-card__label">Available to Invest</div>
          </div>

          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--success">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ totalInvested() | currency:'GBP' }}</div>
            <div class="mm-stat-card__label">Total Invested</div>
          </div>

          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--warning">
              <mat-icon>savings</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ totalEarnings() | currency:'GBP' }}</div>
            <div class="mm-stat-card__label">Total Earnings</div>
          </div>

          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--primary">
              <mat-icon>pie_chart</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ investments().length }}</div>
            <div class="mm-stat-card__label">Active Investments</div>
          </div>
        </div>

        <!-- Featured Loans from Marketplace -->
        <section class="mm-section">
          <div class="mm-section__header">
            <h2>Featured Investment Opportunities</h2>
            <a routerLink="/lender/marketplace" mat-button>View all</a>
          </div>

          <div class="mm-marketplace-grid">
            <div class="mm-marketplace-card" *ngFor="let loan of featuredLoans()">
              <div class="mm-marketplace-card__header">
                <span class="mm-badge mm-badge--info">Grade {{ loan.riskGrade }}</span>
                <span class="mm-marketplace-card__rate">{{ loan.interestRate }}% APR</span>
              </div>

              <div class="mm-marketplace-card__amount">{{ loan.amount | currency:'GBP' }}</div>
              <div class="mm-marketplace-card__purpose">{{ loan.purpose }}</div>

              <div class="mm-marketplace-card__meta">
                <div>
                  <mat-icon>schedule</mat-icon>
                  {{ loan.termMonths }} months
                </div>
                <div>
                  <mat-icon>verified_user</mat-icon>
                  Score: {{ loan.borrowerCreditScore }}
                </div>
              </div>

              <div class="mm-marketplace-card__funding">
                <div class="mm-marketplace-card__funding-bar">
                  <div
                    class="mm-marketplace-card__funding-fill"
                    [style.width.%]="loan.fundingProgress"
                  ></div>
                </div>
                <div class="mm-marketplace-card__funding-text">
                  <span>{{ loan.fundingProgress }}% funded</span>
                  <span>{{ loan.daysRemaining }} days left</span>
                </div>
              </div>

              <a [routerLink]="['/lender/marketplace', loan.id]" mat-raised-button class="mm-btn-primary mm-marketplace-card__action">
                Invest now
              </a>
            </div>
          </div>

          <div class="mm-card" *ngIf="featuredLoans().length === 0">
            <div class="mm-empty-state">
              <mat-icon>search</mat-icon>
              <h3>No loans available</h3>
              <p>There are no loans available for investment at the moment. Check back later!</p>
            </div>
          </div>
        </section>

        <!-- Active Investments Section -->
        <section class="mm-section">
          <div class="mm-section__header">
            <h2>Your Investments</h2>
            <a routerLink="/lender/investments" mat-button>View all</a>
          </div>

          <div class="mm-card" *ngIf="investments().length === 0">
            <div class="mm-empty-state">
              <mat-icon>account_balance</mat-icon>
              <h3>No investments yet</h3>
              <p>Start building your portfolio by investing in loans from the marketplace.</p>
              <a routerLink="/lender/marketplace" mat-raised-button class="mm-btn-primary">
                Browse marketplace
              </a>
            </div>
          </div>

          <table mat-table [dataSource]="investments()" class="mm-table" *ngIf="investments().length > 0">
            <ng-container matColumnDef="loan">
              <th mat-header-cell *matHeaderCellDef>Loan</th>
              <td mat-cell *matCellDef="let inv">{{ inv.loanPurpose }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Invested</th>
              <td mat-cell *matCellDef="let inv">{{ inv.amount | currency:'GBP' }}</td>
            </ng-container>

            <ng-container matColumnDef="rate">
              <th mat-header-cell *matHeaderCellDef>Rate</th>
              <td mat-cell *matCellDef="let inv">{{ inv.interestRate }}%</td>
            </ng-container>

            <ng-container matColumnDef="return">
              <th mat-header-cell *matHeaderCellDef>Expected Return</th>
              <td mat-cell *matCellDef="let inv" class="text-success">{{ inv.expectedReturn | currency:'GBP' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let inv">
                <span class="mm-badge" [ngClass]="{
                  'mm-badge--active': inv.status === 'Active',
                  'mm-badge--success': inv.status === 'Completed',
                  'mm-badge--error': inv.status === 'Defaulted'
                }">
                  {{ inv.status }}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="investmentColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: investmentColumns;"></tr>
          </table>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .mm-quick-actions {
      display: flex;
      gap: var(--mm-spacing-md);
      margin-bottom: var(--mm-spacing-xl);

      mat-icon {
        margin-right: var(--mm-spacing-sm);
      }
    }

    .mm-section {
      margin-top: var(--mm-spacing-xl);

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--mm-spacing-md);

        h2 {
          margin: 0;
          font-size: 1.25rem;
        }
      }
    }

    .mm-marketplace-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--mm-spacing-lg);
    }

    .mm-marketplace-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);
      transition: box-shadow var(--mm-transition-normal);

      &:hover {
        box-shadow: var(--mm-shadow-md);
      }

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--mm-spacing-md);
      }

      &__rate {
        font-weight: 700;
        color: var(--mm-success);
        font-size: 1.125rem;
      }

      &__amount {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--mm-gray-900);
      }

      &__purpose {
        color: var(--mm-gray-600);
        margin-bottom: var(--mm-spacing-md);
      }

      &__meta {
        display: flex;
        gap: var(--mm-spacing-lg);
        margin-bottom: var(--mm-spacing-md);
        color: var(--mm-gray-600);
        font-size: 0.875rem;

        > div {
          display: flex;
          align-items: center;
          gap: var(--mm-spacing-xs);

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }

      &__funding {
        margin-bottom: var(--mm-spacing-md);
      }

      &__funding-bar {
        height: 8px;
        background: var(--mm-gray-200);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--mm-spacing-xs);
      }

      &__funding-fill {
        height: 100%;
        background: var(--mm-secondary);
        border-radius: 4px;
      }

      &__funding-text {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--mm-gray-600);
      }

      &__action {
        width: 100%;
      }
    }

    .mm-empty-state {
      text-align: center;
      padding: var(--mm-spacing-xxl);

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--mm-gray-300);
        margin-bottom: var(--mm-spacing-md);
      }

      h3 {
        margin-bottom: var(--mm-spacing-sm);
      }

      p {
        color: var(--mm-gray-600);
        margin-bottom: var(--mm-spacing-lg);
      }
    }

    @media (max-width: 768px) {
      .mm-quick-actions {
        flex-direction: column;
      }
    }
  `]
})
export class LenderDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);

  isLoading = signal(true);
  wallet = signal<Wallet | null>(null);
  investments = signal<Investment[]>([]);
  featuredLoans = signal<MarketplaceLoan[]>([]);

  investmentColumns = ['loan', 'amount', 'rate', 'return', 'status'];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    // Load wallet
    this.apiService.getWallet(userId).subscribe({
      next: (wallet) => this.wallet.set(wallet),
      error: () => this.wallet.set({
        userId,
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
        currency: 'GBP',
        lastUpdated: new Date().toISOString()
      })
    });

    // Load marketplace loans
    this.apiService.getMarketplaceLoans().subscribe({
      next: (loans) => this.featuredLoans.set(loans.slice(0, 3)),
      error: () => this.featuredLoans.set([])
    });

    this.isLoading.set(false);
  }

  totalInvested(): number {
    return this.investments().reduce((sum, inv) => sum + inv.amount, 0);
  }

  totalEarnings(): number {
    return this.investments()
      .filter(inv => inv.status === 'Active' || inv.status === 'Completed')
      .reduce((sum, inv) => sum + (inv.expectedReturn - inv.amount), 0);
  }
}
