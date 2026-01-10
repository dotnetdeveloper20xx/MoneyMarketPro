import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApiService } from '../../../core/services/api.service';
import { MarketplaceLoan } from '../../../core/models';

@Component({
  selector: 'app-marketplace',
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
    MatSelectModule,
    MatSliderModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatExpansionModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <h1 class="mm-page-header__title">Loan Marketplace</h1>
          <p class="mm-page-header__subtitle">
            Browse and invest in peer-to-peer loans
          </p>
        </div>

        <div class="mm-marketplace-layout">
          <!-- Filters Sidebar -->
          <aside class="mm-filters">
            <div class="mm-filters__header">
              <h3>Filters</h3>
              <button mat-button (click)="resetFilters()" *ngIf="hasActiveFilters()">
                Clear all
              </button>
            </div>

            <form [formGroup]="filterForm" class="mm-filter-form">
              <!-- Amount Range -->
              <div class="mm-filter-group">
                <label>Loan Amount</label>
                <div class="mm-range-inputs">
                  <mat-form-field appearance="outline">
                    <mat-label>Min</mat-label>
                    <span matPrefix>£</span>
                    <input matInput type="number" formControlName="minAmount" min="0">
                  </mat-form-field>
                  <span class="mm-range-separator">-</span>
                  <mat-form-field appearance="outline">
                    <mat-label>Max</mat-label>
                    <span matPrefix>£</span>
                    <input matInput type="number" formControlName="maxAmount" min="0">
                  </mat-form-field>
                </div>
              </div>

              <!-- Interest Rate Range -->
              <div class="mm-filter-group">
                <label>Interest Rate (APR)</label>
                <div class="mm-range-inputs">
                  <mat-form-field appearance="outline">
                    <mat-label>Min</mat-label>
                    <input matInput type="number" formControlName="minRate" min="0" max="30">
                    <span matSuffix>%</span>
                  </mat-form-field>
                  <span class="mm-range-separator">-</span>
                  <mat-form-field appearance="outline">
                    <mat-label>Max</mat-label>
                    <input matInput type="number" formControlName="maxRate" min="0" max="30">
                    <span matSuffix>%</span>
                  </mat-form-field>
                </div>
              </div>

              <!-- Risk Grade -->
              <div class="mm-filter-group">
                <label>Risk Grade</label>
                <div class="mm-grade-chips">
                  <button type="button" mat-stroked-button
                          *ngFor="let grade of riskGrades"
                          (click)="toggleGrade(grade)"
                          [class.selected]="selectedGrades().includes(grade)"
                          [ngClass]="'grade-' + grade.toLowerCase()">
                    {{ grade }}
                  </button>
                </div>
              </div>

              <!-- Loan Term -->
              <div class="mm-filter-group">
                <label>Loan Term</label>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Select term</mat-label>
                  <mat-select formControlName="term" multiple>
                    <mat-option [value]="12">12 months</mat-option>
                    <mat-option [value]="24">24 months</mat-option>
                    <mat-option [value]="36">36 months</mat-option>
                    <mat-option [value]="48">48 months</mat-option>
                    <mat-option [value]="60">60 months</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <button mat-raised-button class="mm-btn-primary full-width"
                      (click)="applyFilters()">
                Apply Filters
              </button>
            </form>
          </aside>

          <!-- Loans Grid -->
          <main class="mm-loans-section">
            <!-- Sort & View Controls -->
            <div class="mm-loans-toolbar">
              <div class="mm-loans-count">
                <strong>{{ filteredLoans().length }}</strong> loans available
              </div>
              <div class="mm-loans-sort">
                <mat-form-field appearance="outline">
                  <mat-label>Sort by</mat-label>
                  <mat-select [(value)]="sortBy" (selectionChange)="sortLoans()">
                    <mat-option value="rate-desc">Highest Rate</mat-option>
                    <mat-option value="rate-asc">Lowest Rate</mat-option>
                    <mat-option value="amount-desc">Highest Amount</mat-option>
                    <mat-option value="amount-asc">Lowest Amount</mat-option>
                    <mat-option value="funding">Near Funding</mat-option>
                    <mat-option value="newest">Newest</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Loading State -->
            <div class="mm-loading" *ngIf="isLoading()">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading loans...</p>
            </div>

            <!-- Empty State -->
            <div class="mm-empty-state" *ngIf="!isLoading() && filteredLoans().length === 0">
              <mat-icon>search_off</mat-icon>
              <h3>No loans match your criteria</h3>
              <p>Try adjusting your filters to see more opportunities.</p>
              <button mat-raised-button class="mm-btn-primary" (click)="resetFilters()">
                Clear Filters
              </button>
            </div>

            <!-- Loans Grid -->
            <div class="mm-loans-grid" *ngIf="!isLoading() && filteredLoans().length > 0">
              <div class="mm-loan-card" *ngFor="let loan of filteredLoans()">
                <div class="mm-loan-card__header">
                  <span class="mm-grade-badge" [ngClass]="'grade-' + loan.riskGrade.toLowerCase()">
                    {{ loan.riskGrade }}
                  </span>
                  <span class="mm-loan-card__rate">{{ loan.interestRate }}% APR</span>
                </div>

                <div class="mm-loan-card__amount">{{ loan.amount | currency:'GBP' }}</div>
                <div class="mm-loan-card__purpose">{{ loan.purpose }}</div>

                <div class="mm-loan-card__meta">
                  <div class="mm-loan-card__meta-item">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ loan.termMonths }} months</span>
                  </div>
                  <div class="mm-loan-card__meta-item">
                    <mat-icon>verified_user</mat-icon>
                    <span>Score: {{ loan.borrowerCreditScore }}</span>
                  </div>
                </div>

                <div class="mm-loan-card__funding">
                  <div class="mm-loan-card__funding-header">
                    <span>{{ loan.fundingProgress }}% funded</span>
                    <span class="mm-loan-card__days-left">
                      <mat-icon>timer</mat-icon>
                      {{ loan.daysRemaining }} days left
                    </span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="loan.fundingProgress">
                  </mat-progress-bar>
                  <div class="mm-loan-card__funding-amounts">
                    <span>{{ loan.fundedAmount | currency:'GBP' }}</span>
                    <span>{{ loan.amount | currency:'GBP' }}</span>
                  </div>
                </div>

                <div class="mm-loan-card__returns">
                  <div>
                    <span class="label">Est. Monthly Return</span>
                    <span class="value">{{ calculateMonthlyReturn(loan) | currency:'GBP' }}</span>
                  </div>
                  <div>
                    <span class="label">Total Return</span>
                    <span class="value text-success">{{ calculateTotalReturn(loan) | currency:'GBP' }}</span>
                  </div>
                </div>

                <a [routerLink]="['/lender/marketplace', loan.id]"
                   mat-raised-button class="mm-btn-primary full-width">
                  View & Invest
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mm-marketplace-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--mm-spacing-xl);

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-filters {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);
      height: fit-content;
      position: sticky;
      top: var(--mm-spacing-lg);

      @media (max-width: 1024px) {
        position: static;
      }

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--mm-spacing-lg);
        padding-bottom: var(--mm-spacing-md);
        border-bottom: 1px solid var(--mm-gray-200);

        h3 {
          margin: 0;
        }
      }
    }

    .mm-filter-group {
      margin-bottom: var(--mm-spacing-lg);

      > label {
        display: block;
        font-weight: 500;
        margin-bottom: var(--mm-spacing-sm);
        color: var(--mm-gray-700);
      }
    }

    .mm-range-inputs {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-sm);

      mat-form-field {
        flex: 1;
      }
    }

    .mm-range-separator {
      color: var(--mm-gray-400);
    }

    .mm-grade-chips {
      display: flex;
      gap: var(--mm-spacing-xs);
      flex-wrap: wrap;

      button {
        min-width: 44px;
        padding: 0 var(--mm-spacing-sm);

        &.selected {
          color: white;
        }

        &.grade-a { &.selected { background: #2E7D32; border-color: #2E7D32; } }
        &.grade-b { &.selected { background: #388E3C; border-color: #388E3C; } }
        &.grade-c { &.selected { background: #F9A825; border-color: #F9A825; } }
        &.grade-d { &.selected { background: #EF6C00; border-color: #EF6C00; } }
        &.grade-e { &.selected { background: #D32F2F; border-color: #D32F2F; } }
      }
    }

    .mm-loans-section {
      min-width: 0;
    }

    .mm-loans-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--mm-spacing-lg);

      @media (max-width: 600px) {
        flex-direction: column;
        gap: var(--mm-spacing-md);
        align-items: stretch;
      }
    }

    .mm-loans-count {
      color: var(--mm-gray-600);
    }

    .mm-loans-sort {
      mat-form-field {
        width: 180px;
      }
    }

    .mm-loading, .mm-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--mm-spacing-xxl);
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
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
        margin-bottom: var(--mm-spacing-lg);
      }
    }

    .mm-loans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--mm-spacing-lg);
    }

    .mm-loan-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      box-shadow: var(--mm-shadow-sm);
      transition: all var(--mm-transition-fast);

      &:hover {
        box-shadow: var(--mm-shadow-md);
        transform: translateY(-2px);
      }

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--mm-spacing-md);
      }

      &__rate {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--mm-success);
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

      &__meta {
        display: flex;
        gap: var(--mm-spacing-lg);
        margin-bottom: var(--mm-spacing-md);
      }

      &__meta-item {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-xs);
        font-size: 0.875rem;
        color: var(--mm-gray-600);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      &__funding {
        margin-bottom: var(--mm-spacing-md);
        padding: var(--mm-spacing-md);
        background: var(--mm-gray-100);
        border-radius: var(--mm-radius-sm);
      }

      &__funding-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        margin-bottom: var(--mm-spacing-xs);
      }

      &__days-left {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-xs);
        color: var(--mm-gray-600);

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }

      &__funding-amounts {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--mm-gray-600);
        margin-top: var(--mm-spacing-xs);
      }

      &__returns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--mm-spacing-md);
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
    }

    .mm-grade-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-weight: 700;
      color: white;

      &.grade-a { background: #2E7D32; }
      &.grade-b { background: #388E3C; }
      &.grade-c { background: #F9A825; color: #000; }
      &.grade-d { background: #EF6C00; }
      &.grade-e { background: #D32F2F; }
    }

    .full-width {
      width: 100%;
    }

    .text-success {
      color: var(--mm-success) !important;
    }
  `]
})
export class MarketplaceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);

  isLoading = signal(true);
  loans = signal<MarketplaceLoan[]>([]);
  filteredLoans = signal<MarketplaceLoan[]>([]);
  selectedGrades = signal<string[]>([]);

  riskGrades = ['A', 'B', 'C', 'D', 'E'];
  sortBy = 'rate-desc';

  filterForm: FormGroup = this.fb.group({
    minAmount: [null],
    maxAmount: [null],
    minRate: [null],
    maxRate: [null],
    term: [[]]
  });

  ngOnInit(): void {
    this.loadLoans();
  }

  private loadLoans(): void {
    this.apiService.getMarketplaceLoans().subscribe({
      next: (loans) => {
        this.loans.set(loans);
        this.filteredLoans.set(loans);
        this.sortLoans();
        this.isLoading.set(false);
      },
      error: () => {
        this.loans.set([]);
        this.filteredLoans.set([]);
        this.isLoading.set(false);
      }
    });
  }

  toggleGrade(grade: string): void {
    const current = this.selectedGrades();
    if (current.includes(grade)) {
      this.selectedGrades.set(current.filter(g => g !== grade));
    } else {
      this.selectedGrades.set([...current, grade]);
    }
  }

  hasActiveFilters(): boolean {
    const form = this.filterForm.value;
    return !!(
      form.minAmount ||
      form.maxAmount ||
      form.minRate ||
      form.maxRate ||
      (form.term && form.term.length > 0) ||
      this.selectedGrades().length > 0
    );
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.selectedGrades.set([]);
    this.filteredLoans.set(this.loans());
    this.sortLoans();
  }

  applyFilters(): void {
    const form = this.filterForm.value;
    const grades = this.selectedGrades();

    let filtered = this.loans().filter(loan => {
      // Amount filter
      if (form.minAmount && loan.amount < form.minAmount) return false;
      if (form.maxAmount && loan.amount > form.maxAmount) return false;

      // Rate filter
      if (form.minRate && loan.interestRate < form.minRate) return false;
      if (form.maxRate && loan.interestRate > form.maxRate) return false;

      // Grade filter
      if (grades.length > 0 && !grades.includes(loan.riskGrade)) return false;

      // Term filter
      if (form.term && form.term.length > 0 && !form.term.includes(loan.termMonths)) return false;

      return true;
    });

    this.filteredLoans.set(filtered);
    this.sortLoans();
  }

  sortLoans(): void {
    const sorted = [...this.filteredLoans()];

    switch (this.sortBy) {
      case 'rate-desc':
        sorted.sort((a, b) => b.interestRate - a.interestRate);
        break;
      case 'rate-asc':
        sorted.sort((a, b) => a.interestRate - b.interestRate);
        break;
      case 'amount-desc':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      case 'funding':
        sorted.sort((a, b) => b.fundingProgress - a.fundingProgress);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    this.filteredLoans.set(sorted);
  }

  calculateMonthlyReturn(loan: MarketplaceLoan): number {
    // Simplified calculation - in reality would be more complex
    const monthlyRate = loan.interestRate / 100 / 12;
    const remainingToFund = loan.amount - loan.fundedAmount;
    return (remainingToFund * monthlyRate);
  }

  calculateTotalReturn(loan: MarketplaceLoan): number {
    const remainingToFund = loan.amount - loan.fundedAmount;
    const totalInterest = remainingToFund * (loan.interestRate / 100) * (loan.termMonths / 12);
    return totalInterest;
  }
}
