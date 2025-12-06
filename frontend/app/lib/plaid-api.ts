import type {
  User,
  Item,
  Account,
  Transaction,
  LinkTokenResponse,
  SyncTransactionsResponse,
} from './plaid-definitions';

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8000';

// Helper for handling API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// =============================================================================
// User API Functions
// =============================================================================

export async function getUser(userId: number): Promise<User> {
  const response = await fetch(`${GO_BACKEND_URL}/api/users/${userId}`);
  return handleResponse<User>(response);
}

export async function getUserByUsername(username: string): Promise<User> {
  const response = await fetch(`${GO_BACKEND_URL}/api/users/username/${encodeURIComponent(username)}`);
  return handleResponse<User>(response);
}

export async function createUser(username: string): Promise<User> {
  const response = await fetch(`${GO_BACKEND_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  return handleResponse<User>(response);
}

// =============================================================================
// Plaid Link API Functions
// =============================================================================

export async function getLinkToken(userId: number, itemId?: number): Promise<string> {
  const response = await fetch(`${GO_BACKEND_URL}/api/link-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId: itemId ?? null }),
  });
  const data = await handleResponse<LinkTokenResponse>(response);
  return data.link_token;
}

interface ExchangeTokenResponse {
  item_id: number;
  plaid_item_id: string;
  institution_name: string;
  access_token: string;
  accounts: Array<{
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
  }>;
}

export async function exchangePublicToken(
  publicToken: string,
  userId: number
): Promise<ExchangeTokenResponse> {
  const response = await fetch(`${GO_BACKEND_URL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicToken, userId }),
  });
  return handleResponse<ExchangeTokenResponse>(response);
}

// =============================================================================
// Account API Functions
// =============================================================================

export async function getItemAccounts(itemId: number): Promise<Account[]> {
  const response = await fetch(`${GO_BACKEND_URL}/api/items/${itemId}/accounts`);
  return handleResponse<Account[]>(response);
}

// Note: This endpoint needs to be added to the Go backend
// For now, we can get accounts through the items endpoint after linking
export async function getUserAccounts(userId: number): Promise<Account[]> {
  // TODO: Implement when /api/users/:id/accounts endpoint is added to Go backend
  // For now, this would need to fetch items first, then accounts per item
  const response = await fetch(`${GO_BACKEND_URL}/api/users/${userId}/accounts`);
  return handleResponse<Account[]>(response);
}

// =============================================================================
// Transaction API Functions
// =============================================================================

interface TransactionsResponse {
  transactions: Transaction[];
}

export async function getUserTransactions(userId: number): Promise<Transaction[]> {
  const response = await fetch(`${GO_BACKEND_URL}/api/transactions/${userId}`);
  const data = await handleResponse<TransactionsResponse>(response);
  return data.transactions;
}

export async function syncTransactions(itemId: number): Promise<SyncTransactionsResponse> {
  const response = await fetch(`${GO_BACKEND_URL}/api/items/${itemId}/sync-transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await handleResponse<{
    success: boolean;
    addedCount: number;
    modifiedCount: number;
    removedCount: number;
  }>(response);
  return {
    added: data.addedCount,
    modified: data.modifiedCount,
    removed: data.removedCount,
  };
}

// =============================================================================
// Health Check
// =============================================================================

export async function pingBackend(): Promise<boolean> {
  try {
    const response = await fetch(`${GO_BACKEND_URL}/api/ping`);
    return response.ok;
  } catch {
    return false;
  }
}
