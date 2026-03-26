import { Category } from '../types';

export const BUILT_IN_CATEGORIES: Category[] = [
  { id: 'food', label: 'Food & Dining', icon: 'food-fork-drink', color: '#FF6B6B' },
  { id: 'transport', label: 'Transport', icon: 'car', color: '#4ECDC4' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping', color: '#45B7D1' },
  { id: 'bills', label: 'Bills', icon: 'receipt', color: '#96CEB4' },
  { id: 'health', label: 'Health', icon: 'heart-pulse', color: '#FF8B94' },
  { id: 'entertainment', label: 'Entertainment', icon: 'gamepad-variant', color: '#A8E6CF' },
  { id: 'travel', label: 'Travel', icon: 'airplane', color: '#FFD93D' },
  { id: 'others', label: 'Others', icon: 'dots-horizontal', color: '#C9CBFF' },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];
