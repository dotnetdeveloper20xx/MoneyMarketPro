export interface Wallet {
  walletId: string;
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  reservedBalance: number;
  totalBalance: number;
  lastUpdatedAt: string;
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
  reference?: string;
}

export interface WithdrawRequest {
  amount: number;
  bankAccountReference?: string;
}
