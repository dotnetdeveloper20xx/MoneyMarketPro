import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BorrowerProfile,
  CreateBorrowerProfileRequest,
  UpdateBorrowerProfileRequest,
  LenderProfile,
  CreateLenderProfileRequest,
  UpdateLenderPreferencesRequest,
  Investment,
  LoanApplication,
  CreateLoanApplicationRequest,
  Loan,
  MarketplaceLoan,
  FundLoanRequest,
  Payment,
  ProcessPaymentRequest,
  UpcomingPayment,
  Wallet,
  WalletTransaction,
  DepositRequest,
  WithdrawRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ============================================
  // Borrower Endpoints
  // ============================================

  createBorrowerProfile(data: CreateBorrowerProfileRequest): Observable<BorrowerProfile> {
    return this.http.post<BorrowerProfile>(`${this.apiUrl}/borrowers`, data);
  }

  getBorrowerProfile(id: string): Observable<BorrowerProfile> {
    return this.http.get<BorrowerProfile>(`${this.apiUrl}/borrowers/${id}`);
  }

  getBorrowerProfileByUserId(userId: string): Observable<BorrowerProfile> {
    return this.http.get<BorrowerProfile>(`${this.apiUrl}/borrowers/by-user/${userId}`);
  }

  updateBorrowerProfile(id: string, data: UpdateBorrowerProfileRequest): Observable<BorrowerProfile> {
    return this.http.put<BorrowerProfile>(`${this.apiUrl}/borrowers/${id}`, data);
  }

  // ============================================
  // Lender Endpoints
  // ============================================

  createLenderProfile(data: CreateLenderProfileRequest): Observable<LenderProfile> {
    return this.http.post<LenderProfile>(`${this.apiUrl}/lenders`, data);
  }

  getLenderProfile(id: string): Observable<LenderProfile> {
    return this.http.get<LenderProfile>(`${this.apiUrl}/lenders/${id}`);
  }

  getLenderProfileByUserId(userId: string): Observable<LenderProfile> {
    return this.http.get<LenderProfile>(`${this.apiUrl}/lenders/by-user/${userId}`);
  }

  updateLenderPreferences(id: string, data: UpdateLenderPreferencesRequest): Observable<LenderProfile> {
    return this.http.put<LenderProfile>(`${this.apiUrl}/lenders/${id}/preferences`, data);
  }

  getLenderInvestments(id: string): Observable<Investment[]> {
    return this.http.get<Investment[]>(`${this.apiUrl}/lenders/${id}/investments`);
  }

  // ============================================
  // Loan Application Endpoints
  // ============================================

  createLoanApplication(data: CreateLoanApplicationRequest): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${this.apiUrl}/loanapplications`, data);
  }

  getLoanApplication(id: string): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.apiUrl}/loanapplications/${id}`);
  }

  getBorrowerApplications(borrowerId: string): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/loanapplications/borrower/${borrowerId}`);
  }

  submitLoanApplication(id: string): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${this.apiUrl}/loanapplications/${id}/submit`, {});
  }

  getPendingApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/loanapplications/pending`);
  }

  startApplicationReview(id: string): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${this.apiUrl}/loanapplications/${id}/start-review`, {});
  }

  approveApplication(id: string): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${this.apiUrl}/loanapplications/${id}/approve`, {});
  }

  rejectApplication(id: string, reason: string): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${this.apiUrl}/loanapplications/${id}/reject`, { reason });
  }

  // ============================================
  // Loan Endpoints
  // ============================================

  createLoan(applicationId: string): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/loans`, { applicationId });
  }

  getLoan(id: string): Observable<Loan> {
    return this.http.get<Loan>(`${this.apiUrl}/loans/${id}`);
  }

  getBorrowerLoans(borrowerId: string): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loans/borrower/${borrowerId}`);
  }

  getMarketplaceLoans(params?: {
    minAmount?: number;
    maxAmount?: number;
    minRate?: number;
    maxRate?: number;
    riskGrade?: string;
  }): Observable<MarketplaceLoan[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<MarketplaceLoan[]>(`${this.apiUrl}/loans/marketplace`, { params: httpParams });
  }

  fundLoan(id: string, data: FundLoanRequest): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/loans/${id}/fund`, data);
  }

  disburseLoan(id: string): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/loans/${id}/disburse`, {});
  }

  // ============================================
  // Payment Endpoints
  // ============================================

  processPayment(data: ProcessPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments`, data);
  }

  getLoanPayments(loanId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/payments/loan/${loanId}`);
  }

  getUpcomingPayments(borrowerProfileId: string): Observable<UpcomingPayment[]> {
    return this.http.get<UpcomingPayment[]>(`${this.apiUrl}/payments/upcoming/${borrowerProfileId}`);
  }

  // ============================================
  // Wallet Endpoints
  // ============================================

  getWallet(userId: string): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.apiUrl}/wallets/${userId}`);
  }

  getWalletTransactions(userId: string): Observable<WalletTransaction[]> {
    return this.http.get<WalletTransaction[]>(`${this.apiUrl}/wallets/${userId}/transactions`);
  }

  deposit(userId: string, data: DepositRequest): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets/${userId}/deposit`, data);
  }

  withdraw(userId: string, data: WithdrawRequest): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets/${userId}/withdraw`, data);
  }
}
