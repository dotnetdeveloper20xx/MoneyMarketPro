import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

export interface PaymentDialogData {
  loanId: string;
  amount: number;
  dueDate: string;
}

@Component({
  selector: 'app-make-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRadioModule
  ],
  template: `
    <h2 mat-dialog-title>Make a Payment</h2>

    <mat-dialog-content>
      <div class="mm-payment-info">
        <div class="mm-payment-due">
          <span class="label">Payment Due</span>
          <span class="amount">{{ data.amount | currency:'GBP' }}</span>
          <span class="date">Due {{ data.dueDate | date:'mediumDate' }}</span>
        </div>
      </div>

      <form [formGroup]="paymentForm" class="mm-form">
        <div class="mm-payment-options">
          <mat-radio-group formControlName="paymentType" class="mm-radio-group">
            <mat-radio-button value="minimum">
              <div class="mm-radio-option">
                <span class="mm-radio-option__label">Minimum Payment</span>
                <span class="mm-radio-option__amount">{{ data.amount | currency:'GBP' }}</span>
              </div>
            </mat-radio-button>

            <mat-radio-button value="full">
              <div class="mm-radio-option">
                <span class="mm-radio-option__label">Pay Full Balance</span>
                <span class="mm-radio-option__amount">Full balance</span>
              </div>
            </mat-radio-button>

            <mat-radio-button value="custom">
              <div class="mm-radio-option">
                <span class="mm-radio-option__label">Custom Amount</span>
              </div>
            </mat-radio-button>
          </mat-radio-group>
        </div>

        <mat-form-field appearance="outline" class="full-width"
                        *ngIf="paymentForm.get('paymentType')?.value === 'custom'">
          <mat-label>Payment Amount</mat-label>
          <span matPrefix>£&nbsp;</span>
          <input matInput type="number" formControlName="amount" min="1">
          <mat-error>Enter a valid amount</mat-error>
        </mat-form-field>

        <div class="mm-payment-method">
          <h4>Payment Method</h4>
          <div class="mm-saved-card">
            <mat-icon>credit_card</mat-icon>
            <div class="mm-saved-card__details">
              <span class="mm-saved-card__number">•••• •••• •••• 4242</span>
              <span class="mm-saved-card__expiry">Expires 12/28</span>
            </div>
            <mat-icon class="mm-saved-card__check">check_circle</mat-icon>
          </div>
          <p class="mm-payment-method__note">
            Payment will be deducted from your wallet balance. If insufficient funds,
            your saved card will be charged.
          </p>
        </div>

        <div class="mm-error" *ngIf="error()">
          <mat-icon>error</mat-icon>
          {{ error() }}
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isProcessing()">Cancel</button>
      <button mat-raised-button class="mm-btn-primary"
              (click)="processPayment()"
              [disabled]="paymentForm.invalid || isProcessing()">
        <mat-spinner *ngIf="isProcessing()" diameter="20"></mat-spinner>
        <span *ngIf="!isProcessing()">
          Pay {{ getPaymentAmount() | currency:'GBP' }}
        </span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .mm-payment-info {
      background: var(--mm-light-blue);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      margin-bottom: var(--mm-spacing-lg);
      text-align: center;
    }

    .mm-payment-due {
      .label {
        display: block;
        font-size: 0.75rem;
        color: var(--mm-gray-600);
        text-transform: uppercase;
        margin-bottom: var(--mm-spacing-xs);
      }

      .amount {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: var(--mm-primary);
        margin-bottom: var(--mm-spacing-xs);
      }

      .date {
        color: var(--mm-gray-600);
      }
    }

    .mm-payment-options {
      margin-bottom: var(--mm-spacing-lg);
    }

    .mm-radio-group {
      display: flex;
      flex-direction: column;
      gap: var(--mm-spacing-sm);
    }

    ::ng-deep .mat-mdc-radio-button {
      width: 100%;

      .mdc-form-field {
        width: 100%;
      }

      .mdc-label {
        width: 100%;
        padding: var(--mm-spacing-md);
        border: 1px solid var(--mm-gray-200);
        border-radius: var(--mm-radius-md);
        cursor: pointer;
        transition: all var(--mm-transition-fast);

        &:hover {
          border-color: var(--mm-primary);
        }
      }

      &.mat-mdc-radio-checked .mdc-label {
        border-color: var(--mm-primary);
        background: var(--mm-light-blue);
      }
    }

    .mm-radio-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      &__label {
        font-weight: 500;
      }

      &__amount {
        color: var(--mm-gray-600);
      }
    }

    .mm-payment-method {
      margin-top: var(--mm-spacing-lg);
      padding-top: var(--mm-spacing-lg);
      border-top: 1px solid var(--mm-gray-200);

      h4 {
        margin: 0 0 var(--mm-spacing-md);
      }

      &__note {
        font-size: 0.75rem;
        color: var(--mm-gray-600);
        margin-top: var(--mm-spacing-sm);
      }
    }

    .mm-saved-card {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-md);
      padding: var(--mm-spacing-md);
      border: 2px solid var(--mm-primary);
      border-radius: var(--mm-radius-md);
      background: var(--mm-light-blue);

      > mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--mm-primary);
      }

      &__details {
        flex: 1;
      }

      &__number {
        display: block;
        font-weight: 500;
      }

      &__expiry {
        font-size: 0.875rem;
        color: var(--mm-gray-600);
      }

      &__check {
        color: var(--mm-success);
      }
    }

    .mm-error {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-sm);
      padding: var(--mm-spacing-md);
      background: rgba(211, 47, 47, 0.1);
      border-radius: var(--mm-radius-md);
      color: var(--mm-error);
      margin-top: var(--mm-spacing-md);

      mat-icon {
        flex-shrink: 0;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: var(--mm-spacing-lg);
      gap: var(--mm-spacing-sm);
    }
  `]
})
export class MakePaymentDialogComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<MakePaymentDialogComponent>);
  data = inject<PaymentDialogData>(MAT_DIALOG_DATA);

  isProcessing = signal(false);
  error = signal<string | null>(null);

  paymentForm: FormGroup = this.fb.group({
    paymentType: ['minimum', Validators.required],
    amount: [this.data.amount, [Validators.required, Validators.min(1)]]
  });

  getPaymentAmount(): number {
    const type = this.paymentForm.get('paymentType')?.value;
    if (type === 'custom') {
      return this.paymentForm.get('amount')?.value || 0;
    }
    return this.data.amount;
  }

  processPayment(): void {
    if (this.paymentForm.invalid) return;

    this.isProcessing.set(true);
    this.error.set(null);

    const paymentData = {
      loanId: this.data.loanId,
      amount: this.getPaymentAmount(),
      paymentMethod: 'card'
    };

    this.apiService.processPayment(paymentData).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.error.set(err.error?.message || 'Payment failed. Please try again.');
      }
    });
  }
}
