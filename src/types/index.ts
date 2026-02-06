export interface Expense {
  id: string;
  date: string; // ISO string
  description: string;
  category: string;

  // Math fields
  totalAmount: number;     // Full receipt amount
  paidBy: 'me' | 'other';  // Who paid originally
  myShare: number;         // How much of this was FOR YOU

  // Currency
  currency: string;       // 'USD', 'EUR', etc.

  // Optional notes
  notes?: string;
}

export interface RatesResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD'];

export type ExpenseSummary = {
  totalSpent: number;      // Actual consumption (sum of myShare)
  totalOwedToMe: number;   // (paidBy=me) - myShare
  totalIOwe: number;       // (paidBy=other) && myShare
  netBalance: number;      // totalOwedToMe - totalIOwe
}

export const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Entertainment',
  'Shopping',
  'Groceries',
  'Bills & Utilities',
  'Travel',
  'Other'
];
