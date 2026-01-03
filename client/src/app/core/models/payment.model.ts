export interface Payment {
  id: string;
  loanId: string;
  borrowerId: string;
  amount: number;
  principal: number;
  interest: number;
  lateFee: number;
  status: PaymentStatus;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: string | null;
  transactionId: string | null;
}

export type PaymentStatus = 'Pending' | 'Paid' | 'Late' | 'Missed' | 'Partial';

export interface ProcessPaymentRequest {
  loanId: string;
  amount: number;
  paymentMethod: string;
}

export interface UpcomingPayment {
  loanId: string;
  loanPurpose: string;
  dueDate: string;
  amount: number;
  remainingBalance: number;
}
