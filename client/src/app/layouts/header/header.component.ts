import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <header class="mm-header">
      <div class="container">
        <div class="mm-header__content">
          <a routerLink="/" class="mm-header__logo">
            <span class="mm-header__logo-text">MoneyMarket</span>
          </a>

          <nav class="mm-header__nav" *ngIf="!authService.isAuthenticated()">
            <a routerLink="/how-it-works" routerLinkActive="active">How it works</a>
            <a routerLink="/borrow" routerLinkActive="active">Borrow</a>
            <a routerLink="/invest" routerLinkActive="active">Invest</a>
          </nav>

          <nav class="mm-header__nav" *ngIf="authService.isAuthenticated()">
            <ng-container *ngIf="authService.isBorrower()">
              <a routerLink="/borrower/dashboard" routerLinkActive="active">Dashboard</a>
              <a routerLink="/borrower/applications" routerLinkActive="active">My Applications</a>
              <a routerLink="/borrower/loans" routerLinkActive="active">My Loans</a>
            </ng-container>

            <ng-container *ngIf="authService.isLender()">
              <a routerLink="/lender/dashboard" routerLinkActive="active">Dashboard</a>
              <a routerLink="/lender/marketplace" routerLinkActive="active">Marketplace</a>
              <a routerLink="/lender/investments" routerLinkActive="active">My Investments</a>
            </ng-container>

            <ng-container *ngIf="authService.isAdmin() || authService.isCRM()">
              <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
              <a routerLink="/admin/applications" routerLinkActive="active">Applications</a>
              <a routerLink="/admin/users" routerLinkActive="active">Users</a>
            </ng-container>
          </nav>

          <div class="mm-header__actions">
            <ng-container *ngIf="!authService.isAuthenticated()">
              <a routerLink="/login" mat-button class="mm-btn-outline">Log in</a>
              <a routerLink="/register" mat-raised-button class="mm-btn-primary">Get started</a>
            </ng-container>

            <ng-container *ngIf="authService.isAuthenticated()">
              <a routerLink="/wallet" mat-button class="mm-header__wallet">
                <mat-icon>account_balance_wallet</mat-icon>
                Wallet
              </a>

              <button mat-icon-button [matMenuTriggerFor]="userMenu" class="mm-header__avatar">
                <mat-icon>person</mat-icon>
              </button>

              <mat-menu #userMenu="matMenu" xPosition="before">
                <div class="mm-header__user-info">
                  <strong>{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</strong>
                  <small>{{ authService.currentUser()?.email }}</small>
                </div>
                <mat-divider></mat-divider>
                <a mat-menu-item routerLink="/profile">
                  <mat-icon>person</mat-icon>
                  <span>Profile</span>
                </a>
                <a mat-menu-item routerLink="/settings">
                  <mat-icon>settings</mat-icon>
                  <span>Settings</span>
                </a>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  <span>Log out</span>
                </button>
              </mat-menu>
            </ng-container>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .mm-header {
      background: var(--mm-white);
      box-shadow: var(--mm-shadow-sm);
      position: sticky;
      top: 0;
      z-index: 1000;

      &__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64px;
        gap: var(--mm-spacing-lg);
      }

      &__logo {
        display: flex;
        align-items: center;
        text-decoration: none;
      }

      &__logo-text {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--mm-primary);
      }

      &__nav {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-lg);
        flex: 1;
        justify-content: center;

        a {
          color: var(--mm-gray-600);
          text-decoration: none;
          font-weight: 500;
          padding: var(--mm-spacing-sm) 0;
          border-bottom: 2px solid transparent;
          transition: all var(--mm-transition-fast);

          &:hover,
          &.active {
            color: var(--mm-primary);
            border-bottom-color: var(--mm-primary);
          }
        }
      }

      &__actions {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-sm);
      }

      &__wallet {
        color: var(--mm-gray-600);

        mat-icon {
          margin-right: var(--mm-spacing-xs);
        }
      }

      &__avatar {
        background: var(--mm-light-blue);
        color: var(--mm-primary);
      }

      &__user-info {
        padding: var(--mm-spacing-md);
        display: flex;
        flex-direction: column;

        strong {
          color: var(--mm-gray-900);
        }

        small {
          color: var(--mm-gray-600);
          font-size: 0.75rem;
        }
      }
    }

    @media (max-width: 768px) {
      .mm-header {
        &__nav {
          display: none;
        }

        &__content {
          gap: var(--mm-spacing-sm);
        }
      }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
