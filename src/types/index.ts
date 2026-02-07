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

  // Location
  location?: {
    lat: number;
    lng: number;
    address?: string; // Optional reverse geocoded address
    city?: string;
    country?: string;
    countryCode?: string; // ISO code for flag etc.
  };
}

export interface RatesResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export const SUPPORTED_CURRENCIES = [
  'USD', // US Dollar
  'EUR', // Euro
  'CNY', // Chinese Yuan
  'JPY', // Japanese Yen
  'KRW', // South Korean Won
  'SGD', // Singapore Dollar
  'HKD', // Hong Kong Dollar
  'TWD', // Taiwan Dollar
  'THB', // Thai Baht
  'MYR', // Malaysian Ringgit
  'IDR', // Indonesian Rupiah
  'PHP', // Philippine Peso
  'VND', // Vietnamese Dong
  'INR', // Indian Rupee
  'GBP', // British Pound
  'AUD', // Australian Dollar
  'CAD', // Canadian Dollar
];

export const CURRENCY_NAMES: Record<string, string> = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'CNY': 'Chinese Yuan',
  'JPY': 'Japanese Yen',
  'KRW': 'South Korean Won',
  'SGD': 'Singapore Dollar',
  'HKD': 'Hong Kong Dollar',
  'TWD': 'Taiwan Dollar',
  'THB': 'Thai Baht',
  'MYR': 'Malaysian Ringgit',
  'IDR': 'Indonesian Rupiah',
  'PHP': 'Philippine Peso',
  'VND': 'Vietnamese Dong',
  'INR': 'Indian Rupee',
  'GBP': 'British Pound',
  'AUD': 'Australian Dollar',
  'CAD': 'Canadian Dollar',
};


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
