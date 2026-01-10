import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { LoanApplication, LoanApplicationStatus } from '../../../core/models';

@Component({
  selector: 'app-applications-queue',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <h1 class="mm-page-header__title">Loan Applications</h1>
          <p class="mm-page-header__subtitle">
            Review and manage loan applications
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="mm-stats-row">
          <div class="mm-stat-card mm-stat-card--warning">
            <mat-icon>pending_actions</mat-icon>
            <div class="mm-stat-card__content">
              <span class="value">{{ getStatusCount('Submitted') }}</span>
              <span class="label">Pending Review</span>
            </div>
          </div>
          <div class="mm-stat-card mm-stat-card--info">
            <mat-icon>rate_review</mat-icon>
            <div class="mm-stat-card__content">
              <span class="value">{{ getStatusCount('UnderReview') }}</span>
              <span class="label">Under Review</span>
            </div>
          </div>
          <div class="mm-stat-card mm-stat-card--success">
            <mat-icon>check_circle</mat-icon>
            <div class="mm-stat-card__content">
              <span class="value">{{ getStatusCount('Approved') }}</span>
              <span class="label">Approved</span>
            </div>
          </div>
          <div class="mm-stat-card mm-stat-card--error">
            <mat-icon>cancel</mat-icon>
            <div class="mm-stat-card__content">
              <span class="value">{{ getStatusCount('Rejected') }}</span>
              <span class="label">Rejected</span>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="mm-filters-bar">
          <form [formGroup]="filterForm" class="mm-filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput formControlName="search" placeholder="Search by name or ID">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status" multiple>
                <mat-option value="Submitted">Pending</mat-option>
                <mat-option value="UnderReview">Under Review</mat-option>
                <mat-option value="Approved">Approved</mat-option>
                <mat-option value="Rejected">Rejected</mat-option>
                <mat-option value="Draft">Draft</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Amount Range</mat-label>
              <mat-select formControlName="amountRange">
                <mat-option value="">All</mat-option>
                <mat-option value="0-1000">Up to £1,000</mat-option>
                <mat-option value="1000-5000">£1,000 - £5,000</mat-option>
                <mat-option value="5000-10000">£5,000 - £10,000</mat-option>
                <mat-option value="10000-25000">£10,000 - £25,000</mat-option>
                <mat-option value="25000+">£25,000+</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button type="button" (click)="resetFilters()">
              <mat-icon>clear</mat-icon>
              Clear
            </button>
          </form>
        </div>

        <!-- Loading State -->
        <div class="mm-loading" *ngIf="isLoading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading applications...</p>
        </div>

        <!-- Empty State -->
        <div class="mm-card" *ngIf="!isLoading() && filteredApplications().length === 0">
          <div class="mm-empty-state">
            <mat-icon>inbox</mat-icon>
            <h3>No applications found</h3>
            <p>There are no applications matching your criteria.</p>
          </div>
        </div>

        <!-- Applications Table -->
        <div class="mm-table-container" *ngIf="!isLoading() && filteredApplications().length > 0">
          <table mat-table [dataSource]="paginatedApplications()" matSort (matSortChange)="sortData($event)">
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let app">
                <span class="mm-app-id">{{ app.id | slice:0:8 }}</span>
              </td>
            </ng-container>

            <!-- Applicant Column -->
            <ng-container matColumnDef="applicant">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Applicant</th>
              <td mat-cell *matCellDef="let app">
                <div class="mm-applicant">
                  <span class="mm-applicant__name">{{ app.borrowerName }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Amount Column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
              <td mat-cell *matCellDef="let app">
                <strong>{{ app.amount | currency:'GBP' }}</strong>
              </td>
            </ng-container>

            <!-- Purpose Column -->
            <ng-container matColumnDef="purpose">
              <th mat-header-cell *matHeaderCellDef>Purpose</th>
              <td mat-cell *matCellDef="let app">{{ app.purpose }}</td>
            </ng-container>

            <!-- Term Column -->
            <ng-container matColumnDef="term">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Term</th>
              <td mat-cell *matCellDef="let app">{{ app.termMonths }} mo</td>
            </ng-container>

            <!-- Rate Column -->
            <ng-container matColumnDef="rate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Rate</th>
              <td mat-cell *matCellDef="let app">{{ app.requestedInterestRate }}%</td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Submitted</th>
              <td mat-cell *matCellDef="let app">
                {{ app.submittedAt || app.createdAt | date:'short' }}
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let app">
                <span class="mm-badge" [ngClass]="getStatusClass(app.status)">
                  {{ app.status }}
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let app">
                <div class="mm-actions">
                  <a [routerLink]="['/admin/applications', app.id]"
                     mat-icon-button matTooltip="Review">
                    <mat-icon>visibility</mat-icon>
                  </a>
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="More actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="startReview(app)"
                            *ngIf="app.status === 'Submitted'">
                      <mat-icon>rate_review</mat-icon>
                      <span>Start Review</span>
                    </button>
                    <button mat-menu-item (click)="quickApprove(app)"
                            *ngIf="app.status === 'Submitted' || app.status === 'UnderReview'">
                      <mat-icon color="primary">check_circle</mat-icon>
                      <span>Quick Approve</span>
                    </button>
                    <button mat-menu-item (click)="quickReject(app)"
                            *ngIf="app.status === 'Submitted' || app.status === 'UnderReview'">
                      <mat-icon color="warn">cancel</mat-icon>
                      <span>Reject</span>
                    </button>
                  </mat-menu>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.mm-row-pending]="row.status === 'Submitted'"
                [class.mm-row-review]="row.status === 'UnderReview'">
            </tr>
          </table>

          <mat-paginator
            [length]="filteredApplications().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)">
          </mat-paginator>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mm-stats-row {
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

    .mm-stat-card {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-md);
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);
      border-left: 4px solid transparent;

      &--warning {
        border-left-color: #F9A825;
        mat-icon { color: #F9A825; }
      }

      &--info {
        border-left-color: var(--mm-secondary);
        mat-icon { color: var(--mm-secondary); }
      }

      &--success {
        border-left-color: var(--mm-success);
        mat-icon { color: var(--mm-success); }
      }

      &--error {
        border-left-color: var(--mm-error);
        mat-icon { color: var(--mm-error); }
      }

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      &__content {
        .value {
          display: block;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--mm-gray-900);
        }

        .label {
          font-size: 0.875rem;
          color: var(--mm-gray-600);
        }
      }
    }

    .mm-filters-bar {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-md);
      margin-bottom: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);
    }

    .mm-filters-form {
      display: flex;
      gap: var(--mm-spacing-md);
      align-items: center;
      flex-wrap: wrap;

      mat-form-field {
        flex: 1;
        min-width: 150px;
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

    .mm-table-container {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      box-shadow: var(--mm-shadow-sm);
      overflow: hidden;

      table {
        width: 100%;
      }
    }

    .mm-app-id {
      font-family: monospace;
      font-size: 0.875rem;
      color: var(--mm-gray-600);
    }

    .mm-applicant {
      &__name {
        font-weight: 500;
      }
    }

    .mm-actions {
      display: flex;
      gap: var(--mm-spacing-xs);
    }

    .mm-row-pending {
      background: rgba(249, 168, 37, 0.05);
    }

    .mm-row-review {
      background: rgba(0, 102, 179, 0.05);
    }

    ::ng-deep .mat-mdc-row:hover {
      background: var(--mm-gray-100) !important;
    }

    .mm-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;

      &--pending {
        background: rgba(249, 168, 37, 0.15);
        color: #F57C00;
      }

      &--info {
        background: rgba(0, 102, 179, 0.15);
        color: var(--mm-secondary);
      }

      &--success {
        background: rgba(46, 125, 50, 0.15);
        color: var(--mm-success);
      }

      &--error {
        background: rgba(211, 47, 47, 0.15);
        color: var(--mm-error);
      }

      &--draft {
        background: var(--mm-gray-200);
        color: var(--mm-gray-600);
      }
    }
  `]
})
export class ApplicationsQueueComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);

  isLoading = signal(true);
  applications = signal<LoanApplication[]>([]);
  filteredApplications = signal<LoanApplication[]>([]);

  displayedColumns = ['id', 'applicant', 'amount', 'purpose', 'term', 'rate', 'date', 'status', 'actions'];

  pageSize = 10;
  currentPage = 0;

  filterForm: FormGroup = this.fb.group({
    search: [''],
    status: [['Submitted', 'UnderReview']],
    amountRange: ['']
  });

  ngOnInit(): void {
    this.loadApplications();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private loadApplications(): void {
    this.apiService.getPendingApplications().subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.applications.set([]);
        this.filteredApplications.set([]);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    const { search, status, amountRange } = this.filterForm.value;

    let filtered = this.applications().filter(app => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!app.borrowerName.toLowerCase().includes(searchLower) &&
            !app.id.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (status && status.length > 0 && !status.includes(app.status)) {
        return false;
      }

      // Amount range filter
      if (amountRange) {
        const [min, max] = this.parseAmountRange(amountRange);
        if (app.amount < min || (max && app.amount > max)) {
          return false;
        }
      }

      return true;
    });

    this.filteredApplications.set(filtered);
    this.currentPage = 0;
  }

  private parseAmountRange(range: string): [number, number | null] {
    switch (range) {
      case '0-1000': return [0, 1000];
      case '1000-5000': return [1000, 5000];
      case '5000-10000': return [5000, 10000];
      case '10000-25000': return [10000, 25000];
      case '25000+': return [25000, null];
      default: return [0, null];
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      status: ['Submitted', 'UnderReview'],
      amountRange: ''
    });
  }

  paginatedApplications(): LoanApplication[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredApplications().slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      return;
    }

    const sorted = [...this.filteredApplications()].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'applicant': return this.compare(a.borrowerName, b.borrowerName, isAsc);
        case 'amount': return this.compare(a.amount, b.amount, isAsc);
        case 'term': return this.compare(a.termMonths, b.termMonths, isAsc);
        case 'rate': return this.compare(a.requestedInterestRate, b.requestedInterestRate, isAsc);
        case 'date': return this.compare(a.submittedAt || a.createdAt, b.submittedAt || b.createdAt, isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });

    this.filteredApplications.set(sorted);
  }

  private compare(a: string | number, b: string | number, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getStatusCount(status: LoanApplicationStatus): number {
    return this.applications().filter(a => a.status === status).length;
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

  startReview(app: LoanApplication): void {
    this.apiService.startApplicationReview(app.id).subscribe({
      next: () => this.loadApplications(),
      error: (err) => console.error('Failed to start review', err)
    });
  }

  quickApprove(app: LoanApplication): void {
    this.apiService.approveApplication(app.id).subscribe({
      next: () => this.loadApplications(),
      error: (err) => console.error('Failed to approve', err)
    });
  }

  quickReject(app: LoanApplication): void {
    const reason = 'Application did not meet requirements';
    this.apiService.rejectApplication(app.id, reason).subscribe({
      next: () => this.loadApplications(),
      error: (err) => console.error('Failed to reject', err)
    });
  }
}
