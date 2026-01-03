# MoneyMarket - P2P Lending Platform

A comprehensive **Peer-to-Peer Lending Marketplace** built with .NET 8, demonstrating enterprise-grade software architecture and modern development practices.

## Architecture

This project implements **Clean Architecture** with **Domain-Driven Design (DDD)** principles, ensuring separation of concerns, testability, and maintainability.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation                             │
│                     (MoneyMarket.API)                           │
│         Controllers, Middleware, Authorization                  │
├─────────────────────────────────────────────────────────────────┤
│                        Application                              │
│                  (MoneyMarket.Application)                      │
│     CQRS Commands/Queries, Handlers, Validators, DTOs          │
├─────────────────────────────────────────────────────────────────┤
│                          Domain                                 │
│                    (MoneyMarket.Domain)                         │
│      Entities, Value Objects, Aggregates, Domain Events        │
├─────────────────────────────────────────────────────────────────┤
│                       Infrastructure                            │
│    (MoneyMarket.Infrastructure + MoneyMarket.Persistence)      │
│     External Services, EF Core, Repositories, Auth             │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | .NET 8, ASP.NET Core Web API |
| **Architecture** | Clean Architecture, CQRS, DDD |
| **Authentication** | JWT Bearer Tokens, Refresh Token Rotation |
| **Authorization** | Policy-based Role Authorization |
| **Data Access** | Entity Framework Core 8, In-Memory Database |
| **Validation** | FluentValidation |
| **Mediator** | MediatR (Command/Query dispatching) |
| **Documentation** | Swagger/OpenAPI with XML comments |
| **Testing** | xUnit, FluentAssertions |
| **Security** | BCrypt password hashing, HTTP-only cookies |

## Features

### Authentication & Authorization
- JWT access tokens with configurable expiration
- Secure refresh token rotation stored in HTTP-only cookies
- BCrypt password hashing with strength validation
- Role-based authorization policies (Borrower, Lender, CRM, Admin, Support)

### Domain Model
- **Users** - Multi-role support, profile management
- **Borrower Profiles** - KYC verification, employment info, credit scoring
- **Lender Profiles** - Investment preferences, accreditation status
- **Loan Applications** - Full workflow (Draft → Submitted → Under Review → Approved/Rejected)
- **Loans** - Marketplace listing, funding, disbursement, repayment schedules
- **Payments** - Payment processing, history tracking
- **Wallets** - Balance management, transaction history

### API Endpoints

#### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user account |
| POST | `/api/auth/login` | Authenticate and receive tokens |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/auth/change-password` | Change password (authenticated) |
| GET | `/api/auth/me` | Get current user info |

#### Borrowers (Borrower Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/borrowers` | Create borrower profile |
| GET | `/api/borrowers/{id}` | Get borrower profile |
| PUT | `/api/borrowers/{id}` | Update borrower profile |

#### Lenders (Lender Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lenders` | Create lender profile |
| GET | `/api/lenders/{id}` | Get lender profile |
| PUT | `/api/lenders/{id}/preferences` | Update investment preferences |
| GET | `/api/lenders/{id}/investments` | Get lender investments |

#### Loan Applications (Mixed Roles)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/loanapplications` | Create application (Borrower) |
| POST | `/api/loanapplications/{id}/submit` | Submit for review (Borrower) |
| GET | `/api/loanapplications/pending` | Get pending applications (CRM/Admin) |
| POST | `/api/loanapplications/{id}/approve` | Approve application (CRM/Admin) |
| POST | `/api/loanapplications/{id}/reject` | Reject application (CRM/Admin) |

#### Loans (Mixed Roles)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans/marketplace` | Browse available loans (Lender) |
| POST | `/api/loans/{id}/fund` | Fund a loan (Lender) |
| POST | `/api/loans/{id}/disburse` | Disburse to borrower (CRM/Admin) |

#### Wallets (Borrower/Lender)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallets/{userId}` | Get wallet balance |
| GET | `/api/wallets/{userId}/transactions` | Get transaction history |
| POST | `/api/wallets/{userId}/deposit` | Deposit funds |
| POST | `/api/wallets/{userId}/withdraw` | Withdraw funds |

## Project Structure

```
MoneyMarketPro/
├── src/
│   ├── MoneyMarket.Domain/           # Enterprise business rules
│   │   ├── Common/                   # Base classes (Entity, ValueObject, Result)
│   │   ├── Entities/                 # Domain entities and aggregates
│   │   ├── ValueObjects/             # Immutable value objects
│   │   ├── Enums/                    # Domain enumerations
│   │   └── Events/                   # Domain events
│   │
│   ├── MoneyMarket.Application/      # Application business rules
│   │   ├── Common/
│   │   │   ├── Behaviours/           # MediatR pipeline behaviors
│   │   │   ├── Exceptions/           # Application exceptions
│   │   │   └── Interfaces/           # Abstractions for infrastructure
│   │   └── Features/                 # CQRS commands and queries
│   │       ├── Auth/
│   │       ├── Borrowers/
│   │       ├── Lenders/
│   │       ├── LoanApplications/
│   │       ├── Loans/
│   │       ├── Payments/
│   │       └── Wallets/
│   │
│   ├── MoneyMarket.Infrastructure/   # External concerns
│   │   ├── Configuration/            # Settings classes
│   │   └── Services/                 # Service implementations
│   │
│   ├── MoneyMarket.Persistence/      # Data access
│   │   ├── Configurations/           # EF Core entity configurations
│   │   └── Interceptors/             # SaveChanges interceptors
│   │
│   └── MoneyMarket.API/              # Presentation layer
│       ├── Authorization/            # Policy constants
│       ├── Controllers/              # API controllers
│       └── Middleware/               # Exception handling
│
└── tests/
    ├── MoneyMarket.Domain.Tests/     # Domain unit tests
    ├── MoneyMarket.Application.Tests/# Application unit tests
    └── MoneyMarket.API.IntegrationTests/  # API integration tests
```

## Design Patterns & Practices

| Pattern | Implementation |
|---------|---------------|
| **CQRS** | Separate Command and Query models with MediatR |
| **Result Pattern** | Explicit success/failure handling without exceptions |
| **Strongly Typed IDs** | Type-safe entity identifiers (UserId, LoanId, etc.) |
| **Value Objects** | Immutable domain concepts (Money, EmailAddress, RiskGrade) |
| **Domain Events** | Decoupled domain notifications |
| **Repository Pattern** | Abstracted data access via DbContext |
| **Unit of Work** | EF Core's DbContext transaction management |
| **Pipeline Behaviors** | Cross-cutting concerns (logging, validation, performance) |

## Getting Started

### Prerequisites
- .NET 8 SDK
- Visual Studio 2022 / VS Code / Rider

### Run the API

```bash
# Clone the repository
git clone https://github.com/yourusername/MoneyMarketPro.git
cd MoneyMarketPro

# Build the solution
dotnet build

# Run tests
dotnet test

# Start the API
cd src/MoneyMarket.API
dotnet run
```

### Access the API
- **Swagger UI**: http://localhost:5133/swagger
- **Health Check**: http://localhost:5133/api/health

### Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:5133/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:5133/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

## Configuration

### JWT Settings (appsettings.json)
```json
{
  "Jwt": {
    "Secret": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "MoneyMarket.API",
    "Audience": "MoneyMarket.Client",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

## Testing

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test project
dotnet test tests/MoneyMarket.Domain.Tests
```

**Test Coverage:**
- 32 Domain unit tests (Value Objects, Entities, Result pattern)
- 1 API integration test (Health endpoint)

## Key Implementation Highlights

### Strongly Typed IDs
```csharp
public readonly record struct UserId(Guid Value) : IStronglyTypedId<Guid>
{
    public static UserId New() => new(Guid.NewGuid());
    public static UserId From(Guid value) => new(value);
}
```

### Result Pattern
```csharp
public Result<Loan> ApproveLoan(Money amount, InterestRate rate)
{
    if (Status != LoanStatus.UnderReview)
        return Result.Failure<Loan>(DomainErrors.Loan.InvalidStatus);

    var loan = Loan.Create(this, amount, rate);
    return Result.Success(loan);
}
```

### Value Objects
```csharp
public sealed class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    public static Money operator +(Money a, Money b) =>
        new(a.Amount + b.Amount, a.Currency);
}
```

### CQRS with MediatR
```csharp
// Command
public record CreateLoanApplicationCommand(
    Guid BorrowerProfileId,
    decimal Amount,
    int TermMonths,
    LoanPurpose Purpose) : ICommand<Guid>;

// Handler
public class CreateLoanApplicationCommandHandler
    : ICommandHandler<CreateLoanApplicationCommand, Guid>
{
    public async Task<Result<Guid>> Handle(
        CreateLoanApplicationCommand request,
        CancellationToken cancellationToken) { ... }
}
```

## License

This project is licensed under the MIT License.

---

Built with .NET 8 | Clean Architecture | Domain-Driven Design
