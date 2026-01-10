import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../core/services/api.service';
import { Loan, Payment } from '../../../core/models';
import { MakePaymentDialogComponent } from './make-payment-dialog.component';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,
    MatDialogModule,
    MatTabsModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <!-- Back Link -->
        <a routerLink="/borrower/loans" class="mm-back-link">
          <mat-icon>arrow_back</mat-icon>
          Back to My Loans
        </a>

        <!-- Loading State -->
        <div class="mm-loading" *ngIf="isLoading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading loan details...</p>
        </div>

        <div *ngIf="!isLoading() && loan()">
          <!-- Loan Header Card -->
          <div class="mm-loan-header">
            <div class="mm-loan-header__main">
              <span class="mm-badge mm-badge--lg" [ngClass]="getStatusClass()">
                {{ loan()!.status }}
              </span>
              <h1 class="mm-loan-header__amount">{{ loan()!.amount | currency:'GBP' }}</h1>
              <p class="mm-loan-header__purpose">{{ loan()!.purpose }}</p>
            </div>

            <div class="mm-loan-header__stats">
              <div class="mm-stat">
                <span class="label">Interest Rate</span>
                <span class="value">{{ loan()!.interestRate }}% APR</span>
              </div>
              <div class="mm-stat">
                <span class="label">Term</span>
                <span class="value">{{ loan()!.termMonths }} months</span>
              </div>
              <div class="mm-stat">
                <span class="label">Monthly Payment</span>
                <span class="value">{{ loan()!.monthlyPayment | currency:'GBP' }}</span>
              </div>
              <div class="mm-stat">
                <span class="label">Total Repayment</span>
                <span class="value">{{ loan()!.totalRepayment | currency:'GBP' }}</span>
              </div>
            </div>
          </div>

          <!-- Progress & Next Payment -->
          <div class="mm-cards-row" *ngIf="loan()!.status === 'Active'">
            <div class="mm-card mm-card--progress">
              <h3>Repayment Progress</h3>
              <div class="mm-progress-visual">
                <div class="mm-progress-circle">
                  <svg viewBox="0 0 36 36" class="mm-circular-progress">
                    <path class="mm-circular-progress__bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path class="mm-circular-progress__fill"
                      [attr.stroke-dasharray]="getRepaymentProgress() + ', 100'"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span class="mm-progress-circle__value">{{ getRepaymentProgress() | number:'1.0-0' }}%</span>
                </div>
                <div class="mm-progress-details">
                  <div>
                    <span class="label">Paid</span>
                    <span class="value text-success">{{ getPaidAmount() | currency:'GBP' }}</span>
                  </div>
                  <div>
                    <span class="label">Remaining</span>
                    <span class="value">{{ loan()!.remainingBalance | currency:'GBP' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mm-card mm-card--payment">
              <h3>Next Payment</h3>
              <div class="mm-next-payment">
                <div class="mm-next-payment__amount">
                  {{ loan()!.nextPaymentAmount | currency:'GBP' }}
                </div>
                <div class="mm-next-payment__date">
                  <mat-icon>event</mat-icon>
                  Due {{ loan()!.nextPaymentDate | date:'fullDate' }}
                </div>
                <button mat-raised-button class="mm-btn-primary full-width"
                        (click)="openPaymentDialog()">
                  <mat-icon>payment</mat-icon>
                  Make Payment
                </button>
              </div>
            </div>
          </div>

          <!-- Funding Progress (for pending loans) -->
          <div class="mm-card" *ngIf="loan()!.status === 'PendingFunding' || loan()!.status === 'FullyFunded'">
            <h3>Funding Progress</h3>
            <div class="mm-funding-progress">
              <mat-progress-bar mode="determinate" [value]="loan()!.fundingProgress" color="accent">
              </mat-progress-bar>
              <div class="mm-funding-progress__details">
                <span>{{ loan()!.fundedAmount | currency:'GBP' }} of {{ loan()!.amount | currency:'GBP' }}</span>
                <span>{{ loan()!.fundingProgress | number:'1.0-0' }}% funded</span>
              </div>
              <p class="mm-funding-progress__note" *ngIf="loan()!.status === 'PendingFunding'">
                <mat-icon>info</mat-icon>
                Your loan is currently being funded by lenders. Once fully funded, the money will be disbursed to your account.
              </p>
              <p class="mm-funding-progress__note mm-funding-progress__note--success" *ngIf="loan()!.status === 'FullyFunded'">
                <mat-icon>check_circle</mat-icon>
                Your loan is fully funded! Funds will be disbursed soon.
              </p>
            </div>
          </div>

          <!-- Tabs for Details & History -->
          <mat-tab-group class="mm-tabs">
            <mat-tab label="Loan Details">
              <div class="mm-details-grid">
                <div class="mm-detail-card">
                  <h4>Loan Information</h4>
                  <div class="mm-detail-row">
                    <span class="label">Loan ID</span>
                    <span class="value">{{ loan()!.id | slice:0:8 }}...</span>
                  </div>
                  <div class="mm-detail-row">
                    <span class="label">Start Date</span>
                    <span class="value">{{ loan()!.startDate | date:'mediumDate' }}</span>
                  </div>
                  <div class="mm-detail-row">
                    <span class="label">End Date</span>
                    <span class="value">{{ loan()!.endDate | date:'mediumDate' }}</span>
                  </div>
                  <div class="mm-detail-row">
                    <span class="label">Created</span>
                    <span class="value">{{ loan()!.createdAt | date:'medium' }}</span>
                  </div>
                </div>

                <div class="mm-detail-card">
                  <h4>Payment Summary</h4>
                  <div class="mm-detail-row">
                    <span class="label">Principal</span>
                    <span class="value">{{ loan()!.amount | currency:'GBP' }}</span>
                  </div>
                  <div class="mm-detail-row">
                    <span class="label">Interest</span>
                    <span class="value">{{ getInterestAmount() | currency:'GBP' }}</span>
                  </div>
                  <div class="mm-detail-row mm-detail-row--total">
                    <span class="label">Total Repayment</span>
                    <span class="value">{{ loan()!.totalRepayment | currency:'GBP' }}</span>
                  </div>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Payment History">
              <div class="mm-card" *ngIf="payments().length === 0">
                <p class="text-muted text-center">No payments have been made yet.</p>
              </div>

              <table mat-table [dataSource]="payments()" class="mm-table" *ngIf="payments().length > 0">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let payment">{{ payment.paidAt | date:'mediumDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let payment">
                    <strong>{{ payment.amount | currency:'GBP' }}</strong>
                  </td>
                </ng-container>

                <ng-container matColumnDef="principal">
                  <th mat-header-cell *matHeaderCellDef>Principal</th>
                  <td mat-cell *matCellDef="let payment">{{ payment.principalAmount | currency:'GBP' }}</td>
                </ng-container>

                <ng-container matColumnDef="interest">
                  <th mat-header-cell *matHeaderCellDef>Interest</th>
                  <td mat-cell *matCellDef="let payment">{{ payment.interestAmount | currency:'GBP' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let payment">
                    <span class="mm-badge mm-badge--success">{{ payment.status }}</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="paymentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: paymentColumns;"></tr>
              </table>
            </mat-tab>

            <mat-tab label="Payment Schedule">
              <div class="mm-schedule">
                <div class="mm-schedule-item" *ngFor="let item of paymentSchedule(); let i = index"
                     [class.mm-schedule-item--paid]="item.paid"
                     [class.mm-schedule-item--next]="item.isNext">
                  <div class="mm-schedule-item__number">{{ i + 1 }}</div>
                  <div class="mm-schedule-item__details">
                    <span class="date">{{ item.dueDate | date:'mediumDate' }}</span>
                    <span class="amount">{{ item.amount | currency:'GBP' }}</span>
                  </div>
                  <div class="mm-schedule-item__status">
                    <mat-icon *ngIf="item.paid">check_circle</mat-icon>
                    <span *ngIf="item.isNext" class="mm-badge mm-badge--info">Next</span>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>

        <!-- Not Found -->
        <div class="mm-card" *ngIf="!isLoading() && !loan()">
          <div class="mm-empty-state">
            <mat-icon>error_outline</mat-icon>
            <h3>Loan not found</h3>
            <p>The loan you're looking for doesn't exist or you don't have access to it.</p>
            <a routerLink="/borrower/loans" mat-raised-button class="mm-btn-primary">
              Back to My Loans
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
      gap: var(--mm-spacing-md);
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--mm-gray-300);
      }

      p {
        color: var(--mm-gray-600);
      }
    }

    .mm-loan-header {
      background: linear-gradient(135deg, var(--mm-primary) 0%, var(--mm-secondary) 100%);
      border-radius: var(--mm-radius-lg);
      padding: var(--mm-spacing-xl);
      color: white;
      margin-bottom: var(--mm-spacing-lg);

      &__main {
        text-align: center;
        margin-bottom: var(--mm-spacing-lg);
      }

      &__amount {
        font-size: 3rem;
        font-weight: 700;
        margin: var(--mm-spacing-md) 0 var(--mm-spacing-sm);
      }

      &__purpose {
        font-size: 1.125rem;
        opacity: 0.9;
        margin: 0;
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--mm-spacing-md);
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--mm-radius-md);
        padding: var(--mm-spacing-lg);

        @media (max-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }

    .mm-stat {
      text-align: center;

      .label {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        opacity: 0.8;
        margin-bottom: var(--mm-spacing-xs);
      }

      .value {
        font-size: 1.25rem;
        font-weight: 600;
      }
    }

    .mm-badge--lg {
      font-size: 0.875rem;
      padding: var(--mm-spacing-sm) var(--mm-spacing-md);
    }

    .mm-cards-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--mm-spacing-lg);
      margin-bottom: var(--mm-spacing-lg);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      h3 {
        margin: 0 0 var(--mm-spacing-lg);
        font-size: 1.125rem;
      }
    }

    .mm-progress-visual {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-xl);
    }

    .mm-progress-circle {
      position: relative;
      width: 120px;
      height: 120px;
      flex-shrink: 0;

      &__value {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--mm-gray-900);
      }
    }

    .mm-circular-progress {
      transform: rotate(-90deg);

      &__bg {
        fill: none;
        stroke: var(--mm-gray-200);
        stroke-width: 3;
      }

      &__fill {
        fill: none;
        stroke: var(--mm-success);
        stroke-width: 3;
        stroke-linecap: round;
      }
    }

    .mm-progress-details {
      flex: 1;

      > div {
        margin-bottom: var(--mm-spacing-md);

        &:last-child {
          margin-bottom: 0;
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
    }

    .mm-next-payment {
      text-align: center;

      &__amount {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--mm-gray-900);
        margin-bottom: var(--mm-spacing-sm);
      }

      &__date {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--mm-spacing-sm);
        color: var(--mm-gray-600);
        margin-bottom: var(--mm-spacing-lg);

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    .mm-funding-progress {
      mat-progress-bar {
        height: 12px;
        border-radius: 6px;
        margin-bottom: var(--mm-spacing-md);
      }

      &__details {
        display: flex;
        justify-content: space-between;
        color: var(--mm-gray-600);
        margin-bottom: var(--mm-spacing-md);
      }

      &__note {
        display: flex;
        align-items: flex-start;
        gap: var(--mm-spacing-sm);
        padding: var(--mm-spacing-md);
        background: var(--mm-light-blue);
        border-radius: var(--mm-radius-sm);
        color: var(--mm-secondary);
        margin: 0;

        mat-icon {
          flex-shrink: 0;
        }

        &--success {
          background: rgba(46, 125, 50, 0.1);
          color: var(--mm-success);
        }
      }
    }

    .mm-tabs {
      margin-top: var(--mm-spacing-lg);

      ::ng-deep .mat-mdc-tab-body-wrapper {
        padding-top: var(--mm-spacing-lg);
      }
    }

    .mm-details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--mm-spacing-lg);
    }

    .mm-detail-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      h4 {
        margin: 0 0 var(--mm-spacing-md);
        color: var(--mm-primary);
      }
    }

    .mm-detail-row {
      display: flex;
      justify-content: space-between;
      padding: var(--mm-spacing-sm) 0;
      border-bottom: 1px solid var(--mm-gray-100);

      &:last-child {
        border-bottom: none;
      }

      &--total {
        border-top: 2px solid var(--mm-gray-200);
        margin-top: var(--mm-spacing-sm);
        padding-top: var(--mm-spacing-md);
        font-weight: 600;
      }

      .label {
        color: var(--mm-gray-600);
      }

      .value {
        font-weight: 500;
        color: var(--mm-gray-900);
      }
    }

    .mm-schedule {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      box-shadow: var(--mm-shadow-sm);
      overflow: hidden;
    }

    .mm-schedule-item {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-md);
      padding: var(--mm-spacing-md) var(--mm-spacing-lg);
      border-bottom: 1px solid var(--mm-gray-100);

      &:last-child {
        border-bottom: none;
      }

      &--paid {
        background: rgba(46, 125, 50, 0.05);

        .mm-schedule-item__number {
          background: var(--mm-success);
        }
      }

      &--next {
        background: var(--mm-light-blue);

        .mm-schedule-item__number {
          background: var(--mm-secondary);
        }
      }

      &__number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--mm-gray-300);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        flex-shrink: 0;
      }

      &__details {
        flex: 1;
        display: flex;
        justify-content: space-between;

        .date {
          color: var(--mm-gray-600);
        }

        .amount {
          font-weight: 600;
          color: var(--mm-gray-900);
        }
      }

      &__status {
        mat-icon {
          color: var(--mm-success);
        }
      }
    }

    .full-width {
      width: 100%;
    }

    .text-success {
      color: var(--mm-success) !important;
    }

    .text-muted {
      color: var(--mm-gray-600);
    }

    .text-center {
      text-align: center;
    }
  `]
})
export class LoanDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);

  isLoading = signal(true);
  loan = signal<Loan | null>(null);
  payments = signal<Payment[]>([]);

  paymentColumns = ['date', 'amount', 'principal', 'interest', 'status'];

  ngOnInit(): void {
    const loanId = this.route.snapshot.paramMap.get('id');
    if (loanId) {
      this.loadLoan(loanId);
    } else {
      this.isLoading.set(false);
    }
  }

  private loadLoan(id: string): void {
    this.apiService.getLoan(id).subscribe({
      next: (loan) => {
        this.loan.set(loan);
        this.loadPayments(id);
        this.isLoading.set(false);
      },
      error: () => {
        this.loan.set(null);
        this.isLoading.set(false);
      }
    });
  }

  private loadPayments(loanId: string): void {
    this.apiService.getLoanPayments(loanId).subscribe({
      next: (payments) => this.payments.set(payments),
      error: () => this.payments.set([])
    });
  }

  getStatusClass(): string {
    const status = this.loan()?.status;
    if (!status) return '';

    const classes: Record<string, string> = {
      'PendingFunding': 'mm-badge--pending',
      'FullyFunded': 'mm-badge--info',
      'Active': 'mm-badge--active',
      'Completed': 'mm-badge--success',
      'Defaulted': 'mm-badge--error',
      'Cancelled': 'mm-badge--draft'
    };
    return classes[status] || '';
  }

  getRepaymentProgress(): number {
    const loan = this.loan();
    if (!loan || loan.amount === 0) return 0;
    return ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
  }

  getPaidAmount(): number {
    const loan = this.loan();
    if (!loan) return 0;
    return loan.amount - loan.remainingBalance;
  }

  getInterestAmount(): number {
    const loan = this.loan();
    if (!loan) return 0;
    return loan.totalRepayment - loan.amount;
  }

  paymentSchedule(): { dueDate: Date; amount: number; paid: boolean; isNext: boolean }[] {
    const loan = this.loan();
    if (!loan || !loan.startDate) return [];

    const schedule: { dueDate: Date; amount: number; paid: boolean; isNext: boolean }[] = [];
    const startDate = new Date(loan.startDate);
    const paidCount = this.payments().length;
    const today = new Date();

    for (let i = 0; i < loan.termMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);

      const isPaid = i < paidCount;
      const isNext = !isPaid && schedule.every(s => s.paid || s.isNext === false);

      schedule.push({
        dueDate,
        amount: loan.monthlyPayment,
        paid: isPaid,
        isNext: isNext && dueDate > today
      });
    }

    return schedule;
  }

  openPaymentDialog(): void {
    const loan = this.loan();
    if (!loan) return;

    const dialogRef = this.dialog.open(MakePaymentDialogComponent, {
      width: '500px',
      data: {
        loanId: loan.id,
        amount: loan.nextPaymentAmount,
        dueDate: loan.nextPaymentDate
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadLoan(loan.id);
      }
    });
  }
}
