export interface LenderProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  preferences: LenderPreferences;
  totalInvested: number;
  activeInvestments: number;
  createdAt: string;
}

export interface LenderPreferences {
  minInterestRate: number;
  maxInterestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  preferredTerms: number[];
  riskTolerance: 'Low' | 'Medium' | 'High';
  autoInvestEnabled: boolean;
}

export interface CreateLenderProfileRequest {
  phoneNumber: string;
}

export interface UpdateLenderPreferencesRequest {
  minInterestRate: number;
  maxInterestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  preferredTerms: number[];
  riskTolerance: string;
  autoInvestEnabled: boolean;
}

export interface Investment {
  id: string;
  loanId: string;
  lenderId: string;
  amount: number;
  interestRate: number;
  expectedReturn: number;
  status: 'Active' | 'Completed' | 'Defaulted';
  investedAt: string;
  borrowerName: string;
  loanPurpose: string;
}
