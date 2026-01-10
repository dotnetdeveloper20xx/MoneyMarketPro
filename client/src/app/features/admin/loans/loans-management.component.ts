import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface AdminLoan {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  amount: number;
  interestRate: number;
  term: number;
  purpose: string;
  status: 'Pending' | 'Active' | 'PaidOff' | 'Defaulted' | 'Cancelled';
  riskGrade: string;
  fundedAmount: number;
  fundedPercentage: number;
  disbursementDate: Date | null;
  nextPaymentDate: Date | null;
  totalPaid: number;
  remainingBalance: number;
  investorCount: number;
  createdAt: Date;
  daysOverdue: number;
}

interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  totalDisbursed: number;
  totalRepaid: number;
  defaultRate: number;
  averageLoanSize: number;
}

@Component({
  selector: 'app-loans-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTabsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <div class="loans-management">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Loans Management</h1>
          <p class="subtitle">Monitor and manage all platform loans</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="exportLoans()">
            <mat-icon>download</mat-icon>
            Export Report
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon total">
              <mat-icon>receipt_long</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-value">{{ stats().totalLoans }}</span>
              <span class="stat-label">Total Loans</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon active">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-value">{{ stats().activeLoans }}</span>
              <span class="stat-label">Active Loans</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon disbursed">
              <mat-icon>payments</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-value">{{ stats().totalDisbursed | currency:'GBP' }}</span>
              <span class="stat-label">Total Disbursed</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon repaid">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-value">{{ stats().totalRepaid | currency:'GBP' }}</span>
              <span class="stat-label">Total Repaid</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon default">
              <mat-icon>warning</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-value">{{ stats().defaultRate | number:'1.1-1' }}%</span>
              <span class="stat-label">Default Rate</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon average">
              <mat-icon>analytics</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-value">{{ stats().averageLoanSize | currency:'GBP':'symbol':'1.0-0' }}</span>
              <span class="stat-label">Avg Loan Size</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search loans</mat-label>
              <input matInput formControlName="search" placeholder="Loan ID, borrower name or email">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="">All Status</mat-option>
                <mat-option value="Pending">Pending</mat-option>
                <mat-option value="Active">Active</mat-option>
                <mat-option value="PaidOff">Paid Off</mat-option>
                <mat-option value="Defaulted">Defaulted</mat-option>
                <mat-option value="Cancelled">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Risk Grade</mat-label>
              <mat-select formControlName="riskGrade">
                <mat-option value="">All Grades</mat-option>
                <mat-option value="A">A - Excellent</mat-option>
                <mat-option value="B">B - Good</mat-option>
                <mat-option value="C">C - Fair</mat-option>
                <mat-option value="D">D - Poor</mat-option>
                <mat-option value="E">E - High Risk</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Amount Range</mat-label>
              <mat-select formControlName="amountRange">
                <mat-option value="">All Amounts</mat-option>
                <mat-option value="0-5000">Up to 5,000</mat-option>
                <mat-option value="5000-15000">5,000 - 15,000</mat-option>
                <mat-option value="15000-30000">15,000 - 30,000</mat-option>
                <mat-option value="30000+">30,000+</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button type="button" (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loans Table -->
      <mat-card class="table-card">
        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading loans...</p>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="filteredLoans()" class="loans-table">
                <!-- Loan ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>Loan ID</th>
                  <td mat-cell *matCellDef="let loan">
                    <span class="loan-id">{{ loan.id | slice:0:8 }}...</span>
                  </td>
                </ng-container>

                <!-- Borrower Column -->
                <ng-container matColumnDef="borrower">
                  <th mat-header-cell *matHeaderCellDef>Borrower</th>
                  <td mat-cell *matCellDef="let loan">
                    <div class="borrower-info">
                      <span class="borrower-name">{{ loan.borrowerName }}</span>
                      <span class="borrower-email">{{ loan.borrowerEmail }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Amount Column -->
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let loan">
                    <div class="amount-info">
                      <span class="amount">{{ loan.amount | currency:'GBP' }}</span>
                      <span class="rate">{{ loan.interestRate }}% / {{ loan.term }}mo</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let loan">
                    <mat-chip [class]="'status-' + loan.status.toLowerCase()">
                      {{ loan.status }}
                    </mat-chip>
                    @if (loan.daysOverdue > 0 && loan.status === 'Active') {
                      <span class="overdue-badge">{{ loan.daysOverdue }}d overdue</span>
                    }
                  </td>
                </ng-container>

                <!-- Risk Grade Column -->
                <ng-container matColumnDef="riskGrade">
                  <th mat-header-cell *matHeaderCellDef>Grade</th>
                  <td mat-cell *matCellDef="let loan">
                    <span class="risk-grade" [class]="'grade-' + loan.riskGrade.toLowerCase()">
                      {{ loan.riskGrade }}
                    </span>
                  </td>
                </ng-container>

                <!-- Funding Column -->
                <ng-container matColumnDef="funding">
                  <th mat-header-cell *matHeaderCellDef>Funding</th>
                  <td mat-cell *matCellDef="let loan">
                    <div class="funding-info">
                      <div class="funding-bar">
                        <div class="funding-progress" [style.width.%]="loan.fundedPercentage"></div>
                      </div>
                      <span class="funding-text">{{ loan.fundedPercentage }}% ({{ loan.investorCount }} investors)</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Repayment Column -->
                <ng-container matColumnDef="repayment">
                  <th mat-header-cell *matHeaderCellDef>Repayment</th>
                  <td mat-cell *matCellDef="let loan">
                    <div class="repayment-info">
                      <span class="paid">{{ loan.totalPaid | currency:'GBP' }} paid</span>
                      <span class="remaining">{{ loan.remainingBalance | currency:'GBP' }} remaining</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let loan">
                    <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="More actions">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionMenu="matMenu">
                      <button mat-menu-item (click)="viewLoanDetails(loan)">
                        <mat-icon>visibility</mat-icon>
                        <span>View Details</span>
                      </button>
                      <button mat-menu-item (click)="viewPaymentHistory(loan)">
                        <mat-icon>history</mat-icon>
                        <span>Payment History</span>
                      </button>
                      @if (loan.status === 'Active' && loan.daysOverdue > 30) {
                        <button mat-menu-item (click)="markAsDefaulted(loan)">
                          <mat-icon color="warn">report</mat-icon>
                          <span>Mark as Defaulted</span>
                        </button>
                      }
                      @if (loan.status === 'Active') {
                        <button mat-menu-item (click)="sendPaymentReminder(loan)">
                          <mat-icon>email</mat-icon>
                          <span>Send Reminder</span>
                        </button>
                      }
                      <button mat-menu-item (click)="viewBorrowerProfile(loan)">
                        <mat-icon>person</mat-icon>
                        <span>View Borrower</span>
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>

            @if (filteredLoans().length === 0) {
              <div class="empty-state">
                <mat-icon>search_off</mat-icon>
                <h3>No loans found</h3>
                <p>Try adjusting your filters</p>
              </div>
            }

            <mat-paginator
              [length]="totalLoans()"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .loans-management {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header-content h1 {
      margin: 0 0 4px 0;
      color: var(--primary-navy);
      font-size: 28px;
    }

    .subtitle {
      margin: 0;
      color: var(--text-muted);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 12px;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.total {
      background: rgba(0, 48, 135, 0.1);
      color: var(--primary-navy);
    }

    .stat-icon.active {
      background: rgba(39, 174, 96, 0.1);
      color: #27ae60;
    }

    .stat-icon.disbursed {
      background: rgba(52, 152, 219, 0.1);
      color: #3498db;
    }

    .stat-icon.repaid {
      background: rgba(155, 89, 182, 0.1);
      color: #9b59b6;
    }

    .stat-icon.default {
      background: rgba(231, 76, 60, 0.1);
      color: #e74c3c;
    }

    .stat-icon.average {
      background: rgba(241, 196, 15, 0.1);
      color: #f39c12;
    }

    .stat-details {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary-navy);
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
    }

    .filters-card {
      margin-bottom: 24px;
      border-radius: 12px;
    }

    .filters-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .table-card {
      border-radius: 12px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }

    .loading-container p {
      margin-top: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .loans-table {
      width: 100%;
    }

    .loan-id {
      font-family: monospace;
      font-size: 12px;
      color: var(--text-muted);
    }

    .borrower-info {
      display: flex;
      flex-direction: column;
    }

    .borrower-name {
      font-weight: 500;
      color: var(--primary-navy);
    }

    .borrower-email {
      font-size: 12px;
      color: var(--text-muted);
    }

    .amount-info {
      display: flex;
      flex-direction: column;
    }

    .amount {
      font-weight: 600;
      color: var(--primary-navy);
    }

    .rate {
      font-size: 12px;
      color: var(--text-muted);
    }

    .status-pending {
      background: #fff3cd !important;
      color: #856404 !important;
    }

    .status-active {
      background: #d4edda !important;
      color: #155724 !important;
    }

    .status-paidoff {
      background: #cce5ff !important;
      color: #004085 !important;
    }

    .status-defaulted {
      background: #f8d7da !important;
      color: #721c24 !important;
    }

    .status-cancelled {
      background: #e2e3e5 !important;
      color: #383d41 !important;
    }

    .overdue-badge {
      display: inline-block;
      margin-left: 8px;
      padding: 2px 8px;
      background: #e74c3c;
      color: white;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
    }

    .risk-grade {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 14px;
    }

    .grade-a {
      background: #27ae60;
      color: white;
    }

    .grade-b {
      background: #2ecc71;
      color: white;
    }

    .grade-c {
      background: #f39c12;
      color: white;
    }

    .grade-d {
      background: #e67e22;
      color: white;
    }

    .grade-e {
      background: #e74c3c;
      color: white;
    }

    .funding-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;
    }

    .funding-bar {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }

    .funding-progress {
      height: 100%;
      background: var(--primary-navy);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .funding-text {
      font-size: 11px;
      color: var(--text-muted);
    }

    .repayment-info {
      display: flex;
      flex-direction: column;
    }

    .paid {
      font-weight: 500;
      color: #27ae60;
      font-size: 13px;
    }

    .remaining {
      font-size: 12px;
      color: var(--text-muted);
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: var(--primary-navy);
    }

    .empty-state p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .loans-management {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions button {
        flex: 1;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters-form {
        flex-direction: column;
      }

      .search-field {
        width: 100%;
      }
    }
  `]
})
export class LoansManagementComponent implements OnInit {
  loading = signal(true);
  loans = signal<AdminLoan[]>([]);
  totalLoans = signal(0);
  pageSize = 25;
  currentPage = 0;

  displayedColumns = ['id', 'borrower', 'amount', 'status', 'riskGrade', 'funding', 'repayment', 'actions'];

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl(''),
    riskGrade: new FormControl(''),
    amountRange: new FormControl('')
  });

  stats = computed<LoanStats>(() => {
    const allLoans = this.loans();
    const activeLoans = allLoans.filter(l => l.status === 'Active');
    const defaultedLoans = allLoans.filter(l => l.status === 'Defaulted');

    return {
      totalLoans: allLoans.length,
      activeLoans: activeLoans.length,
      totalDisbursed: allLoans.reduce((sum, l) => sum + l.fundedAmount, 0),
      totalRepaid: allLoans.reduce((sum, l) => sum + l.totalPaid, 0),
      defaultRate: allLoans.length > 0 ? (defaultedLoans.length / allLoans.length) * 100 : 0,
      averageLoanSize: allLoans.length > 0 ? allLoans.reduce((sum, l) => sum + l.amount, 0) / allLoans.length : 0
    };
  });

  filteredLoans = computed(() => {
    let result = this.loans();
    const filters = this.filterForm.value;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(l =>
        l.id.toLowerCase().includes(search) ||
        l.borrowerName.toLowerCase().includes(search) ||
        l.borrowerEmail.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      result = result.filter(l => l.status === filters.status);
    }

    if (filters.riskGrade) {
      result = result.filter(l => l.riskGrade === filters.riskGrade);
    }

    if (filters.amountRange) {
      const [min, max] = this.parseAmountRange(filters.amountRange);
      result = result.filter(l => l.amount >= min && (max === null || l.amount <= max));
    }

    return result;
  });

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLoans();

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 0;
    });
  }

  loadLoans(): void {
    this.loading.set(true);

    // Simulate API call - in production, this would call the admin API
    setTimeout(() => {
      this.loans.set(this.generateMockLoans());
      this.totalLoans.set(this.loans().length);
      this.loading.set(false);
    }, 800);
  }

  private generateMockLoans(): AdminLoan[] {
    const statuses: AdminLoan['status'][] = ['Pending', 'Active', 'Active', 'Active', 'PaidOff', 'Defaulted'];
    const grades = ['A', 'B', 'B', 'C', 'C', 'D', 'E'];
    const purposes = ['Debt Consolidation', 'Home Improvement', 'Business', 'Education', 'Medical', 'Vehicle'];
    const names = [
      'James Wilson', 'Sarah Thompson', 'Michael Brown', 'Emma Davis',
      'Robert Taylor', 'Jennifer White', 'David Anderson', 'Lisa Martinez',
      'Christopher Lee', 'Amanda Harris', 'Daniel Clark', 'Michelle Lewis'
    ];

    return Array.from({ length: 50 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 45000) + 5000;
      const fundedPercentage = status === 'Pending' ? Math.floor(Math.random() * 100) : 100;
      const totalPaid = status === 'PaidOff' ? amount * 1.1 :
                        status === 'Active' ? Math.floor(Math.random() * amount * 0.6) : 0;

      return {
        id: `loan-${(i + 1).toString().padStart(6, '0')}-${Math.random().toString(36).substr(2, 9)}`,
        borrowerName: names[Math.floor(Math.random() * names.length)],
        borrowerEmail: `user${i + 1}@example.com`,
        amount,
        interestRate: Math.floor(Math.random() * 10) + 5,
        term: [12, 24, 36, 48, 60][Math.floor(Math.random() * 5)],
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
        status,
        riskGrade: grades[Math.floor(Math.random() * grades.length)],
        fundedAmount: amount * fundedPercentage / 100,
        fundedPercentage,
        disbursementDate: status !== 'Pending' ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) : null,
        nextPaymentDate: status === 'Active' ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        totalPaid,
        remainingBalance: amount - totalPaid + (amount * 0.1),
        investorCount: Math.floor(Math.random() * 15) + 1,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        daysOverdue: status === 'Active' && Math.random() > 0.7 ? Math.floor(Math.random() * 60) : 0
      };
    });
  }

  private parseAmountRange(range: string): [number, number | null] {
    switch (range) {
      case '0-5000': return [0, 5000];
      case '5000-15000': return [5000, 15000];
      case '15000-30000': return [15000, 30000];
      case '30000+': return [30000, null];
      default: return [0, null];
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  viewLoanDetails(loan: AdminLoan): void {
    this.snackBar.open(`Opening loan details for ${loan.id}`, 'Close', { duration: 2000 });
  }

  viewPaymentHistory(loan: AdminLoan): void {
    this.snackBar.open(`Opening payment history for ${loan.id}`, 'Close', { duration: 2000 });
  }

  markAsDefaulted(loan: AdminLoan): void {
    if (confirm(`Are you sure you want to mark loan ${loan.id} as defaulted? This action cannot be undone.`)) {
      this.snackBar.open(`Loan ${loan.id} marked as defaulted`, 'Close', { duration: 3000 });
      // In production, call API to update loan status
    }
  }

  sendPaymentReminder(loan: AdminLoan): void {
    this.snackBar.open(`Payment reminder sent to ${loan.borrowerEmail}`, 'Close', { duration: 3000 });
  }

  viewBorrowerProfile(loan: AdminLoan): void {
    this.snackBar.open(`Opening borrower profile for ${loan.borrowerName}`, 'Close', { duration: 2000 });
  }

  exportLoans(): void {
    this.snackBar.open('Generating loans report...', 'Close', { duration: 3000 });
    // In production, call API to generate and download report
  }
}
