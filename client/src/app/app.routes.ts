import { Routes } from '@angular/router';
import { authGuard, guestGuard, borrowerGuard, lenderGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes with main layout
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
      },
      {
        path: 'how-it-works',
        loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
      },
      {
        path: 'borrow',
        loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
      },
      {
        path: 'invest',
        loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
      },
      // Borrower routes
      {
        path: 'borrower',
        canActivate: [authGuard, borrowerGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./features/borrower/dashboard/borrower-dashboard.component').then(m => m.BorrowerDashboardComponent)
          },
          {
            path: 'applications',
            loadComponent: () => import('./features/borrower/applications/applications-list.component').then(m => m.ApplicationsListComponent)
          },
          {
            path: 'applications/:id',
            loadComponent: () => import('./features/borrower/applications/applications-list.component').then(m => m.ApplicationsListComponent)
          },
          {
            path: 'apply',
            loadComponent: () => import('./features/borrower/apply/loan-application.component').then(m => m.LoanApplicationComponent)
          },
          {
            path: 'loans',
            loadComponent: () => import('./features/borrower/loans/loans-list.component').then(m => m.LoansListComponent)
          },
          {
            path: 'loans/:id',
            loadComponent: () => import('./features/borrower/loans/loan-detail.component').then(m => m.LoanDetailComponent)
          },
          {
            path: 'wallet',
            loadComponent: () => import('./features/borrower/wallet/wallet.component').then(m => m.WalletComponent)
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
      },
      // Lender routes
      {
        path: 'lender',
        canActivate: [authGuard, lenderGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./features/lender/dashboard/lender-dashboard.component').then(m => m.LenderDashboardComponent)
          },
          {
            path: 'marketplace',
            loadComponent: () => import('./features/lender/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
          },
          {
            path: 'marketplace/:id',
            loadComponent: () => import('./features/lender/marketplace/loan-invest.component').then(m => m.LoanInvestComponent)
          },
          {
            path: 'investments',
            loadComponent: () => import('./features/lender/investments/investments-list.component').then(m => m.InvestmentsListComponent)
          },
          {
            path: 'wallet',
            loadComponent: () => import('./features/lender/wallet/lender-wallet.component').then(m => m.LenderWalletComponent)
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
      },
      // Admin routes
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          },
          {
            path: 'applications',
            loadComponent: () => import('./features/admin/applications/applications-queue.component').then(m => m.ApplicationsQueueComponent)
          },
          {
            path: 'applications/:id',
            loadComponent: () => import('./features/admin/applications/application-review.component').then(m => m.ApplicationReviewComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('./features/admin/users/user-management.component').then(m => m.UserManagementComponent)
          },
          {
            path: 'loans',
            loadComponent: () => import('./features/admin/loans/loans-management.component').then(m => m.LoansManagementComponent)
          },
          {
            path: 'reports',
            loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
      },
      // Shared authenticated routes
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/shared/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'wallet',
        canActivate: [authGuard],
        loadComponent: () => import('./features/borrower/wallet/wallet.component').then(m => m.WalletComponent)
      },
      {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () => import('./features/shared/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  // Auth routes (no main layout - standalone pages)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  // Error pages
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
  },
  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
