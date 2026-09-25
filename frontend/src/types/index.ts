export type PaymentOperator = 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'VISA_CARD';

export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: number;
  reference: string;
  external_reference?: string;
  amount: number;
  fee: number;
  currency: string;
  operator: PaymentOperator;
  status: PaymentStatus;
  customer_phone: string;
  customer_email?: string;
  created_at: string;
}

export interface MetricCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}
