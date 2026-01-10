import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { MarketplaceLoan, Wallet } from '../../../core/models';

@Component({
  selector: 'app-loan-invest',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <!-- Back Link -->
        <a routerLink="/lender/marketplace" class="mm-back-link">
          <mat-icon>arrow_back</mat-icon>
          Back to Marketplace
        </a>

        <!-- Loading State -->
        <div class="mm-loading" *ngIf="isLoading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading loan details...</p>
        </div>

        <div class="mm-invest-layout" *ngIf="!isLoading() && loan()">
          <!-- Loan Details -->
          <main class="mm-loan-details">
            <div class="mm-loan-header-card">
              <div class="mm-loan-header-card__top">
                <span class="mm-grade-badge mm-grade-badge--lg"
                      [ngClass]="'grade-' + loan()!.riskGrade.toLowerCase()">
                  {{ loan()!.riskGrade }}
                </span>
                <div class="mm-loan-header-card__rate">
                  <span class="label">Interest Rate</span>
                  <span class="value">{{ loan()!.interestRate }}% APR</span>
                </div>
              </div>

              <h1 class="mm-loan-header-card__amount">{{ loan()!.amount | currency:'GBP' }}</h1>
              <p class="mm-loan-header-card__purpose">{{ loan()!.purpose }}</p>

              <div class="mm-loan-header-card__funding">
                <div class="mm-funding-progress">
                  <div class="mm-funding-progress__header">
                    <span>{{ loan()!.fundingProgress }}% funded</span>
                    <span class="mm-funding-progress__remaining">
                      {{ getRemainingToFund() | currency:'GBP' }} remaining
                    </span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="loan()!.fundingProgress">
                  </mat-progress-bar>
                  <div class="mm-funding-progress__footer">
                    <span>{{ loan()!.fundedAmount | currency:'GBP' }} funded</span>
                    <span>
                      <mat-icon>timer</mat-icon>
                      {{ loan()!.daysRemaining }} days left
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loan Information -->
            <div class="mm-card">
              <h3>Loan Details</h3>
              <div class="mm-details-grid">
                <div class="mm-detail-item">
                  <mat-icon>schedule</mat-icon>
                  <div>
                    <span class="label">Loan Term</span>
                    <span class="value">{{ loan()!.termMonths }} months</span>
                  </div>
                </div>
                <div class="mm-detail-item">
                  <mat-icon>verified_user</mat-icon>
                  <div>
                    <span class="label">Credit Score</span>
                    <span class="value">{{ loan()!.borrowerCreditScore }}</span>
                  </div>
                </div>
                <div class="mm-detail-item">
                  <mat-icon>trending_up</mat-icon>
                  <div>
                    <span class="label">Risk Grade</span>
                    <span class="value">Grade {{ loan()!.riskGrade }}</span>
                  </div>
                </div>
                <div class="mm-detail-item">
                  <mat-icon>event</mat-icon>
                  <div>
                    <span class="label">Listed On</span>
                    <span class="value">{{ loan()!.createdAt | date:'mediumDate' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Risk Information -->
            <div class="mm-card">
              <h3>Risk Assessment</h3>
              <div class="mm-risk-info">
                <div class="mm-risk-meter">
                  <div class="mm-risk-meter__bar">
                    <div class="mm-risk-meter__segment grade-a"></div>
                    <div class="mm-risk-meter__segment grade-b"></div>
                    <div class="mm-risk-meter__segment grade-c"></div>
                    <div class="mm-risk-meter__segment grade-d"></div>
                    <div class="mm-risk-meter__segment grade-e"></div>
                    <div class="mm-risk-meter__indicator"
                         [style.left]="getRiskPosition() + '%'">
                    </div>
                  </div>
                  <div class="mm-risk-meter__labels">
                    <span>Lower Risk</span>
                    <span>Higher Risk</span>
                  </div>
                </div>

                <div class="mm-risk-explanation">
                  <h4>What does Grade {{ loan()!.riskGrade }} mean?</h4>
                  <p>{{ getRiskExplanation() }}</p>
                </div>
              </div>
            </div>

            <!-- Expected Returns -->
            <div class="mm-card">
              <h3>Projected Returns</h3>
              <p class="text-muted">Based on investing the maximum available amount</p>

              <div class="mm-returns-table">
                <div class="mm-returns-row">
                  <span>Investment Amount</span>
                  <span>{{ getRemainingToFund() | currency:'GBP' }}</span>
                </div>
                <div class="mm-returns-row">
                  <span>Expected Interest</span>
                  <span class="text-success">+{{ calculateExpectedInterest() | currency:'GBP' }}</span>
                </div>
                <div class="mm-returns-row mm-returns-row--total">
                  <span>Total Return</span>
                  <span class="text-success">{{ calculateTotalReturn() | currency:'GBP' }}</span>
                </div>
              </div>

              <p class="mm-disclaimer">
                *Projected returns are estimates and not guaranteed. Actual returns may vary
                based on borrower repayment behavior.
              </p>
            </div>
          </main>

          <!-- Investment Sidebar -->
          <aside class="mm-invest-sidebar">
            <div class="mm-invest-card">
              <h3>Invest in this Loan</h3>

              <!-- Wallet Balance -->
              <div class="mm-wallet-balance">
                <span class="label">Your Available Balance</span>
                <span class="amount">{{ wallet()?.availableBalance | currency:'GBP' }}</span>
              </div>

              <form [formGroup]="investForm" (ngSubmit)="invest()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Investment Amount</mat-label>
                  <span matPrefix>£&nbsp;</span>
                  <input matInput type="number" formControlName="amount"
                         [max]="getMaxInvestment()">
                  <mat-error *ngIf="investForm.get('amount')?.hasError('required')">
                    Amount is required
                  </mat-error>
                  <mat-error *ngIf="investForm.get('amount')?.hasError('min')">
                    Minimum investment is £25
                  </mat-error>
                  <mat-error *ngIf="investForm.get('amount')?.hasError('max')">
                    Maximum is {{ getMaxInvestment() | currency:'GBP' }}
                  </mat-error>
                </mat-form-field>

                <div class="mm-quick-amounts">
                  <button type="button" mat-stroked-button
                          *ngFor="let amount of quickAmounts"
                          (click)="setAmount(amount)"
                          [disabled]="amount > getMaxInvestment()">
                    £{{ amount }}
                  </button>
                  <button type="button" mat-stroked-button
                          (click)="setAmount(getMaxInvestment())">
                    Max
                  </button>
                </div>

                <!-- Investment Summary -->
                <div class="mm-invest-summary" *ngIf="investForm.get('amount')?.value > 0">
                  <div class="mm-invest-summary__row">
                    <span>Your Investment</span>
                    <span>{{ investForm.get('amount')?.value | currency:'GBP' }}</span>
                  </div>
                  <div class="mm-invest-summary__row">
                    <span>Expected Monthly Return</span>
                    <span class="text-success">
                      {{ calculateMonthlyReturn(investForm.get('amount')?.value) | currency:'GBP' }}
                    </span>
                  </div>
                  <div class="mm-invest-summary__row">
                    <span>Total Expected Return</span>
                    <span class="text-success">
                      {{ calculateReturnForAmount(investForm.get('amount')?.value) | currency:'GBP' }}
                    </span>
                  </div>
                </div>

                <button mat-raised-button class="mm-btn-primary full-width"
                        type="submit"
                        [disabled]="investForm.invalid || isInvesting() || !hasEnoughBalance()">
                  <mat-spinner *ngIf="isInvesting()" diameter="20"></mat-spinner>
                  <span *ngIf="!isInvesting()">
                    {{ hasEnoughBalance() ? 'Confirm Investment' : 'Insufficient Balance' }}
                  </span>
                </button>

                <a routerLink="/lender/wallet" mat-button class="full-width"
                   *ngIf="!hasEnoughBalance()">
                  Deposit Funds
                </a>
              </form>

              <div class="mm-invest-info">
                <mat-icon>info</mat-icon>
                <p>
                  By investing, you agree to our terms of service. Your funds will be
                  locked until the loan is fully repaid or defaults.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <!-- Not Found -->
        <div class="mm-card" *ngIf="!isLoading() && !loan()">
          <div class="mm-empty-state">
            <mat-icon>error_outline</mat-icon>
            <h3>Loan not found</h3>
            <p>This loan may no longer be available for investment.</p>
            <a routerLink="/lender/marketplace" mat-raised-button class="mm-btn-primary">
              Browse Marketplace
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mm-back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--mm-spacing-xs);
      color: var(--mm-secondary);
      text-decoration: none;
      margin-bottom: var(--mm-spacing-lg);
      font-size: 0.875rem;

      &:hover {
        text-decoration: underline;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .mm-loading, .mm-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--mm-spacing-xxl);
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--mm-gray-300);
        margin-bottom: var(--mm-spacing-md);
      }

      p {
        color: var(--mm-gray-600);
      }
    }

    .mm-invest-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--mm-spacing-xl);

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-loan-header-card {
      background: linear-gradient(135deg, var(--mm-primary) 0%, var(--mm-secondary) 100%);
      border-radius: var(--mm-radius-lg);
      padding: var(--mm-spacing-xl);
      color: white;
      margin-bottom: var(--mm-spacing-lg);

      &__top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--mm-spacing-md);
      }

      &__rate {
        text-align: right;

        .label {
          display: block;
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .value {
          font-size: 1.5rem;
          font-weight: 700;
        }
      }

      &__amount {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 var(--mm-spacing-xs);
      }

      &__purpose {
        font-size: 1.125rem;
        opacity: 0.9;
        margin: 0 0 var(--mm-spacing-lg);
      }

      &__funding {
        background: rgba(255, 255, 255, 0.15);
        border-radius: var(--mm-radius-md);
        padding: var(--mm-spacing-md);
      }
    }

    .mm-grade-badge--lg {
      width: 48px;
      height: 48px;
      font-size: 1.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 700;

      &.grade-a { background: #2E7D32; }
      &.grade-b { background: #388E3C; }
      &.grade-c { background: #F9A825; color: #000; }
      &.grade-d { background: #EF6C00; }
      &.grade-e { background: #D32F2F; }
    }

    .mm-funding-progress {
      &__header, &__footer {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
      }

      &__header {
        margin-bottom: var(--mm-spacing-xs);
      }

      &__footer {
        margin-top: var(--mm-spacing-xs);
        opacity: 0.8;

        span {
          display: flex;
          align-items: center;
          gap: var(--mm-spacing-xs);

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }
        }
      }

      mat-progress-bar {
        height: 8px;
        border-radius: 4px;

        ::ng-deep .mdc-linear-progress__bar-inner {
          background-color: white;
        }
      }
    }

    .mm-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);
      margin-bottom: var(--mm-spacing-lg);

      h3 {
        margin: 0 0 var(--mm-spacing-lg);
      }
    }

    .mm-details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--mm-spacing-lg);

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-detail-item {
      display: flex;
      gap: var(--mm-spacing-md);

      > mat-icon {
        color: var(--mm-primary);
        flex-shrink: 0;
      }

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

    .mm-risk-meter {
      margin-bottom: var(--mm-spacing-lg);

      &__bar {
        display: flex;
        height: 12px;
        border-radius: 6px;
        overflow: hidden;
        position: relative;
      }

      &__segment {
        flex: 1;

        &.grade-a { background: #2E7D32; }
        &.grade-b { background: #388E3C; }
        &.grade-c { background: #F9A825; }
        &.grade-d { background: #EF6C00; }
        &.grade-e { background: #D32F2F; }
      }

      &__indicator {
        position: absolute;
        top: -4px;
        width: 20px;
        height: 20px;
        background: white;
        border: 3px solid var(--mm-gray-900);
        border-radius: 50%;
        transform: translateX(-50%);
      }

      &__labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--mm-gray-600);
        margin-top: var(--mm-spacing-xs);
      }
    }

    .mm-risk-explanation {
      background: var(--mm-gray-100);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-md);

      h4 {
        margin: 0 0 var(--mm-spacing-sm);
        font-size: 0.875rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--mm-gray-600);
      }
    }

    .mm-returns-table {
      margin-bottom: var(--mm-spacing-md);
    }

    .mm-returns-row {
      display: flex;
      justify-content: space-between;
      padding: var(--mm-spacing-sm) 0;
      border-bottom: 1px solid var(--mm-gray-100);

      &--total {
        border-top: 2px solid var(--mm-gray-200);
        border-bottom: none;
        padding-top: var(--mm-spacing-md);
        font-weight: 600;
        font-size: 1.125rem;
      }
    }

    .mm-disclaimer {
      font-size: 0.75rem;
      color: var(--mm-gray-600);
      font-style: italic;
    }

    .mm-invest-sidebar {
      @media (max-width: 1024px) {
        order: -1;
      }
    }

    .mm-invest-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-md);
      position: sticky;
      top: var(--mm-spacing-lg);

      h3 {
        margin: 0 0 var(--mm-spacing-lg);
        text-align: center;
      }
    }

    .mm-wallet-balance {
      text-align: center;
      padding: var(--mm-spacing-md);
      background: var(--mm-light-blue);
      border-radius: var(--mm-radius-md);
      margin-bottom: var(--mm-spacing-lg);

      .label {
        display: block;
        font-size: 0.75rem;
        color: var(--mm-gray-600);
        text-transform: uppercase;
      }

      .amount {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--mm-primary);
      }
    }

    .mm-quick-amounts {
      display: flex;
      gap: var(--mm-spacing-xs);
      margin-bottom: var(--mm-spacing-lg);
      flex-wrap: wrap;

      button {
        flex: 1;
        min-width: 60px;
      }
    }

    .mm-invest-summary {
      background: var(--mm-gray-100);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-md);
      margin-bottom: var(--mm-spacing-lg);

      &__row {
        display: flex;
        justify-content: space-between;
        padding: var(--mm-spacing-xs) 0;

        &:last-child {
          border-top: 1px solid var(--mm-gray-200);
          padding-top: var(--mm-spacing-sm);
          margin-top: var(--mm-spacing-sm);
          font-weight: 600;
        }
      }
    }

    .mm-invest-info {
      display: flex;
      gap: var(--mm-spacing-sm);
      margin-top: var(--mm-spacing-lg);
      padding: var(--mm-spacing-md);
      background: var(--mm-gray-100);
      border-radius: var(--mm-radius-md);
      font-size: 0.75rem;
      color: var(--mm-gray-600);

      mat-icon {
        flex-shrink: 0;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      p {
        margin: 0;
      }
    }

    .full-width {
      width: 100%;
    }

    .text-muted {
      color: var(--mm-gray-600);
    }

    .text-success {
      color: var(--mm-success) !important;
    }
  `]
})
export class LoanInvestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(true);
  isInvesting = signal(false);
  loan = signal<MarketplaceLoan | null>(null);
  wallet = signal<Wallet | null>(null);

  quickAmounts = [100, 250, 500, 1000];

  investForm: FormGroup = this.fb.group({
    amount: [100, [Validators.required, Validators.min(25)]]
  });

  ngOnInit(): void {
    const loanId = this.route.snapshot.paramMap.get('id');
    if (loanId) {
      this.loadLoan(loanId);
      this.loadWallet();
    } else {
      this.isLoading.set(false);
    }
  }

  private loadLoan(id: string): void {
    // In a real app, we'd have a getLoan endpoint
    // For now, get all marketplace loans and find the one
    this.apiService.getMarketplaceLoans().subscribe({
      next: (loans) => {
        const loan = loans.find(l => l.id === id);
        this.loan.set(loan || null);
        this.updateFormValidation();
        this.isLoading.set(false);
      },
      error: () => {
        this.loan.set(null);
        this.isLoading.set(false);
      }
    });
  }

  private loadWallet(): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    this.apiService.getWallet(userId).subscribe({
      next: (wallet) => this.wallet.set(wallet),
      error: () => this.wallet.set({
        walletId: '',
        userId,
        availableBalance: 0,
        pendingBalance: 0,
        reservedBalance: 0,
        totalBalance: 0,
        lastUpdatedAt: new Date().toISOString()
      })
    });
  }

  private updateFormValidation(): void {
    const max = this.getMaxInvestment();
    this.investForm.get('amount')?.setValidators([
      Validators.required,
      Validators.min(25),
      Validators.max(max)
    ]);
    this.investForm.get('amount')?.updateValueAndValidity();
  }

  getRemainingToFund(): number {
    const loan = this.loan();
    if (!loan) return 0;
    return loan.amount - loan.fundedAmount;
  }

  getMaxInvestment(): number {
    const remaining = this.getRemainingToFund();
    const available = this.wallet()?.availableBalance || 0;
    return Math.min(remaining, available);
  }

  hasEnoughBalance(): boolean {
    const amount = this.investForm.get('amount')?.value || 0;
    return (this.wallet()?.availableBalance || 0) >= amount;
  }

  setAmount(amount: number): void {
    this.investForm.patchValue({ amount });
  }

  getRiskPosition(): number {
    const loan = this.loan();
    if (!loan) return 0;

    const positions: Record<string, number> = {
      'A': 10,
      'B': 30,
      'C': 50,
      'D': 70,
      'E': 90
    };
    return positions[loan.riskGrade] || 50;
  }

  getRiskExplanation(): string {
    const loan = this.loan();
    if (!loan) return '';

    const explanations: Record<string, string> = {
      'A': 'Lowest risk. Borrowers have excellent credit history and strong repayment capacity. Expected default rate < 2%.',
      'B': 'Low risk. Borrowers have good credit scores and stable income. Expected default rate 2-4%.',
      'C': 'Moderate risk. Borrowers have fair credit with some minor issues. Expected default rate 4-7%.',
      'D': 'Higher risk. Borrowers may have credit challenges or shorter credit history. Expected default rate 7-12%.',
      'E': 'Highest risk. Borrowers have significant credit issues. Higher returns but expected default rate > 12%.'
    };
    return explanations[loan.riskGrade] || '';
  }

  calculateMonthlyReturn(amount: number): number {
    const loan = this.loan();
    if (!loan || !amount) return 0;
    return (amount * loan.interestRate / 100 / 12);
  }

  calculateReturnForAmount(amount: number): number {
    const loan = this.loan();
    if (!loan || !amount) return 0;
    const interest = amount * (loan.interestRate / 100) * (loan.termMonths / 12);
    return amount + interest;
  }

  calculateExpectedInterest(): number {
    const loan = this.loan();
    if (!loan) return 0;
    const amount = this.getRemainingToFund();
    return amount * (loan.interestRate / 100) * (loan.termMonths / 12);
  }

  calculateTotalReturn(): number {
    return this.getRemainingToFund() + this.calculateExpectedInterest();
  }

  invest(): void {
    if (this.investForm.invalid || !this.loan()) return;

    this.isInvesting.set(true);

    const amount = this.investForm.get('amount')?.value;
    const loanId = this.loan()!.id;

    this.apiService.fundLoan(loanId, { amount }).subscribe({
      next: () => {
        this.snackBar.open('Investment successful!', 'Close', {
          duration: 5000,
          panelClass: ['mm-snackbar-success']
        });
        this.router.navigate(['/lender/investments']);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Investment failed', 'Close', {
          duration: 5000,
          panelClass: ['mm-snackbar-error']
        });
        this.isInvesting.set(false);
      }
    });
  }
}
