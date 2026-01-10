# Screenshot Capture Guide

This guide provides detailed instructions for capturing screenshots to include in the portfolio demo site.

## Prerequisites

1. MoneyMarketPro application running locally
   - Backend: `dotnet run` in the API project
   - Frontend: `ng serve` in the client folder
2. Database seeded with demo data
3. Screen capture tool (Windows Snipping Tool, macOS Screenshot, or browser extension)

## Recommended Settings

- **Resolution:** 1920x1080 or higher
- **Format:** PNG (for quality) or WebP (for smaller size)
- **Browser:** Chrome or Edge with DevTools closed
- **Zoom:** 100%

---

## Public Pages

### SS-01: Landing Page
| Field | Value |
|-------|-------|
| **Route** | `/` |
| **State** | Guest (not logged in) |
| **Capture** | Full page |
| **Filename** | `landing.png` |
| **Notes** | Capture the hero section and features |

### SS-02: Login Page
| Field | Value |
|-------|-------|
| **Route** | `/login` |
| **State** | Guest |
| **Capture** | Full page |
| **Filename** | `login.png` |
| **Notes** | Show the login form with validation states if possible |

### SS-03: Register Page
| Field | Value |
|-------|-------|
| **Route** | `/register` |
| **State** | Guest |
| **Capture** | Full page |
| **Filename** | `register.png` |
| **Notes** | Show role selection (Borrower/Lender) |

---

## Borrower Flow

### SS-04: Borrower Dashboard
| Field | Value |
|-------|-------|
| **Route** | `/borrower/dashboard` |
| **State** | Logged in as Borrower |
| **Capture** | Full page |
| **Filename** | `borrower-dashboard.png` |
| **Notes** | Show wallet balance, active loans count, upcoming payments |

### SS-05: Loan Application Form
| Field | Value |
|-------|-------|
| **Route** | `/borrower/apply` |
| **State** | Logged in as Borrower |
| **Capture** | Full page or multi-step sequence |
| **Filename** | `loan-application.png` |
| **Notes** | Capture the multi-step wizard, show validation if possible |

### SS-06: Applications List
| Field | Value |
|-------|-------|
| **Route** | `/borrower/applications` |
| **State** | Borrower with existing applications |
| **Capture** | Full page |
| **Filename** | `borrower-applications.png` |
| **Notes** | Show various application statuses (Draft, Submitted, Approved, Rejected) |

### SS-07: Active Loans
| Field | Value |
|-------|-------|
| **Route** | `/borrower/loans` |
| **State** | Borrower with active loans |
| **Capture** | Full page |
| **Filename** | `borrower-loans.png` |
| **Notes** | Show loan cards with progress, amounts, next payment |

### SS-08: Loan Detail
| Field | Value |
|-------|-------|
| **Route** | `/borrower/loans/:id` |
| **State** | Viewing an active loan |
| **Capture** | Full page |
| **Filename** | `loan-detail.png` |
| **Notes** | Show payment schedule, loan terms, make payment button |

### SS-09: Borrower Wallet
| Field | Value |
|-------|-------|
| **Route** | `/borrower/wallet` |
| **State** | Wallet with balance and transactions |
| **Capture** | Full page |
| **Filename** | `borrower-wallet.png` |
| **Notes** | Show balance, deposit/withdraw buttons, transaction history |

---

## Lender Flow

### SS-10: Lender Dashboard
| Field | Value |
|-------|-------|
| **Route** | `/lender/dashboard` |
| **State** | Logged in as Lender |
| **Capture** | Full page |
| **Filename** | `lender-dashboard.png` |
| **Notes** | Show portfolio value, total invested, returns |

### SS-11: Loan Marketplace
| Field | Value |
|-------|-------|
| **Route** | `/lender/marketplace` |
| **State** | Lender viewing available loans |
| **Capture** | Full page |
| **Filename** | `marketplace.png` |
| **Notes** | Show loan cards with risk grades (A-E), interest rates, funding progress |

### SS-12: Investment Detail
| Field | Value |
|-------|-------|
| **Route** | `/lender/marketplace/:id` |
| **State** | Viewing a loan to invest in |
| **Capture** | Full page |
| **Filename** | `investment-detail.png` |
| **Notes** | Show borrower info, loan terms, invest button |

### SS-13: My Investments
| Field | Value |
|-------|-------|
| **Route** | `/lender/investments` |
| **State** | Lender with active investments |
| **Capture** | Full page |
| **Filename** | `my-investments.png` |
| **Notes** | Show investment portfolio with returns |

### SS-14: Lender Wallet
| Field | Value |
|-------|-------|
| **Route** | `/lender/wallet` |
| **State** | Wallet with balance |
| **Capture** | Full page |
| **Filename** | `lender-wallet.png` |
| **Notes** | Show available balance for investing |

---

## Admin Flow

### SS-15: Admin Dashboard
| Field | Value |
|-------|-------|
| **Route** | `/admin/dashboard` |
| **State** | Logged in as Admin/CRM |
| **Capture** | Full page |
| **Filename** | `admin-dashboard.png` |
| **Notes** | Show platform metrics, user counts, loan statistics |

### SS-16: Applications Queue
| Field | Value |
|-------|-------|
| **Route** | `/admin/applications` |
| **State** | Admin with pending applications |
| **Capture** | Full page |
| **Filename** | `applications-queue.png` |
| **Notes** | Show list of applications awaiting review |

### SS-17: Application Review
| Field | Value |
|-------|-------|
| **Route** | `/admin/applications/:id` |
| **State** | Reviewing a specific application |
| **Capture** | Full page |
| **Filename** | `application-review.png` |
| **Notes** | Show applicant details, approve/reject buttons |

### SS-18: User Management
| Field | Value |
|-------|-------|
| **Route** | `/admin/users` |
| **State** | Admin viewing users |
| **Capture** | Full page |
| **Filename** | `user-management.png` |
| **Notes** | Show user list with roles, status |

### SS-19: Loans Management
| Field | Value |
|-------|-------|
| **Route** | `/admin/loans` |
| **State** | Admin viewing all loans |
| **Capture** | Full page |
| **Filename** | `loans-management.png` |
| **Notes** | Show all platform loans with status filters |

---

## Technical Screenshots

### SS-20: Swagger API Documentation
| Field | Value |
|-------|-------|
| **Route** | `/swagger` (Backend) |
| **State** | N/A |
| **Capture** | Full page |
| **Filename** | `swagger-api.png` |
| **Notes** | Show the API endpoints grouped by controller |

### SS-21: Health Check
| Field | Value |
|-------|-------|
| **Route** | `/health` (Backend) |
| **State** | N/A |
| **Capture** | Browser showing JSON response |
| **Filename** | `health-check.png` |
| **Notes** | Show healthy status response |

---

## Demo Credentials

Use these seeded accounts for screenshots:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@moneymarket.com | Admin123! |
| CRM | crm@moneymarket.com | Crm123! |
| Borrower | borrower@test.com | Test123! |
| Lender | lender@test.com | Test123! |

---

## Tips for Great Screenshots

1. **Clear State:** Ensure the app has realistic demo data
2. **Consistent Size:** Keep browser at same size for all captures
3. **Hide Personal Info:** Use demo accounts, not real data
4. **Show Features:** Capture states that highlight functionality
5. **Good Lighting:** Use a clean, well-lit screen
6. **No Clutter:** Close other tabs, hide bookmarks bar

---

## Adding Screenshots to HTML

After capturing, update the HTML to display them:

```html
<!-- Before (placeholder) -->
<div class="screenshot-placeholder">
    <i class="fas fa-tachometer-alt"></i>
    <span>Borrower Dashboard</span>
</div>

<!-- After (actual screenshot) -->
<img src="screenshots/borrower-dashboard.png"
     alt="Borrower Dashboard"
     class="screenshot-image">
```

Add this CSS for actual screenshots:

```css
.screenshot-image {
    width: 100%;
    height: auto;
    border-radius: var(--radius-md);
}
```
