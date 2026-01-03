export interface Wallet {
  userId: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId: string | null;
  status: TransactionStatus;
  createdAt: string;
}

export type TransactionType =
  | 'Deposit'
  | 'Withdrawal'
  | 'LoanFunding'
  | 'LoanRepayment'
  | 'Interest'
  | 'Fee'
  | 'Refund';

export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled';

export interface DepositRequest {
  amount: number;
  paymentMethod: string;
}

export interface WithdrawRequest {
  amount: number;
  bankAccount: string;
}
