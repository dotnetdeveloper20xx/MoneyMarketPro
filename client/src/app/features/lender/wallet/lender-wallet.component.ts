import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Wallet, WalletTransaction } from '../../../core/models';

@Component({
  selector: 'app-lender-wallet',
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
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <h1 class="mm-page-header__title">My Wallet</h1>
          <p class="mm-page-header__subtitle">
            Manage your investment funds
          </p>
        </div>

        <!-- Loading State -->
        <div class="mm-loading" *ngIf="isLoading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading wallet...</p>
        </div>

        <div *ngIf="!isLoading()">
          <!-- Balance Cards -->
          <div class="mm-balance-grid">
            <div class="mm-balance-card mm-balance-card--primary">
              <div class="mm-balance-card__header">
                <mat-icon>account_balance_wallet</mat-icon>
                <span>Available for Investment</span>
              </div>
              <div class="mm-balance-card__amount">
                {{ wallet()?.availableBalance | currency:'GBP' }}
              </div>
              <div class="mm-balance-card__actions">
                <button mat-raised-button (click)="showDepositForm = true">
                  <mat-icon>add</mat-icon>
                  Deposit
                </button>
                <button mat-stroked-button (click)="showWithdrawForm = true">
                  <mat-icon>remove</mat-icon>
                  Withdraw
                </button>
              </div>
            </div>

            <div class="mm-balance-card">
              <div class="mm-balance-card__header">
                <mat-icon>trending_up</mat-icon>
                <span>Invested</span>
              </div>
              <div class="mm-balance-card__amount">
                {{ wallet()?.pendingBalance | currency:'GBP' }}
              </div>
              <div class="mm-balance-card__subtitle">
                Earning interest
              </div>
            </div>

            <div class="mm-balance-card">
              <div class="mm-balance-card__header">
                <mat-icon>account_balance</mat-icon>
                <span>Total Balance</span>
              </div>
              <div class="mm-balance-card__amount">
                {{ wallet()?.totalBalance | currency:'GBP' }}
              </div>
              <div class="mm-balance-card__subtitle">
                Available + Invested
              </div>
            </div>
          </div>

          <!-- Deposit Form -->
          <div class="mm-card mm-form-card" *ngIf="showDepositForm">
            <div class="mm-form-card__header">
              <h3>Deposit Funds</h3>
              <button mat-icon-button (click)="showDepositForm = false">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <form [formGroup]="depositForm" (ngSubmit)="deposit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Amount</mat-label>
                <span matPrefix>£&nbsp;</span>
                <input matInput type="number" formControlName="amount" min="10">
                <mat-error *ngIf="depositForm.get('amount')?.hasError('required')">
                  Amount is required
                </mat-error>
                <mat-error *ngIf="depositForm.get('amount')?.hasError('min')">
                  Minimum deposit is £10
                </mat-error>
              </mat-form-field>

              <div class="mm-quick-amounts">
                <button type="button" mat-stroked-button
                        *ngFor="let amount of quickAmounts"
                        (click)="setDepositAmount(amount)">
                  £{{ amount }}
                </button>
              </div>

              <div class="mm-payment-method">
                <h4>Payment Method</h4>
                <div class="mm-payment-option selected">
                  <mat-icon>credit_card</mat-icon>
                  <div class="mm-payment-option__details">
                    <span class="name">Debit Card •••• 4242</span>
                    <span class="info">Instant</span>
                  </div>
                  <mat-icon class="check">check_circle</mat-icon>
                </div>
              </div>

              <button mat-raised-button class="mm-btn-primary full-width"
                      type="submit"
                      [disabled]="depositForm.invalid || isProcessing()">
                <mat-spinner *ngIf="isProcessing()" diameter="20"></mat-spinner>
                <span *ngIf="!isProcessing()">
                  Deposit {{ depositForm.get('amount')?.value | currency:'GBP' }}
                </span>
              </button>
            </form>
          </div>

          <!-- Withdraw Form -->
          <div class="mm-card mm-form-card" *ngIf="showWithdrawForm">
            <div class="mm-form-card__header">
              <h3>Withdraw Funds</h3>
              <button mat-icon-button (click)="showWithdrawForm = false">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="mm-available-info">
              <span class="label">Available to withdraw</span>
              <span class="amount">{{ wallet()?.availableBalance | currency:'GBP' }}</span>
            </div>

            <form [formGroup]="withdrawForm" (ngSubmit)="withdraw()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Amount</mat-label>
                <span matPrefix>£&nbsp;</span>
                <input matInput type="number" formControlName="amount" min="10">
                <mat-error *ngIf="withdrawForm.get('amount')?.hasError('required')">
                  Amount is required
                </mat-error>
                <mat-error *ngIf="withdrawForm.get('amount')?.hasError('min')">
                  Minimum withdrawal is £10
                </mat-error>
                <mat-error *ngIf="withdrawForm.get('amount')?.hasError('max')">
                  Insufficient funds
                </mat-error>
              </mat-form-field>

              <button type="button" mat-stroked-button class="full-width"
                      (click)="setWithdrawAmount(wallet()?.availableBalance || 0)"
                      style="margin-bottom: var(--mm-spacing-lg);">
                Withdraw All Available
              </button>

              <div class="mm-payment-method">
                <h4>Withdraw To</h4>
                <div class="mm-payment-option selected">
                  <mat-icon>account_balance</mat-icon>
                  <div class="mm-payment-option__details">
                    <span class="name">Bank Account •••• 1234</span>
                    <span class="info">1-3 business days</span>
                  </div>
                  <mat-icon class="check">check_circle</mat-icon>
                </div>
              </div>

              <button mat-raised-button class="mm-btn-primary full-width"
                      type="submit"
                      [disabled]="withdrawForm.invalid || isProcessing()">
                <mat-spinner *ngIf="isProcessing()" diameter="20"></mat-spinner>
                <span *ngIf="!isProcessing()">
                  Withdraw {{ withdrawForm.get('amount')?.value | currency:'GBP' }}
                </span>
              </button>
            </form>
          </div>

          <!-- Transaction History -->
          <div class="mm-card">
            <h3>Transaction History</h3>

            <div class="mm-empty-transactions" *ngIf="transactions().length === 0">
              <mat-icon>receipt_long</mat-icon>
              <p>No transactions yet</p>
            </div>

            <div class="mm-transactions-list" *ngIf="transactions().length > 0">
              <div class="mm-transaction" *ngFor="let tx of transactions()">
                <div class="mm-transaction__icon" [ngClass]="getTransactionClass(tx.type)">
                  <mat-icon>{{ getTransactionIcon(tx.type) }}</mat-icon>
                </div>
                <div class="mm-transaction__details">
                  <span class="mm-transaction__title">{{ tx.description }}</span>
                  <span class="mm-transaction__date">{{ tx.createdAt | date:'medium' }}</span>
                </div>
                <div class="mm-transaction__amount"
                     [ngClass]="{'positive': isPositiveTransaction(tx.type), 'negative': !isPositiveTransaction(tx.type)}">
                  {{ isPositiveTransaction(tx.type) ? '+' : '-' }}{{ tx.amount | currency:'GBP' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="mm-quick-stats">
            <div class="mm-quick-stat">
              <mat-icon>savings</mat-icon>
              <div>
                <span class="label">Total Deposited</span>
                <span class="value">{{ getTotalDeposited() | currency:'GBP' }}</span>
              </div>
            </div>
            <div class="mm-quick-stat">
              <mat-icon>payments</mat-icon>
              <div>
                <span class="label">Total Withdrawn</span>
                <span class="value">{{ getTotalWithdrawn() | currency:'GBP' }}</span>
              </div>
            </div>
            <div class="mm-quick-stat">
              <mat-icon>trending_up</mat-icon>
              <div>
                <span class="label">Interest Earned</span>
                <span class="value text-success">{{ getTotalInterest() | currency:'GBP' }}</span>
              </div>
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

    .mm-balance-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: var(--mm-spacing-lg);
      margin-bottom: var(--mm-spacing-lg);

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-balance-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      &--primary {
        background: linear-gradient(135deg, var(--mm-primary) 0%, var(--mm-secondary) 100%);
        color: white;

        .mm-balance-card__header mat-icon {
          color: white;
        }

        .mm-balance-card__actions button {
          color: var(--mm-primary);
          background: white;

          &[mat-stroked-button] {
            border-color: white;
            color: white;
            background: transparent;
          }
        }
      }

      &__header {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-sm);
        margin-bottom: var(--mm-spacing-md);
        font-size: 0.875rem;

        mat-icon {
          color: var(--mm-primary);
        }
      }

      &__amount {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: var(--mm-spacing-sm);
      }

      &__subtitle {
        font-size: 0.875rem;
        opacity: 0.8;
      }

      &__actions {
        display: flex;
        gap: var(--mm-spacing-sm);
        margin-top: var(--mm-spacing-lg);
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

    .mm-form-card {
      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--mm-spacing-lg);

        h3 {
          margin: 0;
        }
      }
    }

    .mm-quick-amounts {
      display: flex;
      gap: var(--mm-spacing-sm);
      margin-bottom: var(--mm-spacing-lg);
      flex-wrap: wrap;

      button {
        flex: 1;
        min-width: 70px;
      }
    }

    .mm-available-info {
      text-align: center;
      padding: var(--mm-spacing-md);
      background: var(--mm-gray-100);
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
        color: var(--mm-gray-900);
      }
    }

    .mm-payment-method {
      margin-bottom: var(--mm-spacing-lg);

      h4 {
        margin: 0 0 var(--mm-spacing-md);
        font-size: 0.875rem;
        color: var(--mm-gray-600);
      }
    }

    .mm-payment-option {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-md);
      padding: var(--mm-spacing-md);
      border: 2px solid var(--mm-primary);
      border-radius: var(--mm-radius-md);
      background: var(--mm-light-blue);

      > mat-icon {
        color: var(--mm-primary);
      }

      &__details {
        flex: 1;

        .name {
          display: block;
          font-weight: 500;
        }

        .info {
          font-size: 0.75rem;
          color: var(--mm-gray-600);
        }
      }

      .check {
        color: var(--mm-success);
      }
    }

    .mm-empty-transactions {
      text-align: center;
      padding: var(--mm-spacing-xl);
      color: var(--mm-gray-600);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--mm-gray-300);
        margin-bottom: var(--mm-spacing-sm);
      }
    }

    .mm-transactions-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .mm-transaction {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-md);
      padding: var(--mm-spacing-md) 0;
      border-bottom: 1px solid var(--mm-gray-100);

      &:last-child {
        border-bottom: none;
      }

      &__icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        &.deposit {
          background: rgba(46, 125, 50, 0.1);
          color: var(--mm-success);
        }

        &.withdrawal {
          background: rgba(211, 47, 47, 0.1);
          color: var(--mm-error);
        }

        &.investment {
          background: var(--mm-light-blue);
          color: var(--mm-primary);
        }

        &.return {
          background: rgba(46, 125, 50, 0.1);
          color: var(--mm-success);
        }
      }

      &__details {
        flex: 1;
      }

      &__title {
        display: block;
        font-weight: 500;
        color: var(--mm-gray-900);
      }

      &__date {
        font-size: 0.75rem;
        color: var(--mm-gray-600);
      }

      &__amount {
        font-weight: 600;
        font-size: 1.125rem;

        &.positive {
          color: var(--mm-success);
        }

        &.negative {
          color: var(--mm-gray-900);
        }
      }
    }

    .mm-quick-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--mm-spacing-lg);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-quick-stat {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-md);
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--mm-primary);
      }

      .label {
        display: block;
        font-size: 0.75rem;
        color: var(--mm-gray-600);
        text-transform: uppercase;
      }

      .value {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mm-gray-900);
      }
    }

    .full-width {
      width: 100%;
    }

    .text-success {
      color: var(--mm-success) !important;
    }
  `]
})
export class LenderWalletComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(true);
  isProcessing = signal(false);
  wallet = signal<Wallet | null>(null);
  transactions = signal<WalletTransaction[]>([]);

  showDepositForm = false;
  showWithdrawForm = false;

  quickAmounts = [100, 500, 1000, 5000];

  depositForm: FormGroup = this.fb.group({
    amount: [500, [Validators.required, Validators.min(10)]]
  });

  withdrawForm: FormGroup = this.fb.group({
    amount: [0, [Validators.required, Validators.min(10)]]
  });

  ngOnInit(): void {
    this.loadWallet();
  }

  private loadWallet(): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.apiService.getWallet(userId).subscribe({
      next: (wallet) => {
        this.wallet.set(wallet);
        this.updateWithdrawMax();
        this.loadTransactions(userId);
      },
      error: () => {
        this.wallet.set({
          walletId: '',
          userId,
          availableBalance: 0,
          pendingBalance: 0,
          reservedBalance: 0,
          totalBalance: 0,
          lastUpdatedAt: new Date().toISOString()
        });
        this.isLoading.set(false);
      }
    });
  }

  private loadTransactions(userId: string): void {
    this.apiService.getWalletTransactions(userId).subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.isLoading.set(false);
      },
      error: () => {
        this.transactions.set([]);
        this.isLoading.set(false);
      }
    });
  }

  private updateWithdrawMax(): void {
    const max = this.wallet()?.availableBalance || 0;
    this.withdrawForm.get('amount')?.setValidators([
      Validators.required,
      Validators.min(10),
      Validators.max(max)
    ]);
    this.withdrawForm.get('amount')?.updateValueAndValidity();
  }

  setDepositAmount(amount: number): void {
    this.depositForm.patchValue({ amount });
  }

  setWithdrawAmount(amount: number): void {
    this.withdrawForm.patchValue({ amount });
  }

  deposit(): void {
    if (this.depositForm.invalid) return;

    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    this.isProcessing.set(true);

    this.apiService.deposit(userId, {
      amount: this.depositForm.get('amount')?.value,
      reference: 'Deposit via card'
    }).subscribe({
      next: (wallet) => {
        this.wallet.set(wallet);
        this.showDepositForm = false;
        this.depositForm.reset({ amount: 500 });
        this.snackBar.open('Deposit successful!', 'Close', { duration: 3000 });
        this.loadTransactions(userId);
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Deposit failed', 'Close', { duration: 5000 });
        this.isProcessing.set(false);
      }
    });
  }

  withdraw(): void {
    if (this.withdrawForm.invalid) return;

    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    this.isProcessing.set(true);

    this.apiService.withdraw(userId, {
      amount: this.withdrawForm.get('amount')?.value,
      bankAccountReference: 'default'
    }).subscribe({
      next: (wallet) => {
        this.wallet.set(wallet);
        this.showWithdrawForm = false;
        this.withdrawForm.reset({ amount: 0 });
        this.updateWithdrawMax();
        this.snackBar.open('Withdrawal initiated!', 'Close', { duration: 3000 });
        this.loadTransactions(userId);
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Withdrawal failed', 'Close', { duration: 5000 });
        this.isProcessing.set(false);
      }
    });
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'Deposit': return 'add_circle';
      case 'Withdrawal': return 'remove_circle';
      case 'LoanFunding': return 'account_balance';
      case 'LoanRepayment': return 'payment';
      case 'Interest': return 'trending_up';
      default: return 'swap_horiz';
    }
  }

  getTransactionClass(type: string): string {
    switch (type) {
      case 'Deposit': return 'deposit';
      case 'Withdrawal': return 'withdrawal';
      case 'LoanFunding': return 'investment';
      case 'LoanRepayment':
      case 'Interest': return 'return';
      default: return '';
    }
  }

  isPositiveTransaction(type: string): boolean {
    return ['Deposit', 'LoanRepayment', 'Interest', 'Refund'].includes(type);
  }

  getTotalDeposited(): number {
    return this.transactions()
      .filter(t => t.type === 'Deposit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalWithdrawn(): number {
    return this.transactions()
      .filter(t => t.type === 'Withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalInterest(): number {
    return this.transactions()
      .filter(t => t.type === 'Interest')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
