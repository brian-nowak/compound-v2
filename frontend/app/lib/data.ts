// Placeholder data functions
// These will be replaced with Plaid API calls in Phase 2
// For now, return empty/mock data to allow the app to build

import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue(): Promise<Revenue[]> {
  // Return empty array - will be replaced with spending data
  return [];
}

export async function fetchLatestInvoices(): Promise<LatestInvoice[]> {
  // Return empty array - will be replaced with recent transactions
  return [];
}

export async function fetchCardData() {
  // Return placeholder data - will be replaced with financial summary
  return {
    numberOfCustomers: 0,
    numberOfInvoices: 0,
    totalPaidInvoices: formatCurrency(0),
    totalPendingInvoices: formatCurrency(0),
  };
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
): Promise<InvoicesTable[]> {
  // Return empty array - will be replaced with transactions
  return [];
}

export async function fetchInvoicesPages(query: string): Promise<number> {
  return 0;
}

export async function fetchInvoiceById(id: string): Promise<InvoiceForm | undefined> {
  return undefined;
}

export async function fetchCustomers(): Promise<CustomerField[]> {
  return [];
}

export async function fetchFilteredCustomers(query: string): Promise<CustomersTableType[]> {
  return [];
}
