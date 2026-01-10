import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoanApplication, LoanApplicationStatus } from '../../../core/models';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <div class="mm-page-header__top">
            <div>
              <h1 class="mm-page-header__title">My Applications</h1>
              <p class="mm-page-header__subtitle">
                Track the status of your loan applications
              </p>
            </div>
            <a routerLink="/borrower/apply" mat-raised-button class="mm-btn-primary">
              <mat-icon>add</mat-icon>
              New Application
            </a>
          </div>
        </div>

        <!-- Loading State -->
        <div class="mm-loading" *ngIf="isLoading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading applications...</p>
        </div>

        <!-- Empty State -->
        <div class="mm-card" *ngIf="!isLoading() && applications().length === 0">
          <div class="mm-empty-state">
            <mat-icon>description</mat-icon>
            <h3>No applications yet</h3>
            <p>You haven't submitted any loan applications. Start by applying for a loan.</p>
            <a routerLink="/borrower/apply" mat-raised-button class="mm-btn-primary">
              Apply for a Loan
            </a>
          </div>
        </div>

        <!-- Applications Grid (Mobile) -->
        <div class="mm-applications-grid" *ngIf="!isLoading() && applications().length > 0">
          <div class="mm-application-card" *ngFor="let app of applications()">
            <div class="mm-application-card__header">
              <span class="mm-badge" [ngClass]="getStatusClass(app.status)">
                {{ app.status }}
              </span>
              <span class="mm-application-card__date">
                {{ app.createdAt | date:'mediumDate' }}
              </span>
            </div>

            <div class="mm-application-card__amount">
              {{ app.amount | currency:'GBP' }}
            </div>

            <div class="mm-application-card__purpose">
              {{ app.purpose }}
            </div>

            <div class="mm-application-card__details">
              <div>
                <span class="label">Term</span>
                <span class="value">{{ app.termMonths }} months</span>
              </div>
              <div>
                <span class="label">Rate</span>
                <span class="value">{{ app.requestedInterestRate }}% APR</span>
              </div>
            </div>

            <div class="mm-application-card__actions">
              <a [routerLink]="['/borrower/applications', app.id]"
                 mat-stroked-button class="full-width">
                View Details
              </a>
            </div>

            <!-- Status-specific messages -->
            <div class="mm-application-card__message" *ngIf="app.status === 'Submitted'">
              <mat-icon>schedule</mat-icon>
              Your application is awaiting review
            </div>

            <div class="mm-application-card__message mm-application-card__message--info"
                 *ngIf="app.status === 'UnderReview'">
              <mat-icon>rate_review</mat-icon>
              Your application is being reviewed
            </div>

            <div class="mm-application-card__message mm-application-card__message--success"
                 *ngIf="app.status === 'Approved'">
              <mat-icon>check_circle</mat-icon>
              Congratulations! Your loan has been approved
            </div>

            <div class="mm-application-card__message mm-application-card__message--error"
                 *ngIf="app.status === 'Rejected'">
              <mat-icon>cancel</mat-icon>
              {{ app.rejectionReason || 'Application was not approved' }}
            </div>
          </div>
        </div>

        <!-- Applications Table (Desktop) -->
        <div class="mm-table-container" *ngIf="!isLoading() && applications().length > 0">
          <table mat-table [dataSource]="applications()" class="mm-table mm-table--desktop">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let app">
                {{ app.createdAt | date:'mediumDate' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let app">
                <strong>{{ app.amount | currency:'GBP' }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="purpose">
              <th mat-header-cell *matHeaderCellDef>Purpose</th>
              <td mat-cell *matCellDef="let app">{{ app.purpose }}</td>
            </ng-container>

            <ng-container matColumnDef="term">
              <th mat-header-cell *matHeaderCellDef>Term</th>
              <td mat-cell *matCellDef="let app">{{ app.termMonths }} months</td>
            </ng-container>

            <ng-container matColumnDef="rate">
              <th mat-header-cell *matHeaderCellDef>Rate</th>
              <td mat-cell *matCellDef="let app">{{ app.requestedInterestRate }}% APR</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let app">
                <span class="mm-badge" [ngClass]="getStatusClass(app.status)">
                  {{ app.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let app">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['/borrower/applications', app.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </a>
                  <button mat-menu-item *ngIf="app.status === 'Draft'"
                          (click)="submitDraft(app)">
                    <mat-icon>send</mat-icon>
                    <span>Submit</span>
                  </button>
                  <button mat-menu-item *ngIf="app.status === 'Draft'"
                          (click)="cancelApplication(app)" class="text-error">
                    <mat-icon>cancel</mat-icon>
                    <span>Cancel</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <!-- Summary Stats -->
        <div class="mm-stats-summary" *ngIf="!isLoading() && applications().length > 0">
          <div class="mm-stats-summary__item">
            <span class="label">Total Applications</span>
            <span class="value">{{ applications().length }}</span>
          </div>
          <div class="mm-stats-summary__item">
            <span class="label">Pending Review</span>
            <span class="value">{{ getPendingCount() }}</span>
          </div>
          <div class="mm-stats-summary__item">
            <span class="label">Approved</span>
            <span class="value text-success">{{ getApprovedCount() }}</span>
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

    .mm-applications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--mm-spacing-lg);

      @media (min-width: 1024px) {
        display: none;
      }
    }

    .mm-application-card {
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

      &__details {
        display: flex;
        gap: var(--mm-spacing-xl);
        padding: var(--mm-spacing-md) 0;
        border-top: 1px solid var(--mm-gray-200);
        border-bottom: 1px solid var(--mm-gray-200);
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
          }
        }
      }

      &__actions {
        margin-bottom: var(--mm-spacing-md);
      }

      &__message {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-sm);
        font-size: 0.875rem;
        color: var(--mm-gray-600);
        padding: var(--mm-spacing-sm);
        background: var(--mm-gray-100);
        border-radius: var(--mm-radius-sm);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &--info {
          background: var(--mm-light-blue);
          color: var(--mm-secondary);
        }

        &--success {
          background: rgba(46, 125, 50, 0.1);
          color: var(--mm-success);
        }

        &--error {
          background: rgba(211, 47, 47, 0.1);
          color: var(--mm-error);
        }
      }
    }

    .mm-table-container {
      display: none;

      @media (min-width: 1024px) {
        display: block;
        background: var(--mm-white);
        border-radius: var(--mm-radius-md);
        box-shadow: var(--mm-shadow-sm);
        overflow: hidden;
      }
    }

    .mm-table--desktop {
      width: 100%;
    }

    .mm-stats-summary {
      display: flex;
      gap: var(--mm-spacing-xl);
      margin-top: var(--mm-spacing-xl);
      padding: var(--mm-spacing-lg);
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      box-shadow: var(--mm-shadow-sm);

      @media (max-width: 600px) {
        flex-direction: column;
        gap: var(--mm-spacing-md);
      }

      &__item {
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

    .full-width {
      width: 100%;
    }

    .text-success {
      color: var(--mm-success) !important;
    }

    .text-error {
      color: var(--mm-error) !important;
    }
  `]
})
export class ApplicationsListComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  isLoading = signal(true);
  applications = signal<LoanApplication[]>([]);

  displayedColumns = ['date', 'amount', 'purpose', 'term', 'rate', 'status', 'actions'];

  ngOnInit(): void {
    this.loadApplications();
  }

  private loadApplications(): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    // First get borrower profile to get borrower ID
    this.apiService.getBorrowerProfileByUserId(userId).subscribe({
      next: (profile) => {
        this.apiService.getBorrowerApplications(profile.id).subscribe({
          next: (apps) => {
            this.applications.set(apps.sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
            this.isLoading.set(false);
          },
          error: () => {
            this.applications.set([]);
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        // No borrower profile yet
        this.applications.set([]);
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(status: LoanApplicationStatus): string {
    const classes: Record<LoanApplicationStatus, string> = {
      'Draft': 'mm-badge--draft',
      'Submitted': 'mm-badge--pending',
      'UnderReview': 'mm-badge--info',
      'Approved': 'mm-badge--success',
      'Rejected': 'mm-badge--error',
      'Cancelled': 'mm-badge--draft'
    };
    return classes[status] || '';
  }

  getPendingCount(): number {
    return this.applications().filter(a =>
      a.status === 'Submitted' || a.status === 'UnderReview'
    ).length;
  }

  getApprovedCount(): number {
    return this.applications().filter(a => a.status === 'Approved').length;
  }

  submitDraft(app: LoanApplication): void {
    this.apiService.submitLoanApplication(app.id).subscribe({
      next: () => this.loadApplications(),
      error: (err) => console.error('Failed to submit', err)
    });
  }

  cancelApplication(app: LoanApplication): void {
    // Would need a cancel endpoint - for now just log
    console.log('Cancel application', app.id);
  }
}
