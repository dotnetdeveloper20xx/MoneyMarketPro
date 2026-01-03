import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="mm-auth-page">
      <div class="mm-auth-container">
        <div class="mm-auth-card">
          <div class="mm-auth-header">
            <a routerLink="/" class="mm-auth-logo">MoneyMarket</a>
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mm-auth-form">
            <mat-form-field appearance="outline" class="mm-form-field">
              <mat-label>Email address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="you@example.com">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="mm-form-field">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="mm-auth-forgot">
              <a routerLink="/forgot-password">Forgot password?</a>
            </div>

            <div *ngIf="error" class="mm-auth-error">
              <mat-icon>error</mat-icon>
              {{ error }}
            </div>

            <button
              mat-raised-button
              type="submit"
              class="mm-btn-primary mm-auth-submit"
              [disabled]="loginForm.invalid || isLoading"
            >
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              <span *ngIf="!isLoading">Sign in</span>
            </button>
          </form>

          <div class="mm-auth-footer">
            <p>Don't have an account? <a routerLink="/register">Sign up</a></p>
          </div>
        </div>

        <div class="mm-auth-features">
          <h2>Manage your finances with confidence</h2>
          <ul>
            <li>
              <mat-icon>check_circle</mat-icon>
              Track your loans and investments
            </li>
            <li>
              <mat-icon>check_circle</mat-icon>
              Secure and encrypted platform
            </li>
            <li>
              <mat-icon>check_circle</mat-icon>
              24/7 customer support
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mm-auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--mm-light-blue) 0%, var(--mm-gray-100) 100%);
      padding: var(--mm-spacing-lg);
    }

    .mm-auth-container {
      display: flex;
      max-width: 900px;
      width: 100%;
      background: var(--mm-white);
      border-radius: var(--mm-radius-lg);
      box-shadow: var(--mm-shadow-lg);
      overflow: hidden;
    }

    .mm-auth-card {
      flex: 1;
      padding: var(--mm-spacing-xxl);
    }

    .mm-auth-header {
      text-align: center;
      margin-bottom: var(--mm-spacing-xl);
    }

    .mm-auth-logo {
      display: inline-block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--mm-primary);
      text-decoration: none;
      margin-bottom: var(--mm-spacing-lg);
    }

    .mm-auth-header h1 {
      font-size: 1.75rem;
      margin-bottom: var(--mm-spacing-sm);
    }

    .mm-auth-header p {
      color: var(--mm-gray-600);
      margin: 0;
    }

    .mm-auth-form {
      .mm-form-field {
        width: 100%;
      }
    }

    .mm-auth-forgot {
      text-align: right;
      margin-bottom: var(--mm-spacing-md);

      a {
        font-size: 0.875rem;
      }
    }

    .mm-auth-error {
      display: flex;
      align-items: center;
      gap: var(--mm-spacing-sm);
      padding: var(--mm-spacing-md);
      background: #FFEBEE;
      color: var(--mm-error);
      border-radius: var(--mm-radius-sm);
      margin-bottom: var(--mm-spacing-md);
      font-size: 0.875rem;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .mm-auth-submit {
      width: 100%;
      padding: 12px !important;
      font-size: 1rem;

      mat-spinner {
        display: inline-block;
      }
    }

    .mm-auth-footer {
      text-align: center;
      margin-top: var(--mm-spacing-xl);
      padding-top: var(--mm-spacing-lg);
      border-top: 1px solid var(--mm-gray-200);

      p {
        margin: 0;
        color: var(--mm-gray-600);
      }
    }

    .mm-auth-features {
      flex: 1;
      background: var(--mm-primary);
      color: var(--mm-white);
      padding: var(--mm-spacing-xxl);
      display: flex;
      flex-direction: column;
      justify-content: center;

      h2 {
        color: var(--mm-white);
        font-size: 1.75rem;
        margin-bottom: var(--mm-spacing-xl);
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-md);
        margin-bottom: var(--mm-spacing-md);
        font-size: 1rem;

        mat-icon {
          color: #7CB9E8;
        }
      }
    }

    @media (max-width: 768px) {
      .mm-auth-container {
        flex-direction: column;
      }

      .mm-auth-features {
        display: none;
      }

      .mm-auth-card {
        padding: var(--mm-spacing-lg);
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  error = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.getDefaultRoute();
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Invalid email or password. Please try again.';
      }
    });
  }

  private getDefaultRoute(): string {
    const roles = this.authService.userRoles();
    if (roles.includes('Admin') || roles.includes('CRM')) {
      return '/admin/dashboard';
    } else if (roles.includes('Lender')) {
      return '/lender/dashboard';
    }
    return '/borrower/dashboard';
  }
}
