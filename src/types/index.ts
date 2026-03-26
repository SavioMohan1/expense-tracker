export interface Transaction {
  id: string;
  amount: number;
  category_id: string;
  description: string;
  date: string;
  payment_method: PaymentMethod;
  is_auto_detected: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  period: 'monthly';
  created_at: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

export interface AppSettings {
  currency: string;
  notificationsEnabled: boolean;
  budgetAlertThreshold: number;
}

export interface DetectedExpense {
  amount: number;
  merchant?: string;
  rawText: string;
}

export interface MonthlyAnalytics {
  month: string;
  total: number;
  byCategory: CategorySpending[];
}

export interface CategorySpending {
  category_id: string;
  total: number;
}

export interface WeeklyAnalytics {
  week: string;
  total: number;
}
