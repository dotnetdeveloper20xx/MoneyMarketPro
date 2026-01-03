import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { LoanApplication } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <h1 class="mm-page-header__title">Admin Dashboard</h1>
          <p class="mm-page-header__subtitle">
            Manage loan applications and platform operations
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="mm-dashboard-grid">
          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--warning">
              <mat-icon>pending_actions</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ pendingCount() }}</div>
            <div class="mm-stat-card__label">Pending Reviews</div>
          </div>

          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--success">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ approvedToday() }}</div>
            <div class="mm-stat-card__label">Approved Today</div>
          </div>

          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--primary">
              <mat-icon>people</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ totalUsers() }}</div>
            <div class="mm-stat-card__label">Total Users</div>
          </div>

          <div class="mm-stat-card">
            <div class="mm-stat-card__icon mm-stat-card__icon--success">
              <mat-icon>account_balance</mat-icon>
            </div>
            <div class="mm-stat-card__value">{{ totalLoansValue() | currency:'GBP':'symbol':'1.0-0' }}</div>
            <div class="mm-stat-card__label">Total Loans Value</div>
          </div>
        </div>

        <!-- Pending Applications Section -->
        <section class="mm-section">
          <div class="mm-section__header">
            <h2>Pending Applications</h2>
            <a routerLink="/admin/applications" mat-button>View all</a>
          </div>

          <div class="mm-card" *ngIf="pendingApplications().length === 0">
            <div class="mm-empty-state">
              <mat-icon>inbox</mat-icon>
              <h3>No pending applications</h3>
              <p>All applications have been reviewed. Great work!</p>
            </div>
          </div>

          <table mat-table [dataSource]="pendingApplications()" class="mm-table" *ngIf="pendingApplications().length > 0">
            <ng-container matColumnDef="applicant">
              <th mat-header-cell *matHeaderCellDef>Applicant</th>
              <td mat-cell *matCellDef="let app">{{ app.borrowerName }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let app">{{ app.amount | currency:'GBP' }}</td>
            </ng-container>

            <ng-container matColumnDef="purpose">
              <th mat-header-cell *matHeaderCellDef>Purpose</th>
              <td mat-cell *matCellDef="let app">{{ app.purpose }}</td>
            </ng-container>

            <ng-container matColumnDef="term">
              <th mat-header-cell *matHeaderCellDef>Term</th>
              <td mat-cell *matCellDef="let app">{{ app.termMonths }} months</td>
            </ng-container>

            <ng-container matColumnDef="submitted">
              <th mat-header-cell *matHeaderCellDef>Submitted</th>
              <td mat-cell *matCellDef="let app">{{ app.submittedAt | date:'short' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let app">
                <span class="mm-badge" [ngClass]="{
                  'mm-badge--pending': app.status === 'Submitted',
                  'mm-badge--info': app.status === 'UnderReview'
                }">
                  {{ app.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let app">
                <a [routerLink]="['/admin/applications', app.id]" mat-raised-button class="mm-btn-primary" size="small">
                  Review
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="applicationColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: applicationColumns;"></tr>
          </table>
        </section>

        <!-- Quick Actions -->
        <section class="mm-section">
          <h2>Quick Actions</h2>
          <div class="mm-quick-actions-grid">
            <a routerLink="/admin/applications" class="mm-action-card">
              <mat-icon>description</mat-icon>
              <h4>Review Applications</h4>
              <p>Review and process pending loan applications</p>
            </a>

            <a routerLink="/admin/users" class="mm-action-card">
              <mat-icon>people</mat-icon>
              <h4>Manage Users</h4>
              <p>View and manage platform users</p>
            </a>

            <a routerLink="/admin/loans" class="mm-action-card">
              <mat-icon>account_balance</mat-icon>
              <h4>Manage Loans</h4>
              <p>Monitor active loans and disbursements</p>
            </a>

            <a routerLink="/admin/reports" class="mm-action-card">
              <mat-icon>bar_chart</mat-icon>
              <h4>View Reports</h4>
              <p>Analytics and platform statistics</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
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
        margin: 0;
      }
    }

    .mm-quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--mm-spacing-lg);
    }

    .mm-action-card {
      display: block;
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);
      text-decoration: none;
      transition: all var(--mm-transition-normal);

      &:hover {
        box-shadow: var(--mm-shadow-md);
        transform: translateY(-2px);
      }

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: var(--mm-primary);
        margin-bottom: var(--mm-spacing-md);
      }

      h4 {
        font-size: 1.125rem;
        color: var(--mm-gray-900);
        margin: 0 0 var(--mm-spacing-sm);
      }

      p {
        color: var(--mm-gray-600);
        margin: 0;
        font-size: 0.875rem;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);

  isLoading = signal(true);
  pendingApplications = signal<LoanApplication[]>([]);

  applicationColumns = ['applicant', 'amount', 'purpose', 'term', 'submitted', 'status', 'actions'];

  // Stats - would come from API in real app
  pendingCount = signal(0);
  approvedToday = signal(0);
  totalUsers = signal(0);
  totalLoansValue = signal(0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load pending applications
    this.apiService.getPendingApplications().subscribe({
      next: (applications) => {
        this.pendingApplications.set(applications);
        this.pendingCount.set(applications.length);
      },
      error: () => {
        this.pendingApplications.set([]);
        this.pendingCount.set(0);
      }
    });

    // Mock stats for demo
    this.approvedToday.set(5);
    this.totalUsers.set(1234);
    this.totalLoansValue.set(2500000);

    this.isLoading.set(false);
  }
}
