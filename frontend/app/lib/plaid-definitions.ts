// Type definitions for Plaid/Compound Go backend data
// These types match the Go models in compound/go-server/pkg/models/

export interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  user_id: number;
  plaid_access_token: string;
  plaid_item_id: string;
  plaid_institution_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  transactions_cursor: string | null;
}

export interface Account {
  id: number;
  item_id: number;
  plaid_account_id: string;
  institution_name: string | null;
  name: string;
  mask: string;
  official_name: string | null;
  current_balance: number | null;
  available_balance: number | null;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  type: AccountType;
  subtype: string;
  created_at: string;
  updated_at: string;
}

export type AccountType =
  | 'depository'
  | 'credit'
  | 'loan'
  | 'investment'
  | 'brokerage'
  | 'other';

export interface Transaction {
  id: number;
  account_id: number;
  plaid_transaction_id: string;
  plaid_category_id: string | null;
  category: string | null;
  primary_category: string | null;
  type: string;
  name: string;
  amount: number;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  date: string;
  pending: boolean;
  account_owner: string | null;
  created_at: string;
  updated_at: string;
}

// API Response types

export interface LinkTokenResponse {
  link_token: string;
  expiration: string;
}

export interface ExchangeTokenRequest {
  public_token: string;
  user_id: number;
}

export interface SyncTransactionsResponse {
  added: number;
  modified: number;
  removed: number;
}

// Aggregated/computed types for UI

export interface FinancialSummary {
  total_balance: number;
  total_cash: number;
  total_credit_debt: number;
  net_worth: number;
}

export interface SpendingByCategory {
  category: string;
  amount: number;
}

export interface AccountWithInstitution extends Account {
  institution_id: string;
  institution_name?: string;
}
