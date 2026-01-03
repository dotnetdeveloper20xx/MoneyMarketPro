export interface LoanApplication {
  id: string;
  borrowerId: string;
  borrowerName: string;
  amount: number;
  purpose: string;
  description: string;
  termMonths: number;
  requestedInterestRate: number;
  status: LoanApplicationStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export type LoanApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export interface CreateLoanApplicationRequest {
  amount: number;
  purpose: string;
  description: string;
  termMonths: number;
  requestedInterestRate: number;
}

export interface Loan {
  id: string;
  applicationId: string;
  borrowerId: string;
  borrowerName: string;
  amount: number;
  fundedAmount: number;
  interestRate: number;
  termMonths: number;
  purpose: string;
  status: LoanStatus;
  monthlyPayment: number;
  totalRepayment: number;
  remainingBalance: number;
  nextPaymentDate: string | null;
  nextPaymentAmount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  fundingProgress: number;
}

export type LoanStatus =
  | 'PendingFunding'
  | 'FullyFunded'
  | 'Active'
  | 'Completed'
  | 'Defaulted'
  | 'Cancelled';

export interface MarketplaceLoan {
  id: string;
  borrowerCreditScore: number;
  amount: number;
  fundedAmount: number;
  interestRate: number;
  termMonths: number;
  purpose: string;
  riskGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  fundingProgress: number;
  daysRemaining: number;
  createdAt: string;
}

export interface FundLoanRequest {
  amount: number;
}
