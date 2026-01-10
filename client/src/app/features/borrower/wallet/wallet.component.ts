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
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Wallet, WalletTransaction } from '../../../core/models';

@Component({
  selector: 'app-wallet',
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
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <h1 class="mm-page-header__title">My Wallet</h1>
          <p class="mm-page-header__subtitle">
            Manage your funds and view transaction history
          </p>
        </div>

        <!-- Loading State -->
        <div class="mm-loading" *ngIf="isLoading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading wallet...</p>
        </div>

        <div *ngIf="!isLoading()">
          <!-- Balance Card -->
          <div class="mm-balance-card">
            <div class="mm-balance-card__main">
              <span class="mm-balance-card__label">Available Balance</span>
              <span class="mm-balance-card__amount">{{ wallet()?.availableBalance | currency:'GBP' }}</span>
            </div>
            <div class="mm-balance-card__details">
              <div>
                <span class="label">Total Balance</span>
                <span class="value">{{ wallet()?.totalBalance | currency:'GBP' }}</span>
              </div>
              <div>
                <span class="label">Pending</span>
                <span class="value">{{ wallet()?.pendingBalance | currency:'GBP' }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mm-wallet-actions">
            <div class="mm-wallet-action" (click)="showDepositForm = true"
                 [class.active]="showDepositForm">
              <mat-icon>add_circle</mat-icon>
              <span>Deposit</span>
            </div>
            <div class="mm-wallet-action" (click)="showWithdrawForm = true"
                 [class.active]="showWithdrawForm">
              <mat-icon>remove_circle</mat-icon>
              <span>Withdraw</span>
            </div>
          </div>

          <!-- Deposit Form -->
          <div class="mm-card mm-transaction-form" *ngIf="showDepositForm">
            <div class="mm-transaction-form__header">
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

              <div class="mm-payment-method-select">
                <h4>Select Payment Method</h4>
                <div class="mm-payment-option" [class.selected]="selectedPaymentMethod === 'card'">
                  <mat-icon>credit_card</mat-icon>
                  <div class="mm-payment-option__details">
                    <span class="name">Debit Card •••• 4242</span>
                    <span class="info">Instant</span>
                  </div>
                  <mat-icon class="check" *ngIf="selectedPaymentMethod === 'card'">check_circle</mat-icon>
                </div>
                <div class="mm-payment-option" [class.selected]="selectedPaymentMethod === 'bank'"
                     (click)="selectedPaymentMethod = 'bank'">
                  <mat-icon>account_balance</mat-icon>
                  <div class="mm-payment-option__details">
                    <span class="name">Bank Transfer</span>
                    <span class="info">1-3 business days</span>
                  </div>
                  <mat-icon class="check" *ngIf="selectedPaymentMethod === 'bank'">check_circle</mat-icon>
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
          <div class="mm-card mm-transaction-form" *ngIf="showWithdrawForm">
            <div class="mm-transaction-form__header">
              <h3>Withdraw Funds</h3>
              <button mat-icon-button (click)="showWithdrawForm = false">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <form [formGroup]="withdrawForm" (ngSubmit)="withdraw()">
              <div class="mm-available-balance">
                <span class="label">Available to withdraw</span>
                <span class="amount">{{ wallet()?.availableBalance | currency:'GBP' }}</span>
              </div>

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
                Withdraw All
              </button>

              <div class="mm-withdraw-to">
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
                <div class="mm-transaction__icon" [ngClass]="getTransactionIconClass(tx.type)">
                  <mat-icon>{{ getTransactionIcon(tx.type) }}</mat-icon>
                </div>
                <div class="mm-transaction__details">
                  <span class="mm-transaction__title">{{ tx.description }}</span>
                  <span class="mm-transaction__date">{{ tx.createdAt | date:'medium' }}</span>
                </div>
                <div class="mm-transaction__amount" [ngClass]="{'positive': tx.type === 'Deposit', 'negative': tx.type !== 'Deposit'}">
                  {{ tx.type === 'Deposit' ? '+' : '-' }}{{ tx.amount | currency:'GBP' }}
                </div>
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

    .mm-balance-card {
      background: linear-gradient(135deg, var(--mm-primary) 0%, var(--mm-secondary) 100%);
      border-radius: var(--mm-radius-lg);
      padding: var(--mm-spacing-xl);
      color: white;
      margin-bottom: var(--mm-spacing-lg);

      &__main {
        text-align: center;
        margin-bottom: var(--mm-spacing-lg);
      }

      &__label {
        display: block;
        font-size: 0.875rem;
        opacity: 0.9;
        margin-bottom: var(--mm-spacing-xs);
      }

      &__amount {
        font-size: 3rem;
        font-weight: 700;
      }

      &__details {
        display: flex;
        justify-content: center;
        gap: var(--mm-spacing-xxl);

        > div {
          text-align: center;

          .label {
            display: block;
            font-size: 0.75rem;
            opacity: 0.8;
            text-transform: uppercase;
          }

          .value {
            font-size: 1.25rem;
            font-weight: 600;
          }
        }
      }
    }

    .mm-wallet-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--mm-spacing-md);
      margin-bottom: var(--mm-spacing-lg);
    }

    .mm-wallet-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--mm-spacing-sm);
      padding: var(--mm-spacing-lg);
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      box-shadow: var(--mm-shadow-sm);
      cursor: pointer;
      transition: all var(--mm-transition-fast);

      &:hover, &.active {
        box-shadow: var(--mm-shadow-md);
        transform: translateY(-2px);
      }

      &.active {
        border: 2px solid var(--mm-primary);
      }

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: var(--mm-primary);
      }

      span {
        font-weight: 500;
        color: var(--mm-gray-900);
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

    .mm-transaction-form {
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

      button {
        flex: 1;
      }
    }

    .mm-payment-method-select, .mm-withdraw-to {
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
      border: 2px solid var(--mm-gray-200);
      border-radius: var(--mm-radius-md);
      cursor: pointer;
      transition: all var(--mm-transition-fast);
      margin-bottom: var(--mm-spacing-sm);

      &:hover {
        border-color: var(--mm-primary);
      }

      &.selected {
        border-color: var(--mm-primary);
        background: var(--mm-light-blue);
      }

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

    .mm-available-balance {
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

        &.payment {
          background: rgba(0, 48, 135, 0.1);
          color: var(--mm-primary);
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

    .full-width {
      width: 100%;
    }
  `]
})
export class WalletComponent implements OnInit {
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
  selectedPaymentMethod = 'card';

  quickAmounts = [50, 100, 250, 500];

  depositForm: FormGroup = this.fb.group({
    amount: [100, [Validators.required, Validators.min(10)]]
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
        // Create default wallet display
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
      reference: `Deposit via ${this.selectedPaymentMethod}`
    }).subscribe({
      next: (wallet) => {
        this.wallet.set(wallet);
        this.showDepositForm = false;
        this.depositForm.reset({ amount: 100 });
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
      case 'Payment': return 'payment';
      case 'Disbursement': return 'account_balance';
      default: return 'swap_horiz';
    }
  }

  getTransactionIconClass(type: string): string {
    switch (type) {
      case 'Deposit': return 'deposit';
      case 'Withdrawal': return 'withdrawal';
      default: return 'payment';
    }
  }
}
