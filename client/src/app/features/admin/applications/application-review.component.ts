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
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../core/services/api.service';
import { LoanApplication } from '../../../core/models';

@Component({
  selector: 'app-application-review',
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
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <!-- Back Link -->
        <a routerLink="/admin/applications" class="mm-back-link">
          <mat-icon>arrow_back</mat-icon>
          Back to Applications
        </a>

        <!-- Loading State -->
        <div class="mm-loading" *ngIf="isLoading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading application...</p>
        </div>

        <div class="mm-review-layout" *ngIf="!isLoading() && application()">
          <!-- Main Content -->
          <main class="mm-review-content">
            <!-- Application Header -->
            <div class="mm-application-header">
              <div class="mm-application-header__top">
                <div>
                  <span class="mm-app-id">Application #{{ application()!.id | slice:0:8 }}</span>
                  <h1>{{ application()!.borrowerName }}</h1>
                </div>
                <span class="mm-badge mm-badge--lg" [ngClass]="getStatusClass()">
                  {{ application()!.status }}
                </span>
              </div>
              <div class="mm-application-header__meta">
                <span>
                  <mat-icon>event</mat-icon>
                  Submitted {{ application()!.submittedAt | date:'medium' }}
                </span>
                <span *ngIf="application()!.reviewedAt">
                  <mat-icon>rate_review</mat-icon>
                  Reviewed {{ application()!.reviewedAt | date:'medium' }}
                </span>
              </div>
            </div>

            <!-- Loan Details Card -->
            <div class="mm-card">
              <h3>
                <mat-icon>account_balance</mat-icon>
                Loan Request Details
              </h3>

              <div class="mm-details-grid">
                <div class="mm-detail-item mm-detail-item--highlight">
                  <span class="label">Requested Amount</span>
                  <span class="value">{{ application()!.amount | currency:'GBP' }}</span>
                </div>
                <div class="mm-detail-item">
                  <span class="label">Loan Purpose</span>
                  <span class="value">{{ application()!.purpose }}</span>
                </div>
                <div class="mm-detail-item">
                  <span class="label">Loan Term</span>
                  <span class="value">{{ application()!.termMonths }} months</span>
                </div>
                <div class="mm-detail-item">
                  <span class="label">Requested Rate</span>
                  <span class="value">{{ application()!.requestedInterestRate }}% APR</span>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="mm-description">
                <h4>Description</h4>
                <p>{{ application()!.description }}</p>
              </div>

              <div class="mm-loan-summary">
                <h4>Estimated Repayment</h4>
                <div class="mm-loan-summary__grid">
                  <div>
                    <span class="label">Monthly Payment</span>
                    <span class="value">{{ calculateMonthlyPayment() | currency:'GBP' }}</span>
                  </div>
                  <div>
                    <span class="label">Total Interest</span>
                    <span class="value">{{ calculateTotalInterest() | currency:'GBP' }}</span>
                  </div>
                  <div>
                    <span class="label">Total Repayment</span>
                    <span class="value">{{ calculateTotalRepayment() | currency:'GBP' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Risk Assessment Card -->
            <div class="mm-card">
              <h3>
                <mat-icon>security</mat-icon>
                Risk Assessment
              </h3>

              <div class="mm-risk-indicators">
                <div class="mm-risk-indicator">
                  <div class="mm-risk-indicator__header">
                    <span>Debt-to-Income Ratio</span>
                    <span class="mm-risk-indicator__value" [ngClass]="getDTIClass()">
                      {{ estimatedDTI() }}%
                    </span>
                  </div>
                  <div class="mm-risk-indicator__bar">
                    <div class="mm-risk-indicator__fill" [style.width]="estimatedDTI() + '%'"
                         [ngClass]="getDTIClass()"></div>
                  </div>
                  <span class="mm-risk-indicator__label">
                    {{ getDTILabel() }}
                  </span>
                </div>

                <div class="mm-risk-indicator">
                  <div class="mm-risk-indicator__header">
                    <span>Loan-to-Income Ratio</span>
                    <span class="mm-risk-indicator__value">
                      {{ calculateLTI() | number:'1.1-1' }}x
                    </span>
                  </div>
                  <p class="mm-risk-indicator__note">
                    Based on estimated annual income
                  </p>
                </div>
              </div>

              <div class="mm-risk-flags">
                <h4>Risk Flags</h4>
                <div class="mm-flags-list">
                  <div class="mm-flag mm-flag--success" *ngIf="application()!.amount <= 10000">
                    <mat-icon>check_circle</mat-icon>
                    <span>Standard loan amount</span>
                  </div>
                  <div class="mm-flag mm-flag--warning" *ngIf="application()!.amount > 10000 && application()!.amount <= 25000">
                    <mat-icon>warning</mat-icon>
                    <span>Large loan - additional verification recommended</span>
                  </div>
                  <div class="mm-flag mm-flag--error" *ngIf="application()!.amount > 25000">
                    <mat-icon>error</mat-icon>
                    <span>High-value loan - manual underwriting required</span>
                  </div>
                  <div class="mm-flag mm-flag--success" *ngIf="application()!.termMonths <= 36">
                    <mat-icon>check_circle</mat-icon>
                    <span>Standard loan term</span>
                  </div>
                  <div class="mm-flag mm-flag--info" *ngIf="application()!.termMonths > 36">
                    <mat-icon>info</mat-icon>
                    <span>Extended loan term - {{ application()!.termMonths }} months</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeline Card -->
            <div class="mm-card">
              <h3>
                <mat-icon>history</mat-icon>
                Application Timeline
              </h3>

              <div class="mm-timeline">
                <div class="mm-timeline-item mm-timeline-item--completed">
                  <div class="mm-timeline-item__dot"></div>
                  <div class="mm-timeline-item__content">
                    <span class="mm-timeline-item__title">Application Created</span>
                    <span class="mm-timeline-item__date">{{ application()!.createdAt | date:'medium' }}</span>
                  </div>
                </div>

                <div class="mm-timeline-item" [class.mm-timeline-item--completed]="application()!.submittedAt">
                  <div class="mm-timeline-item__dot"></div>
                  <div class="mm-timeline-item__content">
                    <span class="mm-timeline-item__title">Submitted for Review</span>
                    <span class="mm-timeline-item__date" *ngIf="application()!.submittedAt">
                      {{ application()!.submittedAt | date:'medium' }}
                    </span>
                  </div>
                </div>

                <div class="mm-timeline-item" [class.mm-timeline-item--completed]="application()!.status === 'UnderReview' || application()!.reviewedAt">
                  <div class="mm-timeline-item__dot"></div>
                  <div class="mm-timeline-item__content">
                    <span class="mm-timeline-item__title">Under Review</span>
                    <span class="mm-timeline-item__date" *ngIf="application()!.reviewedBy">
                      Reviewing
                    </span>
                  </div>
                </div>

                <div class="mm-timeline-item"
                     [class.mm-timeline-item--completed]="application()!.status === 'Approved'"
                     [class.mm-timeline-item--rejected]="application()!.status === 'Rejected'">
                  <div class="mm-timeline-item__dot"></div>
                  <div class="mm-timeline-item__content">
                    <span class="mm-timeline-item__title">
                      {{ application()!.status === 'Rejected' ? 'Rejected' : 'Decision' }}
                    </span>
                    <span class="mm-timeline-item__date" *ngIf="application()!.reviewedAt">
                      {{ application()!.reviewedAt | date:'medium' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <!-- Action Sidebar -->
          <aside class="mm-review-sidebar">
            <div class="mm-action-card" *ngIf="canTakeAction()">
              <h3>Review Actions</h3>

              <!-- Start Review Button -->
              <button mat-raised-button class="mm-btn-secondary full-width"
                      *ngIf="application()!.status === 'Submitted'"
                      (click)="startReview()"
                      [disabled]="isProcessing()">
                <mat-icon>rate_review</mat-icon>
                Start Review
              </button>

              <!-- Approval Section -->
              <div class="mm-action-section" *ngIf="application()!.status === 'UnderReview' || application()!.status === 'Submitted'">
                <h4>Approve Application</h4>
                <p>This will create a loan and make it available for funding on the marketplace.</p>
                <button mat-raised-button class="mm-btn-primary full-width"
                        (click)="approveApplication()"
                        [disabled]="isProcessing()">
                  <mat-spinner *ngIf="isProcessing() && processingAction() === 'approve'" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!isProcessing() || processingAction() !== 'approve'">check_circle</mat-icon>
                  Approve & Create Loan
                </button>
              </div>

              <mat-divider *ngIf="application()!.status === 'UnderReview' || application()!.status === 'Submitted'"></mat-divider>

              <!-- Rejection Section -->
              <div class="mm-action-section" *ngIf="application()!.status === 'UnderReview' || application()!.status === 'Submitted'">
                <h4>Reject Application</h4>
                <form [formGroup]="rejectForm">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Rejection Reason</mat-label>
                    <textarea matInput formControlName="reason" rows="3"
                              placeholder="Provide a reason for rejection..."></textarea>
                    <mat-error>Reason is required</mat-error>
                  </mat-form-field>

                  <button mat-raised-button color="warn" class="full-width"
                          (click)="rejectApplication()"
                          [disabled]="rejectForm.invalid || isProcessing()">
                    <mat-spinner *ngIf="isProcessing() && processingAction() === 'reject'" diameter="20"></mat-spinner>
                    <mat-icon *ngIf="!isProcessing() || processingAction() !== 'reject'">cancel</mat-icon>
                    Reject Application
                  </button>
                </form>
              </div>
            </div>

            <!-- Status Card (for completed reviews) -->
            <div class="mm-status-card" *ngIf="!canTakeAction()">
              <div class="mm-status-card__icon" [ngClass]="application()!.status === 'Approved' ? 'success' : 'error'">
                <mat-icon>{{ application()!.status === 'Approved' ? 'check_circle' : 'cancel' }}</mat-icon>
              </div>
              <h3>Application {{ application()!.status }}</h3>
              <p *ngIf="application()!.status === 'Rejected' && application()!.rejectionReason">
                <strong>Reason:</strong> {{ application()!.rejectionReason }}
              </p>
              <p *ngIf="application()!.reviewedAt">
                Reviewed on {{ application()!.reviewedAt | date:'medium' }}
              </p>
            </div>

            <!-- Quick Info Card -->
            <div class="mm-info-card">
              <h4>Quick Info</h4>
              <div class="mm-info-row">
                <span>Application ID</span>
                <span class="mono">{{ application()!.id | slice:0:8 }}</span>
              </div>
              <div class="mm-info-row">
                <span>Borrower ID</span>
                <span class="mono">{{ application()!.borrowerId | slice:0:8 }}</span>
              </div>
              <div class="mm-info-row">
                <span>Created</span>
                <span>{{ application()!.createdAt | date:'shortDate' }}</span>
              </div>
            </div>
          </aside>
        </div>

        <!-- Not Found -->
        <div class="mm-card" *ngIf="!isLoading() && !application()">
          <div class="mm-empty-state">
            <mat-icon>error_outline</mat-icon>
            <h3>Application not found</h3>
            <p>This application doesn't exist or you don't have access to it.</p>
            <a routerLink="/admin/applications" mat-raised-button class="mm-btn-primary">
              Back to Applications
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
      padding: var(--mm-spacing-xxl);
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--mm-gray-300);
        margin-bottom: var(--mm-spacing-md);
      }
    }

    .mm-review-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: var(--mm-spacing-xl);

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-application-header {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-xl);
      margin-bottom: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      &__top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--mm-spacing-md);

        h1 {
          margin: var(--mm-spacing-xs) 0 0;
          font-size: 1.5rem;
        }
      }

      &__meta {
        display: flex;
        gap: var(--mm-spacing-lg);
        color: var(--mm-gray-600);
        font-size: 0.875rem;

        span {
          display: flex;
          align-items: center;
          gap: var(--mm-spacing-xs);

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
      }
    }

    .mm-app-id {
      font-size: 0.75rem;
      color: var(--mm-gray-600);
      font-family: monospace;
    }

    .mm-badge--lg {
      padding: var(--mm-spacing-sm) var(--mm-spacing-md);
      font-size: 0.875rem;
    }

    .mm-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      margin-bottom: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      h3 {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-sm);
        margin: 0 0 var(--mm-spacing-lg);
        color: var(--mm-primary);

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
    }

    .mm-details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--mm-spacing-lg);
      margin-bottom: var(--mm-spacing-lg);

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-detail-item {
      .label {
        display: block;
        font-size: 0.75rem;
        color: var(--mm-gray-600);
        text-transform: uppercase;
        margin-bottom: var(--mm-spacing-xs);
      }

      .value {
        font-size: 1.125rem;
        font-weight: 500;
        color: var(--mm-gray-900);
      }

      &--highlight .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--mm-primary);
      }
    }

    .mm-description {
      margin: var(--mm-spacing-lg) 0;

      h4 {
        margin: 0 0 var(--mm-spacing-sm);
        font-size: 0.875rem;
        color: var(--mm-gray-600);
      }

      p {
        margin: 0;
        color: var(--mm-gray-900);
        line-height: 1.6;
      }
    }

    .mm-loan-summary {
      background: var(--mm-gray-100);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);

      h4 {
        margin: 0 0 var(--mm-spacing-md);
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--mm-spacing-md);

        @media (max-width: 600px) {
          grid-template-columns: 1fr;
        }

        > div {
          .label {
            display: block;
            font-size: 0.75rem;
            color: var(--mm-gray-600);
          }

          .value {
            font-weight: 600;
            color: var(--mm-gray-900);
          }
        }
      }
    }

    .mm-risk-indicators {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--mm-spacing-lg);
      margin-bottom: var(--mm-spacing-lg);

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-risk-indicator {
      padding: var(--mm-spacing-md);
      background: var(--mm-gray-100);
      border-radius: var(--mm-radius-md);

      &__header {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--mm-spacing-sm);
      }

      &__value {
        font-weight: 700;

        &.low { color: var(--mm-success); }
        &.medium { color: #F9A825; }
        &.high { color: var(--mm-error); }
      }

      &__bar {
        height: 8px;
        background: var(--mm-gray-200);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--mm-spacing-xs);
      }

      &__fill {
        height: 100%;
        border-radius: 4px;

        &.low { background: var(--mm-success); }
        &.medium { background: #F9A825; }
        &.high { background: var(--mm-error); }
      }

      &__label {
        font-size: 0.75rem;
        color: var(--mm-gray-600);
      }

      &__note {
        margin: 0;
        font-size: 0.75rem;
        color: var(--mm-gray-600);
      }
    }

    .mm-risk-flags h4 {
      margin: 0 0 var(--mm-spacing-md);
    }

    .mm-flags-list {
      display: flex;
      flex-direction: column;
      gap: var(--mm-spacing-sm);
    }

    .mm-flag {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-sm);
      padding: var(--mm-spacing-sm) var(--mm-spacing-md);
      border-radius: var(--mm-radius-sm);
      font-size: 0.875rem;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &--success {
        background: rgba(46, 125, 50, 0.1);
        color: var(--mm-success);
      }

      &--warning {
        background: rgba(249, 168, 37, 0.15);
        color: #F57C00;
      }

      &--error {
        background: rgba(211, 47, 47, 0.1);
        color: var(--mm-error);
      }

      &--info {
        background: rgba(0, 102, 179, 0.1);
        color: var(--mm-secondary);
      }
    }

    .mm-timeline {
      position: relative;
      padding-left: var(--mm-spacing-xl);

      &::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--mm-gray-200);
      }
    }

    .mm-timeline-item {
      position: relative;
      padding-bottom: var(--mm-spacing-lg);

      &:last-child {
        padding-bottom: 0;
      }

      &__dot {
        position: absolute;
        left: calc(-1 * var(--mm-spacing-xl) + 4px);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--mm-gray-300);
        border: 2px solid var(--mm-white);
      }

      &--completed &__dot {
        background: var(--mm-success);
      }

      &--rejected &__dot {
        background: var(--mm-error);
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
    }

    .mm-review-sidebar {
      @media (max-width: 1024px) {
        order: -1;
      }
    }

    .mm-action-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-md);
      margin-bottom: var(--mm-spacing-lg);

      h3 {
        margin: 0 0 var(--mm-spacing-lg);
      }

      mat-divider {
        margin: var(--mm-spacing-lg) 0;
      }
    }

    .mm-action-section {
      h4 {
        margin: 0 0 var(--mm-spacing-sm);
      }

      > p {
        font-size: 0.875rem;
        color: var(--mm-gray-600);
        margin: 0 0 var(--mm-spacing-md);
      }
    }

    .mm-status-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-xl);
      box-shadow: var(--mm-shadow-sm);
      text-align: center;
      margin-bottom: var(--mm-spacing-lg);

      &__icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--mm-spacing-md);

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }

        &.success {
          background: rgba(46, 125, 50, 0.1);
          color: var(--mm-success);
        }

        &.error {
          background: rgba(211, 47, 47, 0.1);
          color: var(--mm-error);
        }
      }

      h3 {
        margin: 0 0 var(--mm-spacing-sm);
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--mm-gray-600);
      }
    }

    .mm-info-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);

      h4 {
        margin: 0 0 var(--mm-spacing-md);
        color: var(--mm-gray-600);
        font-size: 0.875rem;
      }
    }

    .mm-info-row {
      display: flex;
      justify-content: space-between;
      padding: var(--mm-spacing-sm) 0;
      border-bottom: 1px solid var(--mm-gray-100);
      font-size: 0.875rem;

      &:last-child {
        border-bottom: none;
      }

      .mono {
        font-family: monospace;
        color: var(--mm-gray-600);
      }
    }

    .full-width {
      width: 100%;
    }

    .mm-btn-secondary {
      background: var(--mm-secondary) !important;
      color: white !important;
    }
  `]
})
export class ApplicationReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(true);
  isProcessing = signal(false);
  processingAction = signal<'approve' | 'reject' | null>(null);
  application = signal<LoanApplication | null>(null);

  rejectForm: FormGroup = this.fb.group({
    reason: ['', Validators.required]
  });

  ngOnInit(): void {
    const appId = this.route.snapshot.paramMap.get('id');
    if (appId) {
      this.loadApplication(appId);
    } else {
      this.isLoading.set(false);
    }
  }

  private loadApplication(id: string): void {
    this.apiService.getLoanApplication(id).subscribe({
      next: (app) => {
        this.application.set(app);
        this.isLoading.set(false);
      },
      error: () => {
        this.application.set(null);
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(): string {
    const status = this.application()?.status;
    if (!status) return '';

    const classes: Record<string, string> = {
      'Draft': 'mm-badge--draft',
      'Submitted': 'mm-badge--pending',
      'UnderReview': 'mm-badge--info',
      'Approved': 'mm-badge--success',
      'Rejected': 'mm-badge--error',
      'Cancelled': 'mm-badge--draft'
    };
    return classes[status] || '';
  }

  canTakeAction(): boolean {
    const status = this.application()?.status;
    return status === 'Submitted' || status === 'UnderReview';
  }

  calculateMonthlyPayment(): number {
    const app = this.application();
    if (!app) return 0;

    const rate = app.requestedInterestRate / 100 / 12;
    const term = app.termMonths;
    const amount = app.amount;

    if (rate === 0) return amount / term;
    return (amount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
  }

  calculateTotalInterest(): number {
    const app = this.application();
    if (!app) return 0;
    return this.calculateTotalRepayment() - app.amount;
  }

  calculateTotalRepayment(): number {
    const app = this.application();
    if (!app) return 0;
    return this.calculateMonthlyPayment() * app.termMonths;
  }

  estimatedDTI(): number {
    // Simplified DTI calculation - in real app would use actual income data
    const monthlyPayment = this.calculateMonthlyPayment();
    const estimatedMonthlyIncome = 3500; // Placeholder
    return Math.round((monthlyPayment / estimatedMonthlyIncome) * 100);
  }

  getDTIClass(): string {
    const dti = this.estimatedDTI();
    if (dti <= 20) return 'low';
    if (dti <= 35) return 'medium';
    return 'high';
  }

  getDTILabel(): string {
    const dti = this.estimatedDTI();
    if (dti <= 20) return 'Low - Good';
    if (dti <= 35) return 'Moderate - Acceptable';
    return 'High - Review Carefully';
  }

  calculateLTI(): number {
    const app = this.application();
    if (!app) return 0;
    const estimatedAnnualIncome = 42000; // Placeholder
    return app.amount / estimatedAnnualIncome;
  }

  startReview(): void {
    const app = this.application();
    if (!app) return;

    this.apiService.startApplicationReview(app.id).subscribe({
      next: (updated) => {
        this.application.set(updated);
        this.snackBar.open('Review started', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to start review', 'Close', { duration: 5000 });
      }
    });
  }

  approveApplication(): void {
    const app = this.application();
    if (!app) return;

    this.isProcessing.set(true);
    this.processingAction.set('approve');

    this.apiService.approveApplication(app.id).subscribe({
      next: (updated) => {
        this.application.set(updated);
        this.snackBar.open('Application approved!', 'Close', { duration: 3000 });
        this.isProcessing.set(false);
        this.processingAction.set(null);
      },
      error: () => {
        this.snackBar.open('Failed to approve application', 'Close', { duration: 5000 });
        this.isProcessing.set(false);
        this.processingAction.set(null);
      }
    });
  }

  rejectApplication(): void {
    if (this.rejectForm.invalid) return;

    const app = this.application();
    if (!app) return;

    this.isProcessing.set(true);
    this.processingAction.set('reject');

    const reason = this.rejectForm.get('reason')?.value;

    this.apiService.rejectApplication(app.id, reason).subscribe({
      next: (updated) => {
        this.application.set(updated);
        this.snackBar.open('Application rejected', 'Close', { duration: 3000 });
        this.isProcessing.set(false);
        this.processingAction.set(null);
      },
      error: () => {
        this.snackBar.open('Failed to reject application', 'Close', { duration: 5000 });
        this.isProcessing.set(false);
        this.processingAction.set(null);
      }
    });
  }
}
