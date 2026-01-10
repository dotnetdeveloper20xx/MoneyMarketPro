import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan, LoanStatus } from '../../../core/models';

@Component({
  selector: 'app-loans-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <h1 class="mm-page-header__title">My Loans</h1>
          <p class="mm-page-header__subtitle">
            View and manage your active and past loans
          </p>
        </div>

        <!-- Loading State -->
        <div class="mm-loading" *ngIf="isLoading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading loans...</p>
        </div>

        <!-- Empty State -->
        <div class="mm-card" *ngIf="!isLoading() && loans().length === 0">
          <div class="mm-empty-state">
            <mat-icon>account_balance</mat-icon>
            <h3>No loans yet</h3>
            <p>You don't have any loans. Apply for a loan to get started.</p>
            <a routerLink="/borrower/apply" mat-raised-button class="mm-btn-primary">
              Apply for a Loan
            </a>
          </div>
        </div>

        <!-- Loan Tabs -->
        <mat-tab-group *ngIf="!isLoading() && loans().length > 0" class="mm-tabs">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>play_circle</mat-icon>
              Active ({{ activeLoans().length }})
            </ng-template>

            <div class="mm-loans-grid">
              <div class="mm-loan-card" *ngFor="let loan of activeLoans()">
                <div class="mm-loan-card__header">
                  <span class="mm-badge" [ngClass]="getStatusClass(loan.status)">
                    {{ loan.status }}
                  </span>
                  <span class="mm-loan-card__rate">{{ loan.interestRate }}% APR</span>
                </div>

                <div class="mm-loan-card__amount">{{ loan.amount | currency:'GBP' }}</div>
                <div class="mm-loan-card__purpose">{{ loan.purpose }}</div>

                <div class="mm-loan-card__progress">
                  <div class="mm-loan-card__progress-header">
                    <span>Repayment Progress</span>
                    <span>{{ getRepaymentProgress(loan) | number:'1.0-0' }}%</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="getRepaymentProgress(loan)">
                  </mat-progress-bar>
                </div>

                <div class="mm-loan-card__details">
                  <div>
                    <span class="label">Remaining</span>
                    <span class="value">{{ loan.remainingBalance | currency:'GBP' }}</span>
                  </div>
                  <div>
                    <span class="label">Monthly</span>
                    <span class="value">{{ loan.monthlyPayment | currency:'GBP' }}</span>
                  </div>
                  <div>
                    <span class="label">Next Payment</span>
                    <span class="value">{{ loan.nextPaymentDate | date:'mediumDate' }}</span>
                  </div>
                </div>

                <div class="mm-loan-card__actions">
                  <a [routerLink]="['/borrower/loans', loan.id]" mat-stroked-button>
                    View Details
                  </a>
                  <button mat-raised-button class="mm-btn-primary" *ngIf="loan.status === 'Active'">
                    Make Payment
                  </button>
                </div>
              </div>
            </div>

            <div class="mm-empty-tab" *ngIf="activeLoans().length === 0">
              <p>No active loans</p>
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>hourglass_empty</mat-icon>
              Pending Funding ({{ pendingLoans().length }})
            </ng-template>

            <div class="mm-loans-grid">
              <div class="mm-loan-card" *ngFor="let loan of pendingLoans()">
                <div class="mm-loan-card__header">
                  <span class="mm-badge mm-badge--pending">Awaiting Funding</span>
                  <span class="mm-loan-card__rate">{{ loan.interestRate }}% APR</span>
                </div>

                <div class="mm-loan-card__amount">{{ loan.amount | currency:'GBP' }}</div>
                <div class="mm-loan-card__purpose">{{ loan.purpose }}</div>

                <div class="mm-loan-card__progress">
                  <div class="mm-loan-card__progress-header">
                    <span>Funding Progress</span>
                    <span>{{ loan.fundingProgress | number:'1.0-0' }}%</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="loan.fundingProgress"
                                    color="accent"></mat-progress-bar>
                </div>

                <div class="mm-loan-card__funding-info">
                  <div>
                    <mat-icon>account_balance_wallet</mat-icon>
                    <span>{{ loan.fundedAmount | currency:'GBP' }} of {{ loan.amount | currency:'GBP' }} funded</span>
                  </div>
                </div>

                <div class="mm-loan-card__actions">
                  <a [routerLink]="['/borrower/loans', loan.id]" mat-stroked-button class="full-width">
                    View Details
                  </a>
                </div>
              </div>
            </div>

            <div class="mm-empty-tab" *ngIf="pendingLoans().length === 0">
              <p>No loans pending funding</p>
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>check_circle</mat-icon>
              Completed ({{ completedLoans().length }})
            </ng-template>

            <div class="mm-loans-grid">
              <div class="mm-loan-card mm-loan-card--completed" *ngFor="let loan of completedLoans()">
                <div class="mm-loan-card__header">
                  <span class="mm-badge mm-badge--success">Completed</span>
                  <span class="mm-loan-card__date">
                    Paid off {{ loan.endDate | date:'mediumDate' }}
                  </span>
                </div>

                <div class="mm-loan-card__amount">{{ loan.amount | currency:'GBP' }}</div>
                <div class="mm-loan-card__purpose">{{ loan.purpose }}</div>

                <div class="mm-loan-card__details">
                  <div>
                    <span class="label">Total Paid</span>
                    <span class="value">{{ loan.totalRepayment | currency:'GBP' }}</span>
                  </div>
                  <div>
                    <span class="label">Term</span>
                    <span class="value">{{ loan.termMonths }} months</span>
                  </div>
                </div>

                <div class="mm-loan-card__actions">
                  <a [routerLink]="['/borrower/loans', loan.id]" mat-stroked-button class="full-width">
                    View History
                  </a>
                </div>
              </div>
            </div>

            <div class="mm-empty-tab" *ngIf="completedLoans().length === 0">
              <p>No completed loans</p>
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Summary Stats -->
        <div class="mm-summary-cards" *ngIf="!isLoading() && loans().length > 0">
          <div class="mm-summary-card">
            <mat-icon>account_balance</mat-icon>
            <div class="mm-summary-card__content">
              <span class="label">Total Outstanding</span>
              <span class="value">{{ getTotalOutstanding() | currency:'GBP' }}</span>
            </div>
          </div>

          <div class="mm-summary-card">
            <mat-icon>calendar_today</mat-icon>
            <div class="mm-summary-card__content">
              <span class="label">Next Payment Due</span>
              <span class="value">{{ getNextPaymentAmount() | currency:'GBP' }}</span>
              <span class="sublabel" *ngIf="getNextPaymentDate()">
                {{ getNextPaymentDate() | date:'mediumDate' }}
              </span>
            </div>
          </div>

          <div class="mm-summary-card">
            <mat-icon>trending_up</mat-icon>
            <div class="mm-summary-card__content">
              <span class="label">Monthly Payments</span>
              <span class="value">{{ getTotalMonthlyPayments() | currency:'GBP' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mm-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--mm-spacing-xxl);
      gap: var(--mm-spacing-md);

      p {
        color: var(--mm-gray-600);
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

    .mm-tabs {
      ::ng-deep .mat-mdc-tab-body-wrapper {
        padding-top: var(--mm-spacing-lg);
      }
    }

    .mm-loans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: var(--mm-spacing-lg);
    }

    .mm-loan-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      &--completed {
        opacity: 0.85;
      }

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

      &__date {
        font-size: 0.875rem;
        color: var(--mm-gray-600);
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

      &__progress {
        margin-bottom: var(--mm-spacing-md);

        mat-progress-bar {
          height: 8px;
          border-radius: 4px;
        }
      }

      &__progress-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        color: var(--mm-gray-600);
        margin-bottom: var(--mm-spacing-xs);
      }

      &__details {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--mm-spacing-md);
        padding: var(--mm-spacing-md) 0;
        border-top: 1px solid var(--mm-gray-200);
        margin-bottom: var(--mm-spacing-md);

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
            font-size: 0.875rem;
          }
        }
      }

      &__funding-info {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-sm);
        padding: var(--mm-spacing-md);
        background: var(--mm-light-blue);
        border-radius: var(--mm-radius-sm);
        margin-bottom: var(--mm-spacing-md);
        font-size: 0.875rem;
        color: var(--mm-secondary);

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      &__actions {
        display: flex;
        gap: var(--mm-spacing-sm);

        a, button {
          flex: 1;
        }
      }
    }

    .mm-empty-tab {
      text-align: center;
      padding: var(--mm-spacing-xxl);
      color: var(--mm-gray-600);
    }

    .mm-summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--mm-spacing-lg);
      margin-top: var(--mm-spacing-xl);
    }

    .mm-summary-card {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-md);
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      > mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: var(--mm-primary);
      }

      &__content {
        .label {
          display: block;
          font-size: 0.75rem;
          color: var(--mm-gray-600);
          text-transform: uppercase;
        }

        .value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--mm-gray-900);
        }

        .sublabel {
          font-size: 0.875rem;
          color: var(--mm-gray-600);
        }
      }
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class LoansListComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  isLoading = signal(true);
  loans = signal<Loan[]>([]);

  ngOnInit(): void {
    this.loadLoans();
  }

  private loadLoans(): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.apiService.getBorrowerProfileByUserId(userId).subscribe({
      next: (profile) => {
        this.apiService.getBorrowerLoans(profile.id).subscribe({
          next: (loans) => {
            this.loans.set(loans);
            this.isLoading.set(false);
          },
          error: () => {
            this.loans.set([]);
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.loans.set([]);
        this.isLoading.set(false);
      }
    });
  }

  activeLoans(): Loan[] {
    return this.loans().filter(l => l.status === 'Active');
  }

  pendingLoans(): Loan[] {
    return this.loans().filter(l => l.status === 'PendingFunding' || l.status === 'FullyFunded');
  }

  completedLoans(): Loan[] {
    return this.loans().filter(l => l.status === 'Completed');
  }

  getStatusClass(status: LoanStatus): string {
    const classes: Record<LoanStatus, string> = {
      'PendingFunding': 'mm-badge--pending',
      'FullyFunded': 'mm-badge--info',
      'Active': 'mm-badge--active',
      'Completed': 'mm-badge--success',
      'Defaulted': 'mm-badge--error',
      'Cancelled': 'mm-badge--draft'
    };
    return classes[status] || '';
  }

  getRepaymentProgress(loan: Loan): number {
    if (loan.amount === 0) return 0;
    return ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
  }

  getTotalOutstanding(): number {
    return this.activeLoans().reduce((sum, loan) => sum + loan.remainingBalance, 0);
  }

  getTotalMonthlyPayments(): number {
    return this.activeLoans().reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  }

  getNextPaymentAmount(): number {
    const activeLoan = this.activeLoans()
      .filter(l => l.nextPaymentDate)
      .sort((a, b) => new Date(a.nextPaymentDate!).getTime() - new Date(b.nextPaymentDate!).getTime())[0];
    return activeLoan?.nextPaymentAmount || 0;
  }

  getNextPaymentDate(): string | null {
    const activeLoan = this.activeLoans()
      .filter(l => l.nextPaymentDate)
      .sort((a, b) => new Date(a.nextPaymentDate!).getTime() - new Date(b.nextPaymentDate!).getTime())[0];
    return activeLoan?.nextPaymentDate || null;
  }
}
