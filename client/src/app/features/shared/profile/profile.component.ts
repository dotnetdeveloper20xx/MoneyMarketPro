import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
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
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule
  ],
  template: `
    <div class="profile-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <h1>My Profile</h1>
          <p class="subtitle">Manage your account information and preferences</p>
        </div>

        <div class="profile-layout">
          <!-- Profile Sidebar -->
          <mat-card class="profile-sidebar">
            <mat-card-content>
              <div class="avatar-section">
                <div class="avatar">
                  <mat-icon>person</mat-icon>
                </div>
                <button mat-stroked-button class="change-photo-btn">
                  <mat-icon>photo_camera</mat-icon>
                  Change Photo
                </button>
              </div>

              <div class="user-info">
                <h2>{{ profileForm.get('firstName')?.value }} {{ profileForm.get('lastName')?.value }}</h2>
                <p class="email">{{ profileForm.get('email')?.value }}</p>
                <div class="roles">
                  @for (role of userRoles(); track role) {
                    <mat-chip>{{ role }}</mat-chip>
                  }
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="account-stats">
                <div class="stat">
                  <span class="stat-label">Member Since</span>
                  <span class="stat-value">{{ memberSince() | date:'mediumDate' }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Last Login</span>
                  <span class="stat-value">{{ lastLogin() | date:'medium' }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Account Status</span>
                  <span class="stat-value status-active">Active</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Profile Content -->
          <div class="profile-content">
            <mat-tab-group animationDuration="200ms">
              <!-- Personal Information Tab -->
              <mat-tab>
                <ng-template mat-tab-label>
                  <mat-icon>person</mat-icon>
                  <span>Personal Info</span>
                </ng-template>

                <mat-card class="form-card">
                  <mat-card-header>
                    <mat-card-title>Personal Information</mat-card-title>
                    <mat-card-subtitle>Update your personal details</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <form [formGroup]="profileForm" class="profile-form">
                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>First Name</mat-label>
                          <input matInput formControlName="firstName" placeholder="Enter your first name">
                          <mat-icon matPrefix>badge</mat-icon>
                          @if (profileForm.get('firstName')?.hasError('required')) {
                            <mat-error>First name is required</mat-error>
                          }
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Last Name</mat-label>
                          <input matInput formControlName="lastName" placeholder="Enter your last name">
                          <mat-icon matPrefix>badge</mat-icon>
                          @if (profileForm.get('lastName')?.hasError('required')) {
                            <mat-error>Last name is required</mat-error>
                          }
                        </mat-form-field>
                      </div>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Email Address</mat-label>
                        <input matInput formControlName="email" type="email" placeholder="Enter your email">
                        <mat-icon matPrefix>email</mat-icon>
                        <mat-hint>This is your login email and cannot be changed</mat-hint>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Phone Number</mat-label>
                        <input matInput formControlName="phone" placeholder="Enter your phone number">
                        <mat-icon matPrefix>phone</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Date of Birth</mat-label>
                        <input matInput formControlName="dateOfBirth" type="date">
                        <mat-icon matPrefix>cake</mat-icon>
                      </mat-form-field>
                    </form>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-stroked-button (click)="resetProfileForm()">Cancel</button>
                    <button mat-flat-button color="primary"
                            [disabled]="!profileForm.dirty || profileForm.invalid || savingProfile()"
                            (click)="saveProfile()">
                      @if (savingProfile()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        Save Changes
                      }
                    </button>
                  </mat-card-actions>
                </mat-card>
              </mat-tab>

              <!-- Address Tab -->
              <mat-tab>
                <ng-template mat-tab-label>
                  <mat-icon>home</mat-icon>
                  <span>Address</span>
                </ng-template>

                <mat-card class="form-card">
                  <mat-card-header>
                    <mat-card-title>Address Information</mat-card-title>
                    <mat-card-subtitle>Your residential address</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <form [formGroup]="addressForm" class="profile-form">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Address Line 1</mat-label>
                        <input matInput formControlName="addressLine1" placeholder="Street address">
                        <mat-icon matPrefix>location_on</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Address Line 2</mat-label>
                        <input matInput formControlName="addressLine2" placeholder="Apartment, suite, etc. (optional)">
                        <mat-icon matPrefix>apartment</mat-icon>
                      </mat-form-field>

                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>City</mat-label>
                          <input matInput formControlName="city" placeholder="City">
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>County</mat-label>
                          <input matInput formControlName="county" placeholder="County">
                        </mat-form-field>
                      </div>

                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Postcode</mat-label>
                          <input matInput formControlName="postcode" placeholder="Postcode">
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Country</mat-label>
                          <mat-select formControlName="country">
                            <mat-option value="GB">United Kingdom</mat-option>
                            <mat-option value="IE">Ireland</mat-option>
                            <mat-option value="US">United States</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </form>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-stroked-button (click)="resetAddressForm()">Cancel</button>
                    <button mat-flat-button color="primary"
                            [disabled]="!addressForm.dirty || addressForm.invalid || savingAddress()"
                            (click)="saveAddress()">
                      @if (savingAddress()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        Save Address
                      }
                    </button>
                  </mat-card-actions>
                </mat-card>
              </mat-tab>

              <!-- Security Tab -->
              <mat-tab>
                <ng-template mat-tab-label>
                  <mat-icon>security</mat-icon>
                  <span>Security</span>
                </ng-template>

                <mat-card class="form-card">
                  <mat-card-header>
                    <mat-card-title>Change Password</mat-card-title>
                    <mat-card-subtitle>Update your account password</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <form [formGroup]="passwordForm" class="profile-form">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Current Password</mat-label>
                        <input matInput formControlName="currentPassword"
                               [type]="hideCurrentPassword() ? 'password' : 'text'">
                        <mat-icon matPrefix>lock</mat-icon>
                        <button mat-icon-button matSuffix type="button"
                                (click)="hideCurrentPassword.set(!hideCurrentPassword())">
                          <mat-icon>{{ hideCurrentPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                        </button>
                        @if (passwordForm.get('currentPassword')?.hasError('required')) {
                          <mat-error>Current password is required</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>New Password</mat-label>
                        <input matInput formControlName="newPassword"
                               [type]="hideNewPassword() ? 'password' : 'text'">
                        <mat-icon matPrefix>lock_outline</mat-icon>
                        <button mat-icon-button matSuffix type="button"
                                (click)="hideNewPassword.set(!hideNewPassword())">
                          <mat-icon>{{ hideNewPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                        </button>
                        <mat-hint>At least 8 characters with numbers and special characters</mat-hint>
                        @if (passwordForm.get('newPassword')?.hasError('required')) {
                          <mat-error>New password is required</mat-error>
                        }
                        @if (passwordForm.get('newPassword')?.hasError('minlength')) {
                          <mat-error>Password must be at least 8 characters</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Confirm New Password</mat-label>
                        <input matInput formControlName="confirmPassword"
                               [type]="hideConfirmPassword() ? 'password' : 'text'">
                        <mat-icon matPrefix>lock_outline</mat-icon>
                        <button mat-icon-button matSuffix type="button"
                                (click)="hideConfirmPassword.set(!hideConfirmPassword())">
                          <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                        </button>
                        @if (passwordForm.get('confirmPassword')?.hasError('required')) {
                          <mat-error>Please confirm your password</mat-error>
                        }
                        @if (passwordForm.hasError('passwordMismatch')) {
                          <mat-error>Passwords do not match</mat-error>
                        }
                      </mat-form-field>
                    </form>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-stroked-button (click)="resetPasswordForm()">Cancel</button>
                    <button mat-flat-button color="primary"
                            [disabled]="passwordForm.invalid || savingPassword()"
                            (click)="changePassword()">
                      @if (savingPassword()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        Change Password
                      }
                    </button>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="form-card security-options">
                  <mat-card-header>
                    <mat-card-title>Two-Factor Authentication</mat-card-title>
                    <mat-card-subtitle>Add an extra layer of security</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="security-option">
                      <div class="option-info">
                        <mat-icon>smartphone</mat-icon>
                        <div>
                          <h4>Authenticator App</h4>
                          <p>Use an authenticator app like Google Authenticator or Authy</p>
                        </div>
                      </div>
                      <button mat-stroked-button color="primary">Enable</button>
                    </div>
                    <mat-divider></mat-divider>
                    <div class="security-option">
                      <div class="option-info">
                        <mat-icon>sms</mat-icon>
                        <div>
                          <h4>SMS Verification</h4>
                          <p>Receive verification codes via text message</p>
                        </div>
                      </div>
                      <button mat-stroked-button color="primary">Enable</button>
                    </div>
                  </mat-card-content>
                </mat-card>
              </mat-tab>

              <!-- Verification Tab -->
              <mat-tab>
                <ng-template mat-tab-label>
                  <mat-icon>verified_user</mat-icon>
                  <span>Verification</span>
                </ng-template>

                <mat-card class="form-card">
                  <mat-card-header>
                    <mat-card-title>Identity Verification</mat-card-title>
                    <mat-card-subtitle>Verify your identity to unlock all features</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="verification-status">
                      <div class="status-badge verified">
                        <mat-icon>check_circle</mat-icon>
                        <span>Email Verified</span>
                      </div>
                      <div class="status-badge pending">
                        <mat-icon>schedule</mat-icon>
                        <span>ID Verification Pending</span>
                      </div>
                      <div class="status-badge unverified">
                        <mat-icon>error_outline</mat-icon>
                        <span>Address Not Verified</span>
                      </div>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="verification-section">
                      <h4>Required Documents</h4>
                      <div class="document-upload">
                        <div class="document-item">
                          <mat-icon>credit_card</mat-icon>
                          <div class="document-info">
                            <span class="doc-title">Government ID</span>
                            <span class="doc-desc">Passport, Driver's License, or National ID</span>
                          </div>
                          <button mat-stroked-button>Upload</button>
                        </div>
                        <div class="document-item">
                          <mat-icon>receipt_long</mat-icon>
                          <div class="document-info">
                            <span class="doc-title">Proof of Address</span>
                            <span class="doc-desc">Utility bill or bank statement (last 3 months)</span>
                          </div>
                          <button mat-stroked-button>Upload</button>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: 24px;
      background: #f5f7fa;
      min-height: calc(100vh - 200px);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      color: var(--primary-navy);
      font-size: 28px;
    }

    .subtitle {
      margin: 0;
      color: var(--text-muted);
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
    }

    .profile-sidebar {
      border-radius: 12px;
      height: fit-content;
      position: sticky;
      top: 24px;
    }

    .profile-sidebar mat-card-content {
      padding: 24px !important;
    }

    .avatar-section {
      text-align: center;
      margin-bottom: 20px;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-navy), var(--primary-light));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .avatar mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .change-photo-btn {
      font-size: 12px;
    }

    .user-info {
      text-align: center;
      margin-bottom: 20px;
    }

    .user-info h2 {
      margin: 0 0 4px 0;
      color: var(--primary-navy);
      font-size: 20px;
    }

    .email {
      color: var(--text-muted);
      margin: 0 0 12px 0;
      font-size: 14px;
    }

    .roles {
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .roles mat-chip {
      background: var(--primary-navy) !important;
      color: white !important;
      font-size: 11px;
    }

    mat-divider {
      margin: 20px 0;
    }

    .account-stats {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }

    .stat-label {
      color: var(--text-muted);
    }

    .stat-value {
      color: var(--primary-navy);
      font-weight: 500;
    }

    .status-active {
      color: #27ae60;
    }

    .profile-content {
      min-width: 0;
    }

    mat-tab-group {
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }

    ::ng-deep .mat-mdc-tab-labels {
      background: #f8f9fa;
    }

    ::ng-deep .mat-mdc-tab {
      min-width: 120px;
    }

    ::ng-deep .mat-mdc-tab .mdc-tab__content {
      gap: 8px;
    }

    .form-card {
      border-radius: 0 !important;
      box-shadow: none !important;
      margin: 0;
    }

    .form-card mat-card-header {
      padding: 20px 24px 0;
    }

    .form-card mat-card-content {
      padding: 24px !important;
    }

    .form-card mat-card-actions {
      padding: 16px 24px;
      background: #f8f9fa;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .security-options {
      margin-top: 24px;
      border-radius: 12px !important;
    }

    .security-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
    }

    .option-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .option-info mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--primary-navy);
    }

    .option-info h4 {
      margin: 0 0 4px 0;
      color: var(--primary-navy);
    }

    .option-info p {
      margin: 0;
      font-size: 13px;
      color: var(--text-muted);
    }

    .verification-status {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }

    .status-badge.verified {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.unverified {
      background: #f8d7da;
      color: #721c24;
    }

    .verification-section h4 {
      margin: 20px 0 16px;
      color: var(--primary-navy);
    }

    .document-upload {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .document-item mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--primary-navy);
    }

    .document-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .doc-title {
      font-weight: 500;
      color: var(--primary-navy);
    }

    .doc-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    @media (max-width: 900px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }

      .profile-sidebar {
        position: static;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  userRoles = signal<string[]>(['Borrower']);
  memberSince = signal(new Date('2024-03-15'));
  lastLogin = signal(new Date());

  savingProfile = signal(false);
  savingAddress = signal(false);
  savingPassword = signal(false);

  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  profileForm: FormGroup;
  addressForm: FormGroup;
  passwordForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['John', Validators.required],
      lastName: ['Doe', Validators.required],
      email: [{ value: 'john.doe@example.com', disabled: true }],
      phone: ['07700 900123'],
      dateOfBirth: ['1990-05-15']
    });

    this.addressForm = this.fb.group({
      addressLine1: ['123 High Street'],
      addressLine2: ['Flat 4'],
      city: ['London'],
      county: ['Greater London'],
      postcode: ['EC1A 1BB'],
      country: ['GB']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      this.userRoles.set(user.roles);
    }
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.savingProfile.set(true);
      setTimeout(() => {
        this.savingProfile.set(false);
        this.profileForm.markAsPristine();
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      }, 1000);
    }
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      this.savingAddress.set(true);
      setTimeout(() => {
        this.savingAddress.set(false);
        this.addressForm.markAsPristine();
        this.snackBar.open('Address updated successfully', 'Close', { duration: 3000 });
      }, 1000);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.savingPassword.set(true);
      setTimeout(() => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
      }, 1000);
    }
  }

  resetProfileForm(): void {
    this.loadUserProfile();
    this.profileForm.markAsPristine();
  }

  resetAddressForm(): void {
    this.addressForm.reset({
      addressLine1: '123 High Street',
      addressLine2: 'Flat 4',
      city: 'London',
      county: 'Greater London',
      postcode: 'EC1A 1BB',
      country: 'GB'
    });
    this.addressForm.markAsPristine();
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
  }
}
