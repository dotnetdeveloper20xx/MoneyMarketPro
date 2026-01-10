import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatDividerModule
  ],
  template: `
    <div class="mm-page">
      <div class="container">
        <div class="mm-page-header">
          <h1 class="mm-page-header__title">User Management</h1>
          <p class="mm-page-header__subtitle">
            View and manage platform users
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="mm-stats-row">
          <div class="mm-stat-card">
            <mat-icon>people</mat-icon>
            <div class="mm-stat-card__content">
              <span class="value">{{ users().length }}</span>
              <span class="label">Total Users</span>
            </div>
          </div>
          <div class="mm-stat-card">
            <mat-icon>person_outline</mat-icon>
            <div class="mm-stat-card__content">
              <span class="value">{{ getUsersByRole('Borrower') }}</span>
              <span class="label">Borrowers</span>
            </div>
          </div>
          <div class="mm-stat-card">
            <mat-icon>account_balance</mat-icon>
            <div class="mm-stat-card__content">
              <span class="value">{{ getUsersByRole('Lender') }}</span>
              <span class="label">Lenders</span>
            </div>
          </div>
          <div class="mm-stat-card">
            <mat-icon>admin_panel_settings</mat-icon>
            <div class="mm-stat-card__content">
              <span class="value">{{ getUsersByRole('Admin') + getUsersByRole('CRM') }}</span>
              <span class="label">Staff</span>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="mm-filters-bar">
          <form [formGroup]="filterForm" class="mm-filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput formControlName="search" placeholder="Search by name or email">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option value="">All Roles</mat-option>
                <mat-option value="Borrower">Borrower</mat-option>
                <mat-option value="Lender">Lender</mat-option>
                <mat-option value="CRM">CRM</mat-option>
                <mat-option value="Admin">Admin</mat-option>
                <mat-option value="Support">Support</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="">All</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
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
          <p>Loading users...</p>
        </div>

        <!-- Users Table -->
        <div class="mm-table-container" *ngIf="!isLoading()">
          <table mat-table [dataSource]="paginatedUsers()">
            <!-- Avatar Column -->
            <ng-container matColumnDef="avatar">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let user">
                <div class="mm-avatar">
                  {{ user.firstName[0] }}{{ user.lastName[0] }}
                </div>
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let user">
                <div class="mm-user-name">
                  <span class="name">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="email">{{ user.email }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Roles Column -->
            <ng-container matColumnDef="roles">
              <th mat-header-cell *matHeaderCellDef>Roles</th>
              <td mat-cell *matCellDef="let user">
                <div class="mm-roles">
                  <span class="mm-role-chip" *ngFor="let role of user.roles"
                        [ngClass]="getRoleClass(role)">
                    {{ role }}
                  </span>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <span class="mm-status" [ngClass]="user.isActive ? 'active' : 'inactive'">
                  <span class="mm-status__dot"></span>
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>

            <!-- Joined Column -->
            <ng-container matColumnDef="joined">
              <th mat-header-cell *matHeaderCellDef>Joined</th>
              <td mat-cell *matCellDef="let user">
                {{ user.createdAt | date:'mediumDate' }}
              </td>
            </ng-container>

            <!-- Last Login Column -->
            <ng-container matColumnDef="lastLogin">
              <th mat-header-cell *matHeaderCellDef>Last Login</th>
              <td mat-cell *matCellDef="let user">
                <span *ngIf="user.lastLoginAt">{{ user.lastLoginAt | date:'short' }}</span>
                <span *ngIf="!user.lastLoginAt" class="text-muted">Never</span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="Actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item (click)="viewUser(user)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="editUser(user)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit User</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="toggleUserStatus(user)">
                    <mat-icon>{{ user.isActive ? 'block' : 'check_circle' }}</mat-icon>
                    <span>{{ user.isActive ? 'Deactivate' : 'Activate' }}</span>
                  </button>
                  <button mat-menu-item (click)="resetPassword(user)">
                    <mat-icon>lock_reset</mat-icon>
                    <span>Reset Password</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="filteredUsers().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)">
          </mat-paginator>
        </div>

        <!-- Empty State -->
        <div class="mm-card" *ngIf="!isLoading() && filteredUsers().length === 0">
          <div class="mm-empty-state">
            <mat-icon>person_off</mat-icon>
            <h3>No users found</h3>
            <p>No users match your search criteria.</p>
          </div>
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

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--mm-primary);
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

    .mm-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--mm-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .mm-user-name {
      .name {
        display: block;
        font-weight: 500;
      }

      .email {
        font-size: 0.875rem;
        color: var(--mm-gray-600);
      }
    }

    .mm-roles {
      display: flex;
      gap: var(--mm-spacing-xs);
      flex-wrap: wrap;
    }

    .mm-role-chip {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;

      &.borrower {
        background: rgba(0, 102, 179, 0.15);
        color: var(--mm-secondary);
      }

      &.lender {
        background: rgba(46, 125, 50, 0.15);
        color: var(--mm-success);
      }

      &.admin {
        background: rgba(156, 39, 176, 0.15);
        color: #9C27B0;
      }

      &.crm {
        background: rgba(249, 168, 37, 0.15);
        color: #F57C00;
      }

      &.support {
        background: var(--mm-gray-200);
        color: var(--mm-gray-700);
      }
    }

    .mm-status {
      display: inline-flex;
      align-items: center;
      gap: var(--mm-spacing-xs);
      font-size: 0.875rem;

      &__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.active {
        color: var(--mm-success);

        .mm-status__dot {
          background: var(--mm-success);
        }
      }

      &.inactive {
        color: var(--mm-gray-600);

        .mm-status__dot {
          background: var(--mm-gray-400);
        }
      }
    }

    .text-muted {
      color: var(--mm-gray-500);
    }

    ::ng-deep .mat-mdc-row:hover {
      background: var(--mm-gray-100) !important;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  private fb = inject(FormBuilder);

  isLoading = signal(true);
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);

  displayedColumns = ['avatar', 'name', 'roles', 'status', 'joined', 'lastLogin', 'actions'];

  pageSize = 10;
  currentPage = 0;

  filterForm: FormGroup = this.fb.group({
    search: [''],
    role: [''],
    status: ['']
  });

  ngOnInit(): void {
    this.loadUsers();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private loadUsers(): void {
    // Mock data - in real app would come from API
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['Borrower'],
        isActive: true,
        createdAt: '2025-12-01T10:00:00Z',
        lastLoginAt: '2026-01-10T08:30:00Z'
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        roles: ['Lender'],
        isActive: true,
        createdAt: '2025-11-15T14:00:00Z',
        lastLoginAt: '2026-01-09T16:45:00Z'
      },
      {
        id: '3',
        email: 'admin@moneymarket.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['Admin', 'CRM'],
        isActive: true,
        createdAt: '2025-10-01T09:00:00Z',
        lastLoginAt: '2026-01-10T09:00:00Z'
      },
      {
        id: '4',
        email: 'bob.wilson@example.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        roles: ['Borrower', 'Lender'],
        isActive: true,
        createdAt: '2025-12-20T11:00:00Z',
        lastLoginAt: '2026-01-08T12:00:00Z'
      },
      {
        id: '5',
        email: 'sarah.jones@example.com',
        firstName: 'Sarah',
        lastName: 'Jones',
        roles: ['CRM'],
        isActive: true,
        createdAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2026-01-10T07:00:00Z'
      },
      {
        id: '6',
        email: 'inactive@example.com',
        firstName: 'Inactive',
        lastName: 'User',
        roles: ['Borrower'],
        isActive: false,
        createdAt: '2025-09-01T10:00:00Z',
        lastLoginAt: null
      }
    ];

    setTimeout(() => {
      this.users.set(mockUsers);
      this.filteredUsers.set(mockUsers);
      this.isLoading.set(false);
    }, 500);
  }

  applyFilters(): void {
    const { search, role, status } = this.filterForm.value;

    let filtered = this.users().filter(user => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!user.firstName.toLowerCase().includes(searchLower) &&
            !user.lastName.toLowerCase().includes(searchLower) &&
            !user.email.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Role filter
      if (role && !user.roles.includes(role)) {
        return false;
      }

      // Status filter
      if (status === 'active' && !user.isActive) return false;
      if (status === 'inactive' && user.isActive) return false;

      return true;
    });

    this.filteredUsers.set(filtered);
    this.currentPage = 0;
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      role: '',
      status: ''
    });
  }

  paginatedUsers(): User[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getUsersByRole(role: string): number {
    return this.users().filter(u => u.roles.includes(role)).length;
  }

  getRoleClass(role: string): string {
    return role.toLowerCase();
  }

  viewUser(user: User): void {
    console.log('View user:', user);
  }

  editUser(user: User): void {
    console.log('Edit user:', user);
  }

  toggleUserStatus(user: User): void {
    console.log('Toggle status:', user);
  }

  resetPassword(user: User): void {
    console.log('Reset password:', user);
  }
}
