# Portfolio Demo Site - Discovery & Planning Document

**Project:** MoneyMarketPro
**Developer:** Faz Ahmed
**Portfolio Website:** dotnetdeveloper.co.uk
**Phase:** 1 - Discovery & Planning
**Date:** January 2026

---

## 1. Executive Summary

**MoneyMarketPro** is a sophisticated Peer-to-Peer (P2P) Lending Platform that connects borrowers seeking personal loans with investors looking for attractive returns. The platform facilitates the entire loan lifecycle - from application submission through funding, repayment, and completion.

### What It Does:
- **For Borrowers:** Submit loan applications, receive funding from multiple investors, manage repayments through digital wallets
- **For Lenders/Investors:** Browse marketplace of loan opportunities, invest in diversified portfolios, earn interest returns
- **For Administrators:** Review and approve loan applications, manage users, monitor platform health

### Key Value Proposition:
This application demonstrates enterprise-grade software engineering with Clean Architecture, Domain-Driven Design, CQRS pattern, and modern Angular development - representing the technical excellence expected in fintech production systems.

---

## 2. Complete Tech Stack

### Backend (.NET 8)
| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 8.0 | Core framework (Latest LTS) |
| ASP.NET Core Web API | 8.0 | REST API framework |
| Entity Framework Core | 8.0 | ORM / Data access |
| MediatR | 12.2.0 | CQRS pattern implementation |
| FluentValidation | 11.9.0 | Input validation |
| BCrypt.Net-Next | - | Password hashing |
| JWT Bearer | - | Authentication tokens |
| Swashbuckle | 6.5.0 | Swagger/OpenAPI documentation |
| SQL Server | - | Relational database |

### Frontend (Angular 17+)
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 17+ | SPA framework |
| TypeScript | 5.9 | Type-safe JavaScript |
| Angular Material | 21 | UI component library |
| RxJS | 7.8 | Reactive programming |
| Angular Signals | - | Modern state management |
| SCSS | - | CSS preprocessor |
| Vitest | - | Unit testing |

### Architecture Patterns
- Clean Architecture (5-layer)
- Domain-Driven Design (DDD)
- CQRS (Command Query Responsibility Segregation)
- Repository Pattern
- Result Pattern (Railway-oriented programming)

---

## 3. Backend Findings

### 3.1 Project Structure
```
/src
├── MoneyMarket.API              # REST API layer
├── MoneyMarket.Application      # CQRS handlers, use cases
├── MoneyMarket.Infrastructure   # External services
├── MoneyMarket.Persistence      # EF Core, database
└── MoneyMarket.Domain           # Core business logic
```

### 3.2 Architecture Pattern: Clean Architecture
The backend implements a strict Clean Architecture with dependency flow:

```
API → Application → Domain
        ↓
Infrastructure ← Persistence
```

**Key Files:**
- `src/MoneyMarket.API/Program.cs` - Application startup, DI configuration
- `src/MoneyMarket.Application/DependencyInjection.cs` - CQRS pipeline setup
- `src/MoneyMarket.Infrastructure/DependencyInjection.cs` - Service registration
- `src/MoneyMarket.Persistence/DependencyInjection.cs` - EF Core setup

### 3.3 Domain Layer (DDD)

**Entities (11 core entities):**
| Entity | File | Purpose |
|--------|------|---------|
| User | `/Domain/Entities/User.cs` | Core user with roles |
| Loan | `/Domain/Entities/Loan.cs` | Loan aggregate root |
| LoanApplication | `/Domain/Entities/LoanApplication.cs` | Application workflow |
| LoanFunding | `/Domain/Entities/LoanFunding.cs` | Investor contributions |
| Payment | `/Domain/Entities/Payment.cs` | Payment records |
| Wallet | `/Domain/Entities/Wallet.cs` | Digital wallet |
| WalletTransaction | `/Domain/Entities/WalletTransaction.cs` | Transaction history |
| BorrowerProfile | `/Domain/Entities/BorrowerProfile.cs` | Borrower details |
| LenderProfile | `/Domain/Entities/LenderProfile.cs` | Investor profile |
| PaymentSchedule | `/Domain/Entities/PaymentSchedule.cs` | Repayment schedule |
| RefreshToken | `/Domain/Entities/RefreshToken.cs` | JWT refresh tokens |

**Value Objects (8 types):**
- `Money` - Currency amount with validation
- `EmailAddress` - Email validation
- `InterestRate` - Interest rate calculations
- `LoanTerm` - Duration validation
- `RiskGrade` - Risk rating (A-E)
- `Percentage` - Percentage operations
- `PhoneNumber` - Phone validation
- `Address` - Physical address

**Base Abstractions:**
- `Entity<TId>` - Base entity
- `AggregateRoot<TId>` - Aggregate root with domain events
- `ValueObject` - Immutable value objects
- `StronglyTypedId` - Type-safe identifiers
- `Result<T>` - Railway-oriented error handling

**Key Files:**
- `/Domain/Common/AggregateRoot.cs`
- `/Domain/Common/Entity.cs`
- `/Domain/Common/ValueObject.cs`
- `/Domain/Common/Result.cs`

### 3.4 Application Layer (CQRS)

**Feature Structure:**
```
/Features
├── Auth/
│   ├── Commands/ (Register, Login, ChangePassword)
│   └── Queries/ (GetCurrentUser)
├── Borrowers/
│   ├── Commands/ (CreateProfile, UpdateProfile)
│   └── Queries/ (GetProfile)
├── Lenders/
│   ├── Commands/ (CreateProfile, UpdatePreferences)
│   └── Queries/ (GetProfile, GetInvestments)
├── LoanApplications/
│   ├── Commands/ (Create, Submit, Review)
│   └── Queries/ (GetById, GetPending)
├── Loans/
│   ├── Commands/ (Create, Fund, Disburse)
│   └── Queries/ (GetById, GetMarketplace)
└── Payments/
    ├── Commands/ (MakePayment)
    └── Queries/ (GetSchedule, GetHistory)
```

**Pipeline Behaviors (Cross-Cutting Concerns):**
1. `ValidationBehaviour` - FluentValidation integration
2. `LoggingBehaviour` - Request/response logging
3. `PerformanceBehaviour` - Query monitoring
4. `UnhandledExceptionBehaviour` - Global error handling

**Key Files:**
- `/Application/Common/Behaviours/ValidationBehaviour.cs`
- `/Application/Features/Loans/Commands/FundLoan/FundLoanCommand.cs`
- `/Application/Features/Auth/Commands/Login/LoginCommand.cs`

### 3.5 API Layer

**Controllers:**
| Controller | Route | Purpose |
|------------|-------|---------|
| AuthController | `/api/auth` | Authentication |
| LoansController | `/api/loans` | Loan management |
| LoanApplicationsController | `/api/loanapplications` | Application workflow |
| BorrowersController | `/api/borrowers` | Borrower profiles |
| LendersController | `/api/lenders` | Lender profiles |
| PaymentsController | `/api/payments` | Payment processing |
| WalletsController | `/api/wallets` | Wallet operations |
| AdminController | `/api/admin` | Administration |
| HealthController | `/health` | Health checks |

**Base Controller Features:**
- `ApiControllerBase` with Mediator integration
- `HandleResult<T>()` - Consistent response formatting
- Error mapping (404, 401, 403, 400)

### 3.6 Persistence Layer

**Entity Framework Configuration:**
- `ApplicationDbContext` - Main EF context
- 11 DbSets for all entities
- Fluent API configurations
- Custom value converters for Value Objects

**Interceptors:**
| Interceptor | Purpose |
|-------------|---------|
| AuditableEntityInterceptor | Auto-populate audit fields |
| SoftDeleteInterceptor | Global soft delete filter |
| DomainEventDispatcherInterceptor | Domain event dispatch |

**Key Files:**
- `/Persistence/ApplicationDbContext.cs`
- `/Persistence/Interceptors/AuditableEntityInterceptor.cs`
- `/Persistence/Configurations/LoanConfiguration.cs`

### 3.7 Infrastructure Services

| Service | Purpose |
|---------|---------|
| JwtTokenService | JWT generation/validation |
| AuthenticationService | Login/register logic |
| PasswordHasher | BCrypt password hashing |
| CurrentUserService | HttpContext user extraction |
| EmailService | Email notifications |
| CreditScoreService | Credit score calculations |
| KycVerificationService | Identity verification |
| PaymentGatewayService | Payment processing |

### 3.8 Security Implementation

**Authentication:**
- JWT Bearer tokens
- Refresh token rotation
- BCrypt password hashing
- Token expiration management

**Authorization Policies:**
- `BorrowerOnly` - Borrower access
- `LenderOnly` - Lender access
- `AdminOnly` - Admin access
- `Staff` - CRM/Admin/Support
- `BorrowerOrLender` - Combined access

---

## 4. Frontend Findings

### 4.1 Project Structure
```
/client/src/app
├── core/
│   ├── guards/          # Route protection
│   ├── interceptors/    # HTTP interceptors
│   ├── models/          # TypeScript interfaces
│   └── services/        # Core services
├── features/
│   ├── auth/            # Login/Register
│   ├── public/          # Landing page
│   ├── borrower/        # Borrower dashboard/features
│   ├── lender/          # Lender dashboard/features
│   ├── admin/           # Admin panel
│   └── shared/          # Shared components
└── layouts/             # Page layouts
```

### 4.2 State Management (Angular Signals)

**AuthService Implementation:**
```typescript
// Using Angular Signals for reactive state
accessToken = signal<string | null>(null);
currentUserSignal = signal<User | null>(null);
isLoadingSignal = signal<boolean>(false);

// Computed properties
isAuthenticated = computed(() => !!this.accessToken());
userRoles = computed(() => this.currentUserSignal()?.roles ?? []);
```

**Key File:** `/core/services/auth.service.ts`

### 4.3 Routing Architecture

**Role-based routing with lazy loading:**
- `/borrower/*` - Protected by `borrowerGuard`
- `/lender/*` - Protected by `lenderGuard`
- `/admin/*` - Protected by `adminGuard`
- All feature routes use lazy loading

**Guards:**
| Guard | Purpose |
|-------|---------|
| authGuard | Requires authentication |
| guestGuard | Redirects authenticated users |
| borrowerGuard | Borrower-only routes |
| lenderGuard | Lender-only routes |
| adminGuard | Admin/CRM routes |

**Key File:** `/core/guards/auth.guard.ts`

### 4.4 HTTP Interceptor

**Features:**
- Automatic Bearer token injection
- 401 response handling with token refresh
- Request retry after refresh
- Logout on refresh failure

**Key File:** `/core/interceptors/auth.interceptor.ts`

### 4.5 Feature Components

**Borrower Features:**
| Component | Purpose |
|-----------|---------|
| BorrowerDashboardComponent | Stats, quick actions |
| LoanApplicationComponent | Multi-step loan wizard |
| ApplicationsListComponent | Track applications |
| LoansListComponent | Active loans |
| LoanDetailComponent | Loan details, payments |
| WalletComponent | Wallet management |

**Lender Features:**
| Component | Purpose |
|-----------|---------|
| LenderDashboardComponent | Portfolio overview |
| MarketplaceComponent | Browse loan opportunities |
| LoanInvestComponent | Make investments |
| InvestmentsListComponent | Portfolio tracking |

**Admin Features:**
| Component | Purpose |
|-----------|---------|
| AdminDashboardComponent | Platform metrics |
| ApplicationsQueueComponent | Review queue |
| ApplicationReviewComponent | Approve/reject |
| UserManagementComponent | User administration |
| LoansManagementComponent | Loan oversight |

### 4.6 UI/UX Implementation

**Technology:**
- Angular Material 21
- SCSS with variables
- Responsive design
- Halifax Bank-inspired theming

**Material Components Used:**
- MatCard - Card layouts
- MatTable - Data tables
- MatDialog - Modal dialogs
- MatForm - Form inputs
- MatButton - Action buttons
- MatIcon - Iconography
- MatProgressSpinner - Loading states

### 4.7 Form Handling

**Approach:** Reactive Forms
- FormBuilder for complex forms
- Multi-step wizards
- Real-time validation
- Custom validators

---

## 5. Proposed Site Structure

### 5.1 index.html (Landing Page)

**Sections:**
1. **Hero** - App name, tagline, "Developed by Faz Ahmed" badge, tech stack icons
2. **About Developer** - Brief intro, link to dotnetdeveloper.co.uk
3. **Project Overview** - 2-3 paragraphs about MoneyMarketPro
4. **Key Highlights** - 6 impressive bullet points
5. **Navigation Cards** - Links to Backend/Frontend pages
6. **Footer** - Copyright, attribution, disclaimer

### 5.2 backend.html (Technical Deep Dive)

**Sections:**
1. **Hero** - Title, demo disclaimer
2. **Architecture Overview** - Clean Architecture diagram
3. **Domain-Driven Design** - Entities, Value Objects, Aggregates
4. **CQRS Pattern** - Commands, Queries, Pipeline
5. **API Design** - Controllers, REST practices
6. **Data Layer** - EF Core, Interceptors, Configurations
7. **Security** - JWT, Authorization policies
8. **Code Quality** - SOLID, Error handling
9. **Footer** - Full attribution

### 5.3 frontend.html (Feature Showcase)

**Sections:**
1. **Hero** - Title, sample data note
2. **Application Overview** - Target users, value proposition
3. **Feature Showcase** - Borrower, Lender, Admin features
4. **Technical Highlights** - Angular patterns, Signals, Guards
5. **Component Architecture** - Structure diagram
6. **Screenshot Gallery** - UI screenshots with captions
7. **Footer** - Full attribution

---

## 6. Best Code Snippets to Showcase

### 6.1 Backend Snippets

| Pattern | File | Lines | Why It Matters |
|---------|------|-------|----------------|
| Aggregate Root | `/Domain/Common/AggregateRoot.cs` | ~30 | Shows DDD implementation |
| Value Object | `/Domain/ValueObjects/Money.cs` | ~25 | Immutability, validation |
| CQRS Command | `/Application/Features/Loans/Commands/FundLoan/FundLoanCommand.cs` | ~40 | Command pattern |
| CQRS Handler | `/Application/Features/Loans/Commands/FundLoan/FundLoanCommandHandler.cs` | ~50 | Handler implementation |
| Validation Pipeline | `/Application/Common/Behaviours/ValidationBehaviour.cs` | ~30 | Cross-cutting concerns |
| Result Pattern | `/Domain/Common/Result.cs` | ~40 | Error handling |
| Entity Configuration | `/Persistence/Configurations/LoanConfiguration.cs` | ~40 | EF Fluent API |
| JWT Service | `/Infrastructure/Services/JwtTokenService.cs` | ~50 | Security implementation |
| Base Controller | `/API/Controllers/ApiControllerBase.cs` | ~40 | API patterns |
| Auditable Interceptor | `/Persistence/Interceptors/AuditableEntityInterceptor.cs` | ~30 | Audit trail |

### 6.2 Frontend Snippets

| Pattern | File | Lines | Why It Matters |
|---------|------|-------|----------------|
| Auth Service with Signals | `/core/services/auth.service.ts` | ~50 | Modern state management |
| Route Guards | `/core/guards/auth.guard.ts` | ~40 | Security patterns |
| HTTP Interceptor | `/core/interceptors/auth.interceptor.ts` | ~40 | Token management |
| Reactive Forms | `/features/borrower/apply/loan-application.component.ts` | ~50 | Form handling |
| Standalone Component | `/features/borrower/dashboard/borrower-dashboard.component.ts` | ~40 | Modern Angular |

---

## 7. Recommended Screenshots

### 7.1 Public Pages
| ID | Page | Route | State | Capture | Filename |
|----|------|-------|-------|---------|----------|
| SS-01 | Landing Page | `/` | Guest | Full page | `landing.png` |
| SS-02 | Login Page | `/login` | Guest | Full page | `login.png` |
| SS-03 | Register Page | `/register` | Guest | Full page | `register.png` |

### 7.2 Borrower Flow
| ID | Page | Route | State | Capture | Filename |
|----|------|-------|-------|---------|----------|
| SS-04 | Borrower Dashboard | `/borrower/dashboard` | Logged in as Borrower | Full page | `borrower-dashboard.png` |
| SS-05 | Loan Application Form | `/borrower/apply` | Logged in | Form steps | `loan-application.png` |
| SS-06 | Applications List | `/borrower/applications` | With applications | Full page | `borrower-applications.png` |
| SS-07 | Active Loans | `/borrower/loans` | With loans | Full page | `borrower-loans.png` |
| SS-08 | Loan Detail | `/borrower/loans/:id` | With active loan | Full page | `loan-detail.png` |
| SS-09 | Borrower Wallet | `/borrower/wallet` | With balance | Full page | `borrower-wallet.png` |

### 7.3 Lender Flow
| ID | Page | Route | State | Capture | Filename |
|----|------|-------|-------|---------|----------|
| SS-10 | Lender Dashboard | `/lender/dashboard` | Logged in as Lender | Full page | `lender-dashboard.png` |
| SS-11 | Loan Marketplace | `/lender/marketplace` | With available loans | Full page | `marketplace.png` |
| SS-12 | Investment Detail | `/lender/marketplace/:id` | Selected loan | Full page | `investment-detail.png` |
| SS-13 | My Investments | `/lender/investments` | With investments | Full page | `my-investments.png` |
| SS-14 | Lender Wallet | `/lender/wallet` | With balance | Full page | `lender-wallet.png` |

### 7.4 Admin Flow
| ID | Page | Route | State | Capture | Filename |
|----|------|-------|-------|---------|----------|
| SS-15 | Admin Dashboard | `/admin/dashboard` | Logged in as Admin | Full page | `admin-dashboard.png` |
| SS-16 | Applications Queue | `/admin/applications` | With pending | Full page | `applications-queue.png` |
| SS-17 | Application Review | `/admin/applications/:id` | Review mode | Full page | `application-review.png` |
| SS-18 | User Management | `/admin/users` | With users | Full page | `user-management.png` |
| SS-19 | Loans Management | `/admin/loans` | With loans | Full page | `loans-management.png` |

### 7.5 Technical Screenshots
| ID | Page | Tool | Capture | Filename |
|----|------|------|---------|----------|
| SS-20 | Swagger API Docs | `/swagger` | API documentation | `swagger-api.png` |
| SS-21 | API Health | `/health` | Health check response | `health-check.png` |

---

## 8. Design & Styling Decisions

### Color Scheme (Proposed)
```css
--primary: #0d3880       /* Deep blue - trust, finance */
--secondary: #00a0d2     /* Bright blue - modern tech */
--accent: #28a745        /* Green - money, success */
--dark: #1a1a2e          /* Dark background */
--light: #f8f9fa         /* Light background */
--text: #2d3748          /* Body text */
--muted: #718096         /* Secondary text */
```

### Typography
- **Headings:** Inter or Poppins (Google Fonts)
- **Body:** System fonts for performance
- **Code:** JetBrains Mono or Fira Code

### Design Elements
- Card-based layouts
- Subtle shadows and gradients
- Code syntax highlighting (Prism.js)
- Responsive breakpoints
- "Demo Version" badges (GitHub badge style)
- Developer branding throughout

---

## 9. Key Highlights for Landing Page

1. **Enterprise-Grade Clean Architecture** - 5-layer separation with strict dependency flow
2. **Domain-Driven Design** - Rich domain model with 11 entities, 8 value objects, aggregate roots
3. **CQRS with MediatR** - Command/Query separation with 20+ handlers and pipeline behaviors
4. **Modern Angular 17+** - Standalone components, Signals state management, lazy loading
5. **Production-Ready Security** - JWT authentication, role-based authorization, BCrypt hashing
6. **Full-Stack TypeScript/C#** - End-to-end type safety with shared models

---

## 10. File Output Structure

```
portfolio-demo/
├── index.html          # Landing page
├── backend.html        # Technical deep dive
├── frontend.html       # Feature showcase
├── styles.css          # Shared styles
├── README.md           # Usage instructions
├── PLAN.md             # This document
├── SCREENSHOTS.md      # Screenshot guide
├── LICENSE.md          # Copyright notice
└── screenshots/        # Screenshot images
    └── .gitkeep
```

---

## Phase 1 Complete - Awaiting Approval

**Findings Summary:**
- Comprehensive full-stack P2P lending platform
- Clean Architecture + DDD + CQRS backend
- Modern Angular 17+ frontend with Signals
- 11 domain entities, 20+ CQRS handlers
- 5 user roles with complete feature sets
- Production-ready authentication and security

**Ready to proceed to Phase 2:** Backend Documentation (backend.html)

Please review this plan and confirm:
1. Is the structure acceptable?
2. Any sections to add/remove?
3. Any specific code patterns to highlight?
4. Preferred color scheme/styling?

---

*Document prepared for Faz Ahmed | dotnetdeveloper.co.uk*
