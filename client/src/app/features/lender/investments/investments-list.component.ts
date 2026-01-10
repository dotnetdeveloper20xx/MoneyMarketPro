import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Investment } from '../../../core/models';

@Component({
  selector: 'app-investments-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <div class="mm-page-header__top">
            <div>
              <h1 class="mm-page-header__title">My Investments</h1>
              <p class="mm-page-header__subtitle">
                Track your portfolio performance
              </p>
            </div>
            <a routerLink="/lender/marketplace" mat-raised-button class="mm-btn-primary">
              <mat-icon>add</mat-icon>
              Invest More
            </a>
          </div>
        </div>

        <!-- Loading State -->
        <div class="mm-loading" *ngIf="isLoading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading investments...</p>
        </div>

        <div *ngIf="!isLoading()">
          <!-- Portfolio Summary -->
          <div class="mm-portfolio-summary">
            <div class="mm-portfolio-card mm-portfolio-card--primary">
              <div class="mm-portfolio-card__icon">
                <mat-icon>account_balance_wallet</mat-icon>
              </div>
              <div class="mm-portfolio-card__content">
                <span class="label">Total Invested</span>
                <span class="value">{{ getTotalInvested() | currency:'GBP' }}</span>
              </div>
            </div>

            <div class="mm-portfolio-card">
              <div class="mm-portfolio-card__icon mm-portfolio-card__icon--success">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="mm-portfolio-card__content">
                <span class="label">Total Returns</span>
                <span class="value text-success">{{ getTotalReturns() | currency:'GBP' }}</span>
              </div>
            </div>

            <div class="mm-portfolio-card">
              <div class="mm-portfolio-card__icon mm-portfolio-card__icon--info">
                <mat-icon>pie_chart</mat-icon>
              </div>
              <div class="mm-portfolio-card__content">
                <span class="label">Active Investments</span>
                <span class="value">{{ getActiveCount() }}</span>
              </div>
            </div>

            <div class="mm-portfolio-card">
              <div class="mm-portfolio-card__icon mm-portfolio-card__icon--warning">
                <mat-icon>speed</mat-icon>
              </div>
              <div class="mm-portfolio-card__content">
                <span class="label">Avg. Return Rate</span>
                <span class="value">{{ getAverageRate() | number:'1.1-1' }}%</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="mm-card" *ngIf="investments().length === 0">
            <div class="mm-empty-state">
              <mat-icon>account_balance</mat-icon>
              <h3>No investments yet</h3>
              <p>Start building your portfolio by investing in loans from the marketplace.</p>
              <a routerLink="/lender/marketplace" mat-raised-button class="mm-btn-primary">
                Browse Marketplace
              </a>
            </div>
          </div>

          <!-- Investments Tabs -->
          <mat-tab-group *ngIf="investments().length > 0" class="mm-tabs">
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>play_circle</mat-icon>
                Active ({{ activeInvestments().length }})
              </ng-template>

              <div class="mm-investments-grid">
                <div class="mm-investment-card" *ngFor="let inv of activeInvestments()">
                  <div class="mm-investment-card__header">
                    <span class="mm-badge mm-badge--active">Active</span>
                    <span class="mm-investment-card__rate">{{ inv.interestRate }}% APR</span>
                  </div>

                  <div class="mm-investment-card__amount">{{ inv.amount | currency:'GBP' }}</div>
                  <div class="mm-investment-card__purpose">{{ inv.loanPurpose }}</div>

                  <div class="mm-investment-card__progress">
                    <div class="mm-investment-card__progress-header">
                      <span>Repayment Progress</span>
                      <span>{{ getRepaymentProgress(inv) | number:'1.0-0' }}%</span>
                    </div>
                    <mat-progress-bar mode="determinate" [value]="getRepaymentProgress(inv)">
                    </mat-progress-bar>
                  </div>

                  <div class="mm-investment-card__stats">
                    <div>
                      <span class="label">Invested</span>
                      <span class="value">{{ inv.amount | currency:'GBP' }}</span>
                    </div>
                    <div>
                      <span class="label">Received</span>
                      <span class="value text-success">{{ inv.returnedAmount | currency:'GBP' }}</span>
                    </div>
                    <div>
                      <span class="label">Expected</span>
                      <span class="value">{{ inv.expectedReturn | currency:'GBP' }}</span>
                    </div>
                  </div>

                  <div class="mm-investment-card__next-payment" *ngIf="inv.nextPaymentDate">
                    <mat-icon>event</mat-icon>
                    <span>Next payment: {{ inv.nextPaymentDate | date:'mediumDate' }}</span>
                  </div>
                </div>
              </div>

              <div class="mm-empty-tab" *ngIf="activeInvestments().length === 0">
                <p>No active investments</p>
              </div>
            </mat-tab>

            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>check_circle</mat-icon>
                Completed ({{ completedInvestments().length }})
              </ng-template>

              <div class="mm-investments-grid">
                <div class="mm-investment-card mm-investment-card--completed"
                     *ngFor="let inv of completedInvestments()">
                  <div class="mm-investment-card__header">
                    <span class="mm-badge mm-badge--success">Completed</span>
                    <span class="mm-investment-card__rate">{{ inv.interestRate }}% APR</span>
                  </div>

                  <div class="mm-investment-card__amount">{{ inv.amount | currency:'GBP' }}</div>
                  <div class="mm-investment-card__purpose">{{ inv.loanPurpose }}</div>

                  <div class="mm-investment-card__stats">
                    <div>
                      <span class="label">Invested</span>
                      <span class="value">{{ inv.amount | currency:'GBP' }}</span>
                    </div>
                    <div>
                      <span class="label">Total Return</span>
                      <span class="value text-success">{{ inv.returnedAmount | currency:'GBP' }}</span>
                    </div>
                    <div>
                      <span class="label">Profit</span>
                      <span class="value text-success">
                        +{{ inv.returnedAmount - inv.amount | currency:'GBP' }}
                      </span>
                    </div>
                  </div>

                  <div class="mm-investment-card__completed-date">
                    <mat-icon>check_circle</mat-icon>
                    <span>Completed {{ inv.completedAt | date:'mediumDate' }}</span>
                  </div>
                </div>
              </div>

              <div class="mm-empty-tab" *ngIf="completedInvestments().length === 0">
                <p>No completed investments yet</p>
              </div>
            </mat-tab>

            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>warning</mat-icon>
                Defaulted ({{ defaultedInvestments().length }})
              </ng-template>

              <div class="mm-investments-grid">
                <div class="mm-investment-card mm-investment-card--defaulted"
                     *ngFor="let inv of defaultedInvestments()">
                  <div class="mm-investment-card__header">
                    <span class="mm-badge mm-badge--error">Defaulted</span>
                  </div>

                  <div class="mm-investment-card__amount">{{ inv.amount | currency:'GBP' }}</div>
                  <div class="mm-investment-card__purpose">{{ inv.loanPurpose }}</div>

                  <div class="mm-investment-card__stats">
                    <div>
                      <span class="label">Invested</span>
                      <span class="value">{{ inv.amount | currency:'GBP' }}</span>
                    </div>
                    <div>
                      <span class="label">Recovered</span>
                      <span class="value">{{ inv.returnedAmount | currency:'GBP' }}</span>
                    </div>
                    <div>
                      <span class="label">Loss</span>
                      <span class="value text-error">
                        -{{ inv.amount - inv.returnedAmount | currency:'GBP' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mm-empty-tab" *ngIf="defaultedInvestments().length === 0">
                <p>No defaulted investments - great!</p>
              </div>
            </mat-tab>
          </mat-tab-group>

          <!-- Performance Chart Placeholder -->
          <div class="mm-card mm-performance-section" *ngIf="investments().length > 0">
            <h3>Portfolio Performance</h3>
            <div class="mm-performance-chart">
              <div class="mm-chart-placeholder">
                <mat-icon>show_chart</mat-icon>
                <p>Performance chart coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mm-page-header__top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--mm-spacing-md);

      @media (max-width: 600px) {
        flex-direction: column;
      }
    }

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

    .mm-portfolio-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--mm-spacing-lg);
      margin-bottom: var(--mm-spacing-xl);

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-portfolio-card {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-md);
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      &--primary {
        background: linear-gradient(135deg, var(--mm-primary) 0%, var(--mm-secondary) 100%);
        color: white;

        .mm-portfolio-card__icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .label {
          opacity: 0.9;
        }
      }

      &__icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--mm-light-blue);
        color: var(--mm-primary);
        flex-shrink: 0;

        &--success {
          background: rgba(46, 125, 50, 0.1);
          color: var(--mm-success);
        }

        &--info {
          background: var(--mm-light-blue);
          color: var(--mm-secondary);
        }

        &--warning {
          background: rgba(245, 124, 0, 0.1);
          color: #F57C00;
        }
      }

      &__content {
        .label {
          display: block;
          font-size: 0.75rem;
          color: var(--mm-gray-600);
          text-transform: uppercase;
        }

        .value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--mm-gray-900);
        }
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

    .mm-investments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: var(--mm-spacing-lg);
    }

    .mm-investment-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      &--completed {
        border-left: 4px solid var(--mm-success);
      }

      &--defaulted {
        border-left: 4px solid var(--mm-error);
        opacity: 0.8;
      }

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--mm-spacing-md);
      }

      &__rate {
        font-weight: 600;
        color: var(--mm-success);
      }

      &__amount {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--mm-gray-900);
      }

      &__purpose {
        color: var(--mm-gray-600);
        margin-bottom: var(--mm-spacing-md);
      }

      &__progress {
        margin-bottom: var(--mm-spacing-md);
        padding: var(--mm-spacing-md);
        background: var(--mm-gray-100);
        border-radius: var(--mm-radius-sm);
      }

      &__progress-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        margin-bottom: var(--mm-spacing-xs);
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--mm-spacing-md);
        padding: var(--mm-spacing-md) 0;
        border-top: 1px solid var(--mm-gray-200);

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

      &__next-payment, &__completed-date {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-sm);
        font-size: 0.875rem;
        color: var(--mm-gray-600);
        margin-top: var(--mm-spacing-md);
        padding-top: var(--mm-spacing-md);
        border-top: 1px solid var(--mm-gray-200);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      &__completed-date {
        color: var(--mm-success);
      }
    }

    .mm-empty-tab {
      text-align: center;
      padding: var(--mm-spacing-xxl);
      color: var(--mm-gray-600);
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
    }

    .mm-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);
    }

    .mm-performance-section {
      margin-top: var(--mm-spacing-xl);

      h3 {
        margin: 0 0 var(--mm-spacing-lg);
      }
    }

    .mm-chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      background: var(--mm-gray-100);
      border-radius: var(--mm-radius-md);
      color: var(--mm-gray-400);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: var(--mm-spacing-sm);
      }
    }

    .text-success {
      color: var(--mm-success) !important;
    }

    .text-error {
      color: var(--mm-error) !important;
    }
  `]
})
export class InvestmentsListComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  isLoading = signal(true);
  investments = signal<Investment[]>([]);

  ngOnInit(): void {
    this.loadInvestments();
  }

  private loadInvestments(): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    // First get lender profile
    this.apiService.getLenderProfileByUserId(userId).subscribe({
      next: (profile) => {
        this.apiService.getLenderInvestments(profile.id).subscribe({
          next: (investments) => {
            this.investments.set(investments);
            this.isLoading.set(false);
          },
          error: () => {
            this.investments.set([]);
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.investments.set([]);
        this.isLoading.set(false);
      }
    });
  }

  activeInvestments(): Investment[] {
    return this.investments().filter(i => i.status === 'Active');
  }

  completedInvestments(): Investment[] {
    return this.investments().filter(i => i.status === 'Completed');
  }

  defaultedInvestments(): Investment[] {
    return this.investments().filter(i => i.status === 'Defaulted');
  }

  getTotalInvested(): number {
    return this.investments().reduce((sum, inv) => sum + inv.amount, 0);
  }

  getTotalReturns(): number {
    return this.investments().reduce((sum, inv) => sum + inv.returnedAmount, 0);
  }

  getActiveCount(): number {
    return this.activeInvestments().length;
  }

  getAverageRate(): number {
    const active = this.activeInvestments();
    if (active.length === 0) return 0;
    const totalRate = active.reduce((sum, inv) => sum + inv.interestRate, 0);
    return totalRate / active.length;
  }

  getRepaymentProgress(inv: Investment): number {
    if (inv.expectedReturn === 0) return 0;
    return (inv.returnedAmount / inv.expectedReturn) * 100;
  }
}
