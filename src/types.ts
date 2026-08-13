export type TransactionType = 'TRANSFER' | 'TOPUP' | 'PAYMENT_QRIS' | 'PPOB' | 'INCOME';

export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export type PpobCategory = 'PULSA' | 'DATA' | 'PLN' | 'PDAM' | 'EWALLET' | 'GAME';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  accountNumber: string;
  balance: number;
  qrCodeData: string;
  pin: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  referenceId: string;
  date: string; // ISO string
  type: TransactionType;
  category: string;
  title: string;
  amount: number;
  fee: number;
  total: number;
  status: TransactionStatus;
  senderName?: string;
  senderAccount?: string;
  recipientName?: string;
  recipientAccount?: string;
  recipientProvider?: string;
  notes?: string;
  paymentMethod?: string;
}

export interface PpobProduct {
  id: string;
  category: PpobCategory;
  provider: string;
  name: string;
  nominal: number;
  price: number;
  adminFee: number;
  description: string;
  badge?: string;
}

export interface SheetsConfig {
  webAppUrl: string;
  isConnected: boolean;
  lastSyncTime?: string;
  autoSync: boolean;
}

export interface BankOrEwallet {
  id: string;
  name: string;
  code: string;
  category: 'BANK' | 'EWALLET';
  iconColor: string;
}
