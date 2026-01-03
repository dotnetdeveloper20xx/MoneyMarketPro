import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatCheckboxModule
  ],
  template: `
    <div class="mm-auth-page">
      <div class="mm-auth-container">
        <div class="mm-auth-card">
          <div class="mm-auth-header">
            <a routerLink="/" class="mm-auth-logo">MoneyMarket</a>
            <h1>Create your account</h1>
            <p>Join thousands of users on our platform</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mm-auth-form">
            <!-- Account Type Selection -->
            <div class="mm-account-type">
              <p class="mm-account-type__label">I want to:</p>
              <mat-button-toggle-group formControlName="role" class="mm-account-type__toggle">
                <mat-button-toggle value="Borrower">
                  <mat-icon>account_balance</mat-icon>
                  Borrow money
                </mat-button-toggle>
                <mat-button-toggle value="Lender">
                  <mat-icon>trending_up</mat-icon>
                  Invest & lend
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>

            <div class="mm-form-row">
              <mat-form-field appearance="outline" class="mm-form-field">
                <mat-label>First name</mat-label>
                <input matInput formControlName="firstName" placeholder="John">
                <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="mm-form-field">
                <mat-label>Last name</mat-label>
                <input matInput formControlName="lastName" placeholder="Doe">
                <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="mm-form-field">
              <mat-label>Email address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="you@example.com">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
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
              <mat-hint>At least 8 characters with a mix of letters and numbers</mat-hint>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password must be at least 8 characters
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                Password must include letters and numbers
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="mm-form-field">
              <mat-label>Confirm password</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hideConfirmPassword = !hideConfirmPassword">
                <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <div class="mm-terms">
              <mat-checkbox formControlName="acceptTerms">
                I agree to the <a routerLink="/terms" target="_blank">Terms of Service</a>
                and <a routerLink="/privacy" target="_blank">Privacy Policy</a>
              </mat-checkbox>
              <mat-error *ngIf="registerForm.get('acceptTerms')?.touched && registerForm.get('acceptTerms')?.hasError('requiredTrue')">
                You must accept the terms to continue
              </mat-error>
            </div>

            <div *ngIf="error" class="mm-auth-error">
              <mat-icon>error</mat-icon>
              {{ error }}
            </div>

            <button
              mat-raised-button
              type="submit"
              class="mm-btn-primary mm-auth-submit"
              [disabled]="registerForm.invalid || isLoading"
            >
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              <span *ngIf="!isLoading">Create account</span>
            </button>
          </form>

          <div class="mm-auth-footer">
            <p>Already have an account? <a routerLink="/login">Sign in</a></p>
          </div>
        </div>

        <div class="mm-auth-features">
          <h2>Start your journey today</h2>
          <ul>
            <li>
              <mat-icon>check_circle</mat-icon>
              Free to join, no hidden fees
            </li>
            <li>
              <mat-icon>check_circle</mat-icon>
              Quick and easy application
            </li>
            <li>
              <mat-icon>check_circle</mat-icon>
              Competitive rates from 4.8% APR
            </li>
            <li>
              <mat-icon>check_circle</mat-icon>
              Earn up to 8% returns as a lender
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
      max-width: 1000px;
      width: 100%;
      background: var(--mm-white);
      border-radius: var(--mm-radius-lg);
      box-shadow: var(--mm-shadow-lg);
      overflow: hidden;
    }

    .mm-auth-card {
      flex: 1.2;
      padding: var(--mm-spacing-xl);
    }

    .mm-auth-header {
      text-align: center;
      margin-bottom: var(--mm-spacing-lg);
    }

    .mm-auth-logo {
      display: inline-block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--mm-primary);
      text-decoration: none;
      margin-bottom: var(--mm-spacing-md);
    }

    .mm-auth-header h1 {
      font-size: 1.75rem;
      margin-bottom: var(--mm-spacing-xs);
    }

    .mm-auth-header p {
      color: var(--mm-gray-600);
      margin: 0;
    }

    .mm-account-type {
      margin-bottom: var(--mm-spacing-lg);

      &__label {
        font-weight: 500;
        margin-bottom: var(--mm-spacing-sm);
        color: var(--mm-gray-900);
      }

      &__toggle {
        width: 100%;
        display: flex;

        mat-button-toggle {
          flex: 1;

          mat-icon {
            margin-right: var(--mm-spacing-sm);
          }
        }
      }
    }

    .mm-form-row {
      display: flex;
      gap: var(--mm-spacing-md);

      .mm-form-field {
        flex: 1;
      }
    }

    .mm-auth-form {
      .mm-form-field {
        width: 100%;
      }
    }

    .mm-terms {
      margin-bottom: var(--mm-spacing-md);

      a {
        color: var(--mm-secondary);
      }

      mat-error {
        font-size: 0.75rem;
        margin-top: var(--mm-spacing-xs);
        display: block;
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
      margin-top: var(--mm-spacing-lg);
      padding-top: var(--mm-spacing-md);
      border-top: 1px solid var(--mm-gray-200);

      p {
        margin: 0;
        color: var(--mm-gray-600);
      }
    }

    .mm-auth-features {
      flex: 0.8;
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

      .mm-form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  error = '';

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', Validators.required],
      role: ['Borrower', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.error = '';

    const { confirmPassword, acceptTerms, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        const role = this.registerForm.get('role')?.value;
        if (role === 'Lender') {
          this.router.navigate(['/lender/dashboard']);
        } else {
          this.router.navigate(['/borrower/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
