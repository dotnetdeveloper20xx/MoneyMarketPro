import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Loan, UpcomingPayment, Wallet } from '../../../core/models';

@Component({
  selector: 'app-borrower-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <h1 class="mm-page-header__title">
            Welcome back, {{ authService.currentUser()?.firstName }}!
          </h1>
          <p class="mm-page-header__subtitle">
            Here's an overview of your borrowing activity
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="mm-quick-actions">
          <a routerLink="/borrower/apply" mat-raised-button class="mm-btn-primary">
            <mat-icon>add</mat-icon>
            Apply for a loan
          </a>
          <a routerLink="/borrower/wallet" mat-button class="mm-btn-outline">
            <mat-icon>account_balance_wallet</mat-icon>
            View wallet
          </a>
        </div>

        <!-- Stats Grid -->
        <div class="mm-dashboard-grid">
          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--primary">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ wallet()?.totalBalance | currency:'GBP' }}</div>
            <div class="mm-stat-card__label">Wallet Balance</div>
          </div>

          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--success">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ activeLoans().length }}</div>
            <div class="mm-stat-card__label">Active Loans</div>
          </div>

          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--warning">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ nextPayment()?.amount | currency:'GBP' }}</div>
            <div class="mm-stat-card__label">Next Payment Due</div>
          </div>

          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--primary">
              <mat-icon>trending_down</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ totalOwed() | currency:'GBP' }}</div>
            <div class="mm-stat-card__label">Total Outstanding</div>
          </div>
        </div>

        <!-- Active Loans Section -->
        <section class="mm-section">
          <div class="mm-section__header">
            <h2>Active Loans</h2>
            <a routerLink="/borrower/loans" mat-button>View all</a>
          </div>

          <div class="mm-card" *ngIf="!isLoading() && activeLoans().length === 0">
            <div class="mm-empty-state">
              <mat-icon>account_balance</mat-icon>
              <h3>No active loans</h3>
              <p>You don't have any active loans yet. Apply for a loan to get started.</p>
              <a routerLink="/borrower/apply" mat-raised-button class="mm-btn-primary">
                Apply for a loan
              </a>
            </div>
          </div>

          <div class="mm-loans-grid" *ngIf="activeLoans().length > 0">
            <div class="mm-loan-card" *ngFor="let loan of activeLoans()">
              <div class="mm-loan-card__header">
                <span class="mm-badge mm-badge--active">{{ loan.status }}</span>
                <span class="mm-loan-card__rate">{{ loan.interestRate }}% APR</span>
              </div>
              <div class="mm-loan-card__amount">{{ loan.amount | currency:'GBP' }}</div>
              <div class="mm-loan-card__purpose">{{ loan.purpose }}</div>
              <div class="mm-loan-card__details">
                <div>
                  <span class="label">Remaining</span>
                  <span class="value">{{ loan.remainingBalance | currency:'GBP' }}</span>
                </div>
                <div>
                  <span class="label">Monthly</span>
                  <span class="value">{{ loan.monthlyPayment | currency:'GBP' }}</span>
                </div>
              </div>
              <div class="mm-loan-card__progress">
                <div class="mm-loan-card__progress-bar">
                  <div
                    class="mm-loan-card__progress-fill"
                    [style.width.%]="getRepaymentProgress(loan)"
                  ></div>
                </div>
                <span class="mm-loan-card__progress-text">
                  {{ getRepaymentProgress(loan) | number:'1.0-0' }}% repaid
                </span>
              </div>
              <a [routerLink]="['/borrower/loans', loan.id]" mat-button class="mm-loan-card__action">
                View details
              </a>
            </div>
          </div>
        </section>

        <!-- Upcoming Payments Section -->
        <section class="mm-section">
          <div class="mm-section__header">
            <h2>Upcoming Payments</h2>
          </div>

          <div class="mm-card" *ngIf="upcomingPayments().length === 0">
            <p class="text-muted">No upcoming payments</p>
          </div>

          <table mat-table [dataSource]="upcomingPayments()" class="mm-table" *ngIf="upcomingPayments().length > 0">
            <ng-container matColumnDef="loan">
              <th mat-header-cell *matHeaderCellDef>Loan</th>
              <td mat-cell *matCellDef="let payment">{{ payment.loanPurpose }}</td>
            </ng-container>

            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef>Due Date</th>
              <td mat-cell *matCellDef="let payment">{{ payment.dueDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let payment">{{ payment.amount | currency:'GBP' }}</td>
            </ng-container>

            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let payment">
                <button mat-raised-button class="mm-btn-primary" size="small">
                  Pay now
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="paymentColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: paymentColumns;"></tr>
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

    .mm-loans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--mm-spacing-lg);
    }

    .mm-loan-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--mm-spacing-md);
      }

      &__rate {
        font-weight: 600;
        color: var(--mm-primary);
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

      &__details {
        display: flex;
        gap: var(--mm-spacing-xl);
        margin-bottom: var(--mm-spacing-md);
        padding: var(--mm-spacing-md) 0;
        border-top: 1px solid var(--mm-gray-200);
        border-bottom: 1px solid var(--mm-gray-200);

        > div {
          .label {
            display: block;
            font-size: 0.75rem;
            color: var(--mm-gray-600);
            text-transform: uppercase;
          }

          .value {
            font-weight: 600;
            color: var(--mm-gray-900);
          }
        }
      }

      &__progress {
        margin-bottom: var(--mm-spacing-md);
      }

      &__progress-bar {
        height: 8px;
        background: var(--mm-gray-200);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--mm-spacing-xs);
      }

      &__progress-fill {
        height: 100%;
        background: var(--mm-success);
        border-radius: 4px;
        transition: width 0.3s ease;
      }

      &__progress-text {
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
export class BorrowerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);

  isLoading = signal(true);
  wallet = signal<Wallet | null>(null);
  activeLoans = signal<Loan[]>([]);
  upcomingPayments = signal<UpcomingPayment[]>([]);

  paymentColumns = ['loan', 'dueDate', 'amount', 'action'];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    // Load wallet
    this.apiService.getWallet(userId).subscribe({
      next: (wallet) => this.wallet.set(wallet),
      error: () => this.wallet.set({ walletId: '', userId, availableBalance: 0, pendingBalance: 0, reservedBalance: 0, totalBalance: 0, lastUpdatedAt: new Date().toISOString() })
    });

    // For demo purposes, set some sample data
    this.isLoading.set(false);
    this.activeLoans.set([]);
    this.upcomingPayments.set([]);
  }

  get totalOwed(): () => number {
    return () => this.activeLoans().reduce((sum, loan) => sum + loan.remainingBalance, 0);
  }

  get nextPayment(): () => UpcomingPayment | null {
    return () => this.upcomingPayments()[0] ?? null;
  }

  getRepaymentProgress(loan: Loan): number {
    if (loan.amount === 0) return 0;
    return ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
  }
}
