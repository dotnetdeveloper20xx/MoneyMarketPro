import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  loanUpdates: boolean;
  paymentReminders: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  investmentAlerts: boolean;
}

interface PrivacySettings {
  showProfilePublic: boolean;
  allowDataSharing: boolean;
  allowAnalytics: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="settings-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <h1>Settings</h1>
          <p class="subtitle">Manage your account preferences and notifications</p>
        </div>

        <div class="settings-grid">
          <!-- Notifications Settings -->
          <mat-card class="settings-card">
            <mat-card-header>
              <div class="card-icon">
                <mat-icon>notifications</mat-icon>
              </div>
              <mat-card-title>Notifications</mat-card-title>
              <mat-card-subtitle>Manage how you receive notifications</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="settings-section">
                <h4>Notification Channels</h4>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Email Notifications</span>
                    <span class="setting-desc">Receive notifications via email</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="notifications.emailNotifications"
                                   (change)="saveNotifications()"></mat-slide-toggle>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">SMS Notifications</span>
                    <span class="setting-desc">Receive notifications via text message</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="notifications.smsNotifications"
                                   (change)="saveNotifications()"></mat-slide-toggle>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Push Notifications</span>
                    <span class="setting-desc">Receive browser push notifications</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="notifications.pushNotifications"
                                   (change)="saveNotifications()"></mat-slide-toggle>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="settings-section">
                <h4>Notification Types</h4>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Loan Updates</span>
                    <span class="setting-desc">Status changes for your loan applications</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="notifications.loanUpdates"
                                   (change)="saveNotifications()"></mat-slide-toggle>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Payment Reminders</span>
                    <span class="setting-desc">Reminders before payment due dates</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="notifications.paymentReminders"
                                   (change)="saveNotifications()"></mat-slide-toggle>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Investment Alerts</span>
                    <span class="setting-desc">New investment opportunities matching your criteria</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="notifications.investmentAlerts"
                                   (change)="saveNotifications()"></mat-slide-toggle>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Weekly Digest</span>
                    <span class="setting-desc">Weekly summary of your account activity</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="notifications.weeklyDigest"
                                   (change)="saveNotifications()"></mat-slide-toggle>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Marketing Emails</span>
                    <span class="setting-desc">Promotional offers and news</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="notifications.marketingEmails"
                                   (change)="saveNotifications()"></mat-slide-toggle>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Privacy Settings -->
          <mat-card class="settings-card">
            <mat-card-header>
              <div class="card-icon">
                <mat-icon>shield</mat-icon>
              </div>
              <mat-card-title>Privacy</mat-card-title>
              <mat-card-subtitle>Control your privacy settings</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="settings-section">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Public Profile</span>
                    <span class="setting-desc">Allow other users to see your profile</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="privacy.showProfilePublic"
                                   (change)="savePrivacy()"></mat-slide-toggle>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Data Sharing</span>
                    <span class="setting-desc">Share anonymized data for platform improvement</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="privacy.allowDataSharing"
                                   (change)="savePrivacy()"></mat-slide-toggle>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Analytics Cookies</span>
                    <span class="setting-desc">Allow us to analyze how you use our platform</span>
                  </div>
                  <mat-slide-toggle [(ngModel)]="privacy.allowAnalytics"
                                   (change)="savePrivacy()"></mat-slide-toggle>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="settings-section">
                <h4>Data Management</h4>
                <div class="data-action">
                  <div class="action-info">
                    <mat-icon>download</mat-icon>
                    <div>
                      <span class="action-title">Download Your Data</span>
                      <span class="action-desc">Get a copy of all your data</span>
                    </div>
                  </div>
                  <button mat-stroked-button (click)="downloadData()">Request Download</button>
                </div>
                <div class="data-action">
                  <div class="action-info">
                    <mat-icon color="warn">delete_forever</mat-icon>
                    <div>
                      <span class="action-title">Delete Account</span>
                      <span class="action-desc">Permanently delete your account and all data</span>
                    </div>
                  </div>
                  <button mat-stroked-button color="warn" (click)="confirmDeleteAccount()">Delete Account</button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Appearance Settings -->
          <mat-card class="settings-card">
            <mat-card-header>
              <div class="card-icon">
                <mat-icon>palette</mat-icon>
              </div>
              <mat-card-title>Appearance</mat-card-title>
              <mat-card-subtitle>Customize how the platform looks</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="settings-section">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Theme</span>
                    <span class="setting-desc">Choose your preferred color theme</span>
                  </div>
                  <mat-form-field appearance="outline" class="theme-select">
                    <mat-select [(value)]="selectedTheme" (selectionChange)="changeTheme()">
                      <mat-option value="light">Light</mat-option>
                      <mat-option value="dark">Dark</mat-option>
                      <mat-option value="system">System Default</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Language</span>
                    <span class="setting-desc">Select your preferred language</span>
                  </div>
                  <mat-form-field appearance="outline" class="theme-select">
                    <mat-select [(value)]="selectedLanguage" (selectionChange)="changeLanguage()">
                      <mat-option value="en">English (UK)</mat-option>
                      <mat-option value="en-us">English (US)</mat-option>
                      <mat-option value="fr">French</mat-option>
                      <mat-option value="de">German</mat-option>
                      <mat-option value="es">Spanish</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-title">Currency Display</span>
                    <span class="setting-desc">How currency values are displayed</span>
                  </div>
                  <mat-form-field appearance="outline" class="theme-select">
                    <mat-select [(value)]="selectedCurrency" (selectionChange)="changeCurrency()">
                      <mat-option value="GBP">GBP - British Pound</mat-option>
                      <mat-option value="EUR">EUR - Euro</mat-option>
                      <mat-option value="USD">USD - US Dollar</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Connected Accounts -->
          <mat-card class="settings-card">
            <mat-card-header>
              <div class="card-icon">
                <mat-icon>link</mat-icon>
              </div>
              <mat-card-title>Connected Accounts</mat-card-title>
              <mat-card-subtitle>Manage linked external accounts</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="settings-section">
                <div class="connected-account">
                  <div class="account-info">
                    <div class="account-icon bank">
                      <mat-icon>account_balance</mat-icon>
                    </div>
                    <div class="account-details">
                      <span class="account-name">Barclays Bank</span>
                      <span class="account-number">**** **** **** 4532</span>
                    </div>
                  </div>
                  <div class="account-actions">
                    <span class="status-badge connected">Connected</span>
                    <button mat-icon-button color="warn" matTooltip="Disconnect">
                      <mat-icon>link_off</mat-icon>
                    </button>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="connected-account">
                  <div class="account-info">
                    <div class="account-icon social">
                      <mat-icon>mail</mat-icon>
                    </div>
                    <div class="account-details">
                      <span class="account-name">Google</span>
                      <span class="account-number">john.doe&#64;gmail.com</span>
                    </div>
                  </div>
                  <div class="account-actions">
                    <span class="status-badge connected">Connected</span>
                    <button mat-icon-button color="warn" matTooltip="Disconnect">
                      <mat-icon>link_off</mat-icon>
                    </button>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <button mat-stroked-button class="add-account-btn">
                  <mat-icon>add</mat-icon>
                  Connect New Account
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Session Management -->
          <mat-card class="settings-card full-width">
            <mat-card-header>
              <div class="card-icon">
                <mat-icon>devices</mat-icon>
              </div>
              <mat-card-title>Active Sessions</mat-card-title>
              <mat-card-subtitle>Manage your active login sessions</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="sessions-list">
                @for (session of sessions(); track session.id) {
                  <div class="session-item" [class.current]="session.current">
                    <div class="session-info">
                      <mat-icon>{{ getDeviceIcon(session.deviceType) }}</mat-icon>
                      <div class="session-details">
                        <span class="session-device">
                          {{ session.deviceName }}
                          @if (session.current) {
                            <span class="current-badge">Current</span>
                          }
                        </span>
                        <span class="session-meta">
                          {{ session.location }} · {{ session.lastActive | date:'medium' }}
                        </span>
                      </div>
                    </div>
                    @if (!session.current) {
                      <button mat-icon-button color="warn" (click)="revokeSession(session)">
                        <mat-icon>logout</mat-icon>
                      </button>
                    }
                  </div>
                }
              </div>
              <button mat-stroked-button color="warn" class="logout-all-btn" (click)="logoutAllSessions()">
                <mat-icon>logout</mat-icon>
                Log Out of All Other Sessions
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
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

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .settings-card {
      border-radius: 12px;
    }

    .settings-card.full-width {
      grid-column: 1 / -1;
    }

    .settings-card mat-card-header {
      padding: 20px 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary-navy), var(--primary-light));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .settings-card mat-card-content {
      padding: 0 24px 24px !important;
    }

    .settings-section {
      padding: 16px 0;
    }

    .settings-section h4 {
      margin: 0 0 16px 0;
      color: var(--primary-navy);
      font-size: 14px;
      font-weight: 600;
    }

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .setting-title {
      font-weight: 500;
      color: var(--primary-navy);
    }

    .setting-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    mat-divider {
      margin: 8px 0;
    }

    .theme-select {
      width: 180px;
    }

    ::ng-deep .theme-select .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .data-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
    }

    .action-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .action-info mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .action-title {
      display: block;
      font-weight: 500;
      color: var(--primary-navy);
    }

    .action-desc {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
    }

    .connected-account {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
    }

    .account-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .account-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .account-icon.bank {
      background: #e8f4fd;
      color: #1976d2;
    }

    .account-icon.social {
      background: #fce4ec;
      color: #c2185b;
    }

    .account-details {
      display: flex;
      flex-direction: column;
    }

    .account-name {
      font-weight: 500;
      color: var(--primary-navy);
    }

    .account-number {
      font-size: 12px;
      color: var(--text-muted);
    }

    .account-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .status-badge.connected {
      background: #d4edda;
      color: #155724;
    }

    .add-account-btn {
      margin-top: 16px;
      width: 100%;
    }

    .sessions-list {
      margin-bottom: 16px;
    }

    .session-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      background: #f8f9fa;
    }

    .session-item.current {
      background: #e8f4fd;
      border: 1px solid #bbdefb;
    }

    .session-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .session-info mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--primary-navy);
    }

    .session-details {
      display: flex;
      flex-direction: column;
    }

    .session-device {
      font-weight: 500;
      color: var(--primary-navy);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .current-badge {
      padding: 2px 8px;
      background: var(--primary-navy);
      color: white;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 500;
    }

    .session-meta {
      font-size: 12px;
      color: var(--text-muted);
    }

    .logout-all-btn {
      width: 100%;
    }

    @media (max-width: 900px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsComponent {
  notifications: NotificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    loanUpdates: true,
    paymentReminders: true,
    marketingEmails: false,
    weeklyDigest: true,
    investmentAlerts: true
  };

  privacy: PrivacySettings = {
    showProfilePublic: false,
    allowDataSharing: true,
    allowAnalytics: true
  };

  selectedTheme = 'light';
  selectedLanguage = 'en';
  selectedCurrency = 'GBP';

  sessions = signal([
    {
      id: '1',
      deviceType: 'desktop',
      deviceName: 'Chrome on Windows',
      location: 'London, UK',
      lastActive: new Date(),
      current: true
    },
    {
      id: '2',
      deviceType: 'mobile',
      deviceName: 'Safari on iPhone',
      location: 'Manchester, UK',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      current: false
    },
    {
      id: '3',
      deviceType: 'tablet',
      deviceName: 'Chrome on iPad',
      location: 'Birmingham, UK',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      current: false
    }
  ]);

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  saveNotifications(): void {
    this.snackBar.open('Notification preferences saved', 'Close', { duration: 2000 });
  }

  savePrivacy(): void {
    this.snackBar.open('Privacy settings saved', 'Close', { duration: 2000 });
  }

  changeTheme(): void {
    this.snackBar.open(`Theme changed to ${this.selectedTheme}`, 'Close', { duration: 2000 });
  }

  changeLanguage(): void {
    this.snackBar.open('Language preference saved', 'Close', { duration: 2000 });
  }

  changeCurrency(): void {
    this.snackBar.open(`Currency display changed to ${this.selectedCurrency}`, 'Close', { duration: 2000 });
  }

  downloadData(): void {
    this.snackBar.open('Data download request submitted. You will receive an email when ready.', 'Close', { duration: 4000 });
  }

  confirmDeleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.snackBar.open('Account deletion request submitted', 'Close', { duration: 3000 });
    }
  }

  getDeviceIcon(deviceType: string): string {
    switch (deviceType) {
      case 'mobile': return 'smartphone';
      case 'tablet': return 'tablet';
      default: return 'computer';
    }
  }

  revokeSession(session: any): void {
    this.sessions.update(sessions => sessions.filter(s => s.id !== session.id));
    this.snackBar.open('Session revoked', 'Close', { duration: 2000 });
  }

  logoutAllSessions(): void {
    if (confirm('This will log you out of all other devices. Continue?')) {
      this.sessions.update(sessions => sessions.filter(s => s.current));
      this.snackBar.open('Logged out of all other sessions', 'Close', { duration: 3000 });
    }
  }
}
