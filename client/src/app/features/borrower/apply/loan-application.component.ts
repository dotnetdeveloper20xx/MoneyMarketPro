import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { BorrowerProfile } from '../../../core/models';

@Component({
  selector: 'app-loan-application',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="mm-page">
      <div class="container container--narrow">
        <div class="mm-page-header">
          <a routerLink="/borrower/dashboard" class="mm-back-link">
            <mat-icon>arrow_back</mat-icon>
            Back to Dashboard
          </a>
          <h1 class="mm-page-header__title">Apply for a Loan</h1>
          <p class="mm-page-header__subtitle">
            Complete the form below to submit your loan application
          </p>
        </div>

        <mat-stepper [linear]="true" #stepper class="mm-stepper">
          <!-- Step 1: Loan Details -->
          <mat-step [stepControl]="loanDetailsForm" label="Loan Details">
            <form [formGroup]="loanDetailsForm" class="mm-form">
              <div class="mm-card">
                <h3>How much would you like to borrow?</h3>

                <div class="mm-amount-selector">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Loan Amount</mat-label>
                    <span matPrefix>£&nbsp;</span>
                    <input matInput type="number" formControlName="amount"
                           min="500" max="50000" step="100">
                    <mat-error *ngIf="loanDetailsForm.get('amount')?.hasError('required')">
                      Amount is required
                    </mat-error>
                    <mat-error *ngIf="loanDetailsForm.get('amount')?.hasError('min')">
                      Minimum amount is £500
                    </mat-error>
                    <mat-error *ngIf="loanDetailsForm.get('amount')?.hasError('max')">
                      Maximum amount is £50,000
                    </mat-error>
                  </mat-form-field>

                  <div class="mm-amount-presets">
                    <button type="button" mat-stroked-button
                            *ngFor="let preset of amountPresets"
                            (click)="setAmount(preset)"
                            [class.active]="loanDetailsForm.get('amount')?.value === preset">
                      £{{ preset | number }}
                    </button>
                  </div>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Loan Purpose</mat-label>
                  <mat-select formControlName="purpose">
                    <mat-option *ngFor="let purpose of loanPurposes" [value]="purpose.value">
                      {{ purpose.label }}
                    </mat-option>
                  </mat-select>
                  <mat-error>Please select a loan purpose</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Loan Term (Months)</mat-label>
                  <mat-select formControlName="termMonths">
                    <mat-option *ngFor="let term of loanTerms" [value]="term">
                      {{ term }} months
                    </mat-option>
                  </mat-select>
                  <mat-error>Please select a loan term</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Describe why you need this loan</mat-label>
                  <textarea matInput formControlName="description" rows="4"
                            placeholder="Provide details about how you plan to use the funds..."></textarea>
                  <mat-hint>Minimum 20 characters</mat-hint>
                  <mat-error *ngIf="loanDetailsForm.get('description')?.hasError('required')">
                    Description is required
                  </mat-error>
                  <mat-error *ngIf="loanDetailsForm.get('description')?.hasError('minlength')">
                    Please provide at least 20 characters
                  </mat-error>
                </mat-form-field>

                <!-- Loan Summary Card -->
                <div class="mm-loan-summary" *ngIf="loanDetailsForm.valid">
                  <h4>Estimated Monthly Payment</h4>
                  <div class="mm-loan-summary__amount">
                    {{ calculateMonthlyPayment() | currency:'GBP' }}
                  </div>
                  <div class="mm-loan-summary__details">
                    <div>
                      <span class="label">Interest Rate</span>
                      <span class="value">{{ estimatedRate() }}% APR</span>
                    </div>
                    <div>
                      <span class="label">Total Repayment</span>
                      <span class="value">{{ calculateTotalRepayment() | currency:'GBP' }}</span>
                    </div>
                  </div>
                  <p class="mm-loan-summary__note">
                    *Representative APR. Your actual rate may vary based on credit assessment.
                  </p>
                </div>
              </div>

              <div class="mm-stepper-actions">
                <button mat-button routerLink="/borrower/dashboard">Cancel</button>
                <button mat-raised-button class="mm-btn-primary" matStepperNext
                        [disabled]="loanDetailsForm.invalid">
                  Continue
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Personal Details -->
          <mat-step [stepControl]="personalDetailsForm" label="Your Details">
            <form [formGroup]="personalDetailsForm" class="mm-form">
              <div class="mm-card">
                <h3>Personal Information</h3>
                <p class="text-muted" *ngIf="hasExistingProfile()">
                  We've pre-filled some information from your profile.
                </p>

                <div class="mm-form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phoneNumber" type="tel"
                           placeholder="07123 456789">
                    <mat-error>Valid phone number is required</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date of Birth</mat-label>
                    <input matInput formControlName="dateOfBirth" type="date">
                    <mat-error>Date of birth is required</mat-error>
                  </mat-form-field>
                </div>

                <h3>Address</h3>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Street Address</mat-label>
                  <input matInput formControlName="street">
                  <mat-error>Street address is required</mat-error>
                </mat-form-field>

                <div class="mm-form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city">
                    <mat-error>City is required</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>County/State</mat-label>
                    <input matInput formControlName="state">
                  </mat-form-field>
                </div>

                <div class="mm-form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Postcode</mat-label>
                    <input matInput formControlName="postalCode">
                    <mat-error>Postcode is required</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Country</mat-label>
                    <mat-select formControlName="country">
                      <mat-option value="United Kingdom">United Kingdom</mat-option>
                      <mat-option value="Ireland">Ireland</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <h3>Employment Information</h3>
                <div class="mm-form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Employment Type</mat-label>
                    <mat-select formControlName="employmentType">
                      <mat-option value="FullTime">Full Time</mat-option>
                      <mat-option value="PartTime">Part Time</mat-option>
                      <mat-option value="SelfEmployed">Self Employed</mat-option>
                      <mat-option value="Unemployed">Unemployed</mat-option>
                    </mat-select>
                    <mat-error>Employment type is required</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Monthly Income</mat-label>
                    <span matPrefix>£&nbsp;</span>
                    <input matInput type="number" formControlName="monthlyIncome" min="0">
                    <mat-error>Monthly income is required</mat-error>
                  </mat-form-field>
                </div>

                <div class="mm-form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Employer Name</mat-label>
                    <input matInput formControlName="employerName">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Job Title</mat-label>
                    <input matInput formControlName="jobTitle">
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Employment Start Date</mat-label>
                  <input matInput type="date" formControlName="employmentStartDate">
                </mat-form-field>
              </div>

              <div class="mm-stepper-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Back
                </button>
                <button mat-raised-button class="mm-btn-primary" matStepperNext
                        [disabled]="personalDetailsForm.invalid">
                  Continue
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Review & Submit -->
          <mat-step label="Review & Submit">
            <div class="mm-card">
              <h3>Review Your Application</h3>
              <p class="text-muted">Please review your application details before submitting.</p>

              <div class="mm-review-section">
                <h4>
                  <mat-icon>account_balance</mat-icon>
                  Loan Details
                </h4>
                <div class="mm-review-grid">
                  <div class="mm-review-item">
                    <span class="label">Amount</span>
                    <span class="value">{{ loanDetailsForm.get('amount')?.value | currency:'GBP' }}</span>
                  </div>
                  <div class="mm-review-item">
                    <span class="label">Purpose</span>
                    <span class="value">{{ getLoanPurposeLabel() }}</span>
                  </div>
                  <div class="mm-review-item">
                    <span class="label">Term</span>
                    <span class="value">{{ loanDetailsForm.get('termMonths')?.value }} months</span>
                  </div>
                  <div class="mm-review-item">
                    <span class="label">Est. Monthly Payment</span>
                    <span class="value">{{ calculateMonthlyPayment() | currency:'GBP' }}</span>
                  </div>
                </div>
              </div>

              <div class="mm-review-section">
                <h4>
                  <mat-icon>person</mat-icon>
                  Personal Details
                </h4>
                <div class="mm-review-grid">
                  <div class="mm-review-item">
                    <span class="label">Phone</span>
                    <span class="value">{{ personalDetailsForm.get('phoneNumber')?.value }}</span>
                  </div>
                  <div class="mm-review-item">
                    <span class="label">Address</span>
                    <span class="value">
                      {{ personalDetailsForm.get('street')?.value }},
                      {{ personalDetailsForm.get('city')?.value }},
                      {{ personalDetailsForm.get('postalCode')?.value }}
                    </span>
                  </div>
                  <div class="mm-review-item">
                    <span class="label">Employment</span>
                    <span class="value">{{ personalDetailsForm.get('employmentType')?.value }} - {{ personalDetailsForm.get('jobTitle')?.value }}</span>
                  </div>
                  <div class="mm-review-item">
                    <span class="label">Monthly Income</span>
                    <span class="value">{{ personalDetailsForm.get('monthlyIncome')?.value | currency:'GBP' }}</span>
                  </div>
                </div>
              </div>

              <div class="mm-terms-box">
                <h4>Terms & Conditions</h4>
                <p>
                  By submitting this application, you confirm that the information provided is accurate
                  and complete. You authorize MoneyMarket to verify your identity and creditworthiness
                  through credit reference agencies.
                </p>
                <p>
                  Your application will be reviewed by our team and you will receive a decision
                  within 24-48 hours.
                </p>
              </div>
            </div>

            <div class="mm-stepper-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button class="mm-btn-primary"
                      (click)="submitApplication()"
                      [disabled]="isSubmitting()">
                <mat-spinner *ngIf="isSubmitting()" diameter="20"></mat-spinner>
                <span *ngIf="!isSubmitting()">
                  Submit Application
                  <mat-icon>send</mat-icon>
                </span>
              </button>
            </div>
          </mat-step>
        </mat-stepper>
      </div>
    </div>
  `,
  styles: [`
    .container--narrow {
      max-width: 800px;
    }

    .mm-back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--mm-spacing-xs);
      color: var(--mm-secondary);
      text-decoration: none;
      margin-bottom: var(--mm-spacing-md);
      font-size: 0.875rem;

      &:hover {
        text-decoration: underline;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .mm-stepper {
      background: transparent;
    }

    .mm-form {
      margin-top: var(--mm-spacing-lg);
    }

    .mm-card {
      background: var(--mm-white);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-xl);
      box-shadow: var(--mm-shadow-sm);
      margin-bottom: var(--mm-spacing-lg);

      h3 {
        margin: 0 0 var(--mm-spacing-lg);
        color: var(--mm-gray-900);
      }
    }

    .full-width {
      width: 100%;
    }

    .mm-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--mm-spacing-md);

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-amount-presets {
      display: flex;
      flex-wrap: wrap;
      gap: var(--mm-spacing-sm);
      margin-bottom: var(--mm-spacing-lg);

      button {
        flex: 1;
        min-width: 80px;

        &.active {
          background: var(--mm-primary);
          color: white;
        }
      }
    }

    .mm-loan-summary {
      background: var(--mm-light-blue);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      text-align: center;
      margin-top: var(--mm-spacing-lg);

      h4 {
        margin: 0 0 var(--mm-spacing-sm);
        color: var(--mm-gray-600);
        font-size: 0.875rem;
        font-weight: normal;
      }

      &__amount {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--mm-primary);
        margin-bottom: var(--mm-spacing-md);
      }

      &__details {
        display: flex;
        justify-content: center;
        gap: var(--mm-spacing-xl);
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

      &__note {
        font-size: 0.75rem;
        color: var(--mm-gray-600);
        margin: 0;
      }
    }

    .mm-stepper-actions {
      display: flex;
      justify-content: space-between;
      gap: var(--mm-spacing-md);
      padding-top: var(--mm-spacing-lg);
    }

    .mm-review-section {
      border-bottom: 1px solid var(--mm-gray-200);
      padding-bottom: var(--mm-spacing-lg);
      margin-bottom: var(--mm-spacing-lg);

      &:last-of-type {
        border-bottom: none;
      }

      h4 {
        display: flex;
        align-items: center;
        gap: var(--mm-spacing-sm);
        margin: 0 0 var(--mm-spacing-md);
        color: var(--mm-primary);

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    .mm-review-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--mm-spacing-md);

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .mm-review-item {
      .label {
        display: block;
        font-size: 0.75rem;
        color: var(--mm-gray-600);
        text-transform: uppercase;
        margin-bottom: var(--mm-spacing-xs);
      }

      .value {
        font-weight: 500;
        color: var(--mm-gray-900);
      }
    }

    .mm-terms-box {
      background: var(--mm-gray-100);
      border-radius: var(--mm-radius-md);
      padding: var(--mm-spacing-lg);
      margin-top: var(--mm-spacing-lg);

      h4 {
        margin: 0 0 var(--mm-spacing-sm);
      }

      p {
        font-size: 0.875rem;
        color: var(--mm-gray-600);
        margin: 0 0 var(--mm-spacing-sm);

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .text-muted {
      color: var(--mm-gray-600);
    }

    ::ng-deep .mat-horizontal-stepper-header-container {
      margin-bottom: var(--mm-spacing-lg);
    }

    ::ng-deep .mat-step-header .mat-step-icon-selected {
      background-color: var(--mm-primary);
    }

    ::ng-deep .mat-step-header .mat-step-icon-state-done {
      background-color: var(--mm-success);
    }
  `]
})
export class LoanApplicationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  isSubmitting = signal(false);
  borrowerProfile = signal<BorrowerProfile | null>(null);

  amountPresets = [1000, 2500, 5000, 10000, 25000];

  loanPurposes = [
    { value: 'Debt Consolidation', label: 'Debt Consolidation' },
    { value: 'Home Improvement', label: 'Home Improvement' },
    { value: 'Car Purchase', label: 'Car Purchase' },
    { value: 'Wedding', label: 'Wedding' },
    { value: 'Holiday', label: 'Holiday' },
    { value: 'Medical', label: 'Medical Expenses' },
    { value: 'Education', label: 'Education' },
    { value: 'Business', label: 'Business' },
    { value: 'Other', label: 'Other' }
  ];

  loanTerms = [12, 24, 36, 48, 60];

  loanDetailsForm: FormGroup = this.fb.group({
    amount: [5000, [Validators.required, Validators.min(500), Validators.max(50000)]],
    purpose: ['', Validators.required],
    termMonths: [36, Validators.required],
    description: ['', [Validators.required, Validators.minLength(20)]]
  });

  personalDetailsForm: FormGroup = this.fb.group({
    phoneNumber: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: [''],
    postalCode: ['', Validators.required],
    country: ['United Kingdom', Validators.required],
    employmentType: ['FullTime', Validators.required],
    monthlyIncome: ['', [Validators.required, Validators.min(0)]],
    employerName: [''],
    jobTitle: [''],
    employmentStartDate: ['']
  });

  ngOnInit(): void {
    this.loadBorrowerProfile();
  }

  private loadBorrowerProfile(): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    this.apiService.getBorrowerProfileByUserId(userId).subscribe({
      next: (profile) => {
        this.borrowerProfile.set(profile);
        this.prefillPersonalDetails(profile);
      },
      error: () => {
        // No existing profile, that's fine
      }
    });
  }

  private prefillPersonalDetails(profile: BorrowerProfile): void {
    this.personalDetailsForm.patchValue({
      phoneNumber: profile.phoneNumber,
      dateOfBirth: profile.dateOfBirth?.split('T')[0],
      street: profile.address?.street,
      city: profile.address?.city,
      state: profile.address?.state,
      postalCode: profile.address?.postalCode,
      country: profile.address?.country || 'United Kingdom',
      employmentType: profile.employmentInfo?.employmentType,
      monthlyIncome: profile.employmentInfo?.monthlyIncome,
      employerName: profile.employmentInfo?.employerName,
      jobTitle: profile.employmentInfo?.jobTitle,
      employmentStartDate: profile.employmentInfo?.employmentStartDate?.split('T')[0]
    });
  }

  hasExistingProfile(): boolean {
    return this.borrowerProfile() !== null;
  }

  setAmount(amount: number): void {
    this.loanDetailsForm.patchValue({ amount });
  }

  estimatedRate(): number {
    // Simple rate calculation based on amount and term
    const amount = this.loanDetailsForm.get('amount')?.value || 5000;
    if (amount < 2000) return 12.9;
    if (amount < 5000) return 9.9;
    if (amount < 10000) return 7.9;
    return 5.9;
  }

  calculateMonthlyPayment(): number {
    const amount = this.loanDetailsForm.get('amount')?.value || 0;
    const term = this.loanDetailsForm.get('termMonths')?.value || 36;
    const rate = this.estimatedRate() / 100 / 12;

    if (rate === 0) return amount / term;

    const payment = (amount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    return Math.round(payment * 100) / 100;
  }

  calculateTotalRepayment(): number {
    return this.calculateMonthlyPayment() * (this.loanDetailsForm.get('termMonths')?.value || 36);
  }

  getLoanPurposeLabel(): string {
    const purpose = this.loanDetailsForm.get('purpose')?.value;
    return this.loanPurposes.find(p => p.value === purpose)?.label || purpose;
  }

  async submitApplication(): Promise<void> {
    if (this.loanDetailsForm.invalid || this.personalDetailsForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      const userId = this.authService.currentUser()?.userId;
      if (!userId) throw new Error('User not authenticated');

      // First, create or update borrower profile
      if (!this.borrowerProfile()) {
        await this.createBorrowerProfile(userId);
      }

      // Create loan application
      const applicationData = {
        amount: this.loanDetailsForm.get('amount')?.value,
        purpose: this.loanDetailsForm.get('purpose')?.value,
        description: this.loanDetailsForm.get('description')?.value,
        termMonths: this.loanDetailsForm.get('termMonths')?.value,
        requestedInterestRate: this.estimatedRate()
      };

      this.apiService.createLoanApplication(applicationData).subscribe({
        next: (application) => {
          // Auto-submit the application
          this.apiService.submitLoanApplication(application.id).subscribe({
            next: () => {
              this.snackBar.open('Application submitted successfully!', 'Close', {
                duration: 5000,
                panelClass: ['mm-snackbar-success']
              });
              this.router.navigate(['/borrower/applications']);
            },
            error: (err) => {
              console.error('Failed to submit application', err);
              // Still navigate to applications, it's in Draft status
              this.snackBar.open('Application saved as draft.', 'Close', {
                duration: 5000
              });
              this.router.navigate(['/borrower/applications']);
            }
          });
        },
        error: (err) => {
          console.error('Failed to create application', err);
          this.snackBar.open('Failed to create application. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['mm-snackbar-error']
          });
          this.isSubmitting.set(false);
        }
      });
    } catch (error) {
      console.error('Error submitting application', error);
      this.snackBar.open('An error occurred. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['mm-snackbar-error']
      });
      this.isSubmitting.set(false);
    }
  }

  private createBorrowerProfile(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const profileData = {
        phoneNumber: this.personalDetailsForm.get('phoneNumber')?.value,
        dateOfBirth: this.personalDetailsForm.get('dateOfBirth')?.value,
        street: this.personalDetailsForm.get('street')?.value,
        city: this.personalDetailsForm.get('city')?.value,
        state: this.personalDetailsForm.get('state')?.value || '',
        postalCode: this.personalDetailsForm.get('postalCode')?.value,
        country: this.personalDetailsForm.get('country')?.value,
        employerName: this.personalDetailsForm.get('employerName')?.value || 'Not specified',
        jobTitle: this.personalDetailsForm.get('jobTitle')?.value || 'Not specified',
        monthlyIncome: this.personalDetailsForm.get('monthlyIncome')?.value,
        employmentStartDate: this.personalDetailsForm.get('employmentStartDate')?.value || new Date().toISOString().split('T')[0],
        employmentType: this.personalDetailsForm.get('employmentType')?.value
      };

      this.apiService.createBorrowerProfile(profileData).subscribe({
        next: (profile) => {
          this.borrowerProfile.set(profile);
          resolve();
        },
        error: (err) => {
          // Profile might already exist, try to continue
          console.warn('Profile creation failed, may already exist', err);
          resolve();
        }
      });
    });
  }
}
