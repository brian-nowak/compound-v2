# Integration Plan: Compound Go Backend + Next.js Dashboard

## Overview

Integrate the **Compound Go backend** (Plaid financial data) with the **nextjs-dashboard frontend** (modern Next.js App Router UI), removing authentication to simplify the architecture.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js Dashboard (Port 3000)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ App Router   │  │ Server       │  │ API Routes           │   │
│  │ Pages/UI     │  │ Components   │  │ /api/plaid/*         │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │ HTTP (internal)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               Compound Go Backend (Port 8000)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Plaid SDK    │  │ Transaction  │  │ Account/Item         │   │
│  │ Integration  │  │ Sync         │  │ Management           │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│                PostgreSQL (Compound DB - Port 5432)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Project Setup & Auth Removal

### 1.1 Strip Authentication from Next.js Dashboard

**Files to delete:**
- `nextjs-dashboard/auth.ts`
- `nextjs-dashboard/auth.config.ts`
- `nextjs-dashboard/proxy.ts` (NextAuth middleware)
- `nextjs-dashboard/app/login/page.tsx`
- `nextjs-dashboard/app/ui/login-form.tsx`

**Files to modify:**

`nextjs-dashboard/app/ui/dashboard/sidenav.tsx`:
- Remove `signOut` import and logout button
- Replace with user switcher component (dropdown showing current user)

`nextjs-dashboard/app/page.tsx`:
- Change landing page to redirect directly to `/dashboard`
- Or convert to a simple welcome that links to dashboard

`nextjs-dashboard/package.json`:
- Remove dependencies: `next-auth`, `bcrypt`, `postgres` (Neon), `@types/bcrypt`
- Keep: `zod` (validation), `use-debounce` (search)
- Add: `react-plaid-link` (Plaid Link SDK)

### 1.2 Configure Next.js to Proxy to Go Backend

**Create/modify `nextjs-dashboard/next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/plaid/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};
```

### 1.3 Environment Configuration

**Create `nextjs-dashboard/.env.local`:**
```
# Go Backend URL (for server-side fetches)
GO_BACKEND_URL=http://localhost:8000

# Default user ID (for single-user mode)
DEFAULT_USER_ID=1
```

### 1.4 Update Go Backend CORS

**Modify `compound/go-server/cmd/server/main.go`:**
- Add `http://localhost:3000` to CORS allowed origins

---

## Phase 2: Data Layer & Type Definitions

### 2.1 Create TypeScript Types

**Create `nextjs-dashboard/app/lib/plaid-definitions.ts`:**
```typescript
export interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  user_id: number;
  plaid_item_id: string;
  plaid_institution_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  item_id: number;
  plaid_account_id: string;
  name: string;
  mask: string;
  official_name: string | null;
  current_balance: number | null;
  available_balance: number | null;
  type: string;      // depository, credit, investment, etc.
  subtype: string;   // checking, savings, credit card, etc.
}

export interface Transaction {
  id: number;
  account_id: number;
  plaid_transaction_id: string;
  category: string | null;
  type: string;
  name: string;
  amount: number;
  date: string;
  pending: boolean;
  account_owner: string | null;
}
```

### 2.2 Create API Client Functions

**Create `nextjs-dashboard/app/lib/plaid-api.ts`:**
```typescript
const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8000';

// User functions
export async function getUser(userId: number): Promise<User> { ... }
export async function getUserByUsername(username: string): Promise<User> { ... }
export async function createUser(username: string): Promise<User> { ... }

// Plaid Link functions
export async function getLinkToken(userId: number, itemId?: number): Promise<string> { ... }
export async function exchangePublicToken(publicToken: string, userId: number): Promise<Item> { ... }

// Account functions
export async function getUserAccounts(userId: number): Promise<Account[]> { ... }
export async function getItemAccounts(itemId: number): Promise<Account[]> { ... }

// Transaction functions
export async function getUserTransactions(userId: number): Promise<Transaction[]> { ... }
export async function syncTransactions(itemId: number): Promise<SyncResult> { ... }
```

---

## Phase 3: Plaid Link Integration

### 3.1 Create PlaidLink Client Component

**Create `nextjs-dashboard/app/ui/plaid/plaid-link-button.tsx`:**
- Client component ('use client')
- Uses `react-plaid-link` SDK
- Handles link token fetch, success callback, error states
- Triggers transaction sync after successful link

### 3.2 Create Accounts Page

**Create `nextjs-dashboard/app/dashboard/accounts/page.tsx`:**
- Server component
- Fetches linked accounts from Go backend
- Displays account cards grouped by institution
- Shows "Link New Account" button (PlaidLink component)

**Create `nextjs-dashboard/app/ui/accounts/account-card.tsx`:**
- Display account name, mask, type, balance
- Sync button per account/item
- Status indicator (linked/error)

**Create `nextjs-dashboard/app/ui/accounts/institution-group.tsx`:**
- Groups accounts by institution
- Shows institution name/logo
- Collapsible account list

### 3.3 Add Navigation Link

**Modify `nextjs-dashboard/app/ui/dashboard/nav-links.tsx`:**
- Add "Accounts" link with BanknotesIcon
- Route: `/dashboard/accounts`

---

## Phase 4: Transactions UI

### 4.1 Create Transactions Page

**Create `nextjs-dashboard/app/dashboard/transactions/page.tsx`:**
- Server component with search params
- Fetches transactions from Go backend
- Passes to TransactionsTable component
- Includes search + pagination (reuse existing patterns)

### 4.2 Create Transaction Components

**Create `nextjs-dashboard/app/ui/transactions/table.tsx`:**
- Reuse invoice table pattern (responsive: cards on mobile, table on desktop)
- Columns: Date, Name, Amount, Category, Account, Pending status
- Color-code amounts (green for income, red for expenses)

**Create `nextjs-dashboard/app/ui/transactions/filters.tsx`:**
- Date range picker
- Category filter (dropdown)
- Account filter (dropdown)
- Amount range

**Create `nextjs-dashboard/app/ui/transactions/transaction-row.tsx`:**
- Individual transaction display
- Amount formatting (negative = expense, positive = income)
- Category badge

### 4.3 Add Navigation Link

**Modify `nextjs-dashboard/app/ui/dashboard/nav-links.tsx`:**
- Add "Transactions" link with ArrowsRightLeftIcon
- Route: `/dashboard/transactions`

---

## Phase 5: Dashboard Overview (Financial Widgets)

### 5.1 Replace Invoice Widgets with Financial Widgets

**Modify `nextjs-dashboard/app/dashboard/(overview)/page.tsx`:**
- Remove invoice-related cards
- Add financial summary cards

**Create `nextjs-dashboard/app/ui/dashboard/financial-cards.tsx`:**
- Total Balance (sum of all accounts)
- Cash (checking + savings)
- Credit (total credit card debt)
- Net Worth (assets - liabilities)

**Create `nextjs-dashboard/app/ui/dashboard/spending-chart.tsx`:**
- Replace RevenueChart with spending by category
- Use same chart pattern, different data

**Create `nextjs-dashboard/app/ui/dashboard/recent-transactions.tsx`:**
- Replace LatestInvoices with recent transactions
- Similar layout: 5 most recent transactions

### 5.2 Create Data Fetching Functions

**Create `nextjs-dashboard/app/lib/financial-data.ts`:**
```typescript
export async function fetchFinancialSummary(userId: number) { ... }
export async function fetchSpendingByCategory(userId: number) { ... }
export async function fetchRecentTransactions(userId: number, limit: number) { ... }
export async function fetchNetWorthHistory(userId: number) { ... }
```

---

## Phase 6: User Switcher (Simple Mode)

### 6.1 Create User Context

**Create `nextjs-dashboard/app/lib/user-context.tsx`:**
- React context for current user
- Persists to localStorage
- Provides `currentUser` and `setCurrentUser`

### 6.2 Create User Switcher Component

**Create `nextjs-dashboard/app/ui/user-switcher.tsx`:**
- Dropdown showing current user
- List of available users
- "Create User" option
- Placed in sidenav

---

## Phase 7: Polish & Error Handling

### 7.1 Loading States

- Add loading.tsx for each new route
- Create skeleton components for financial widgets
- Add Suspense boundaries around data-fetching components

### 7.2 Error Handling

- Create error.tsx for transaction and account pages
- Handle Go backend connection errors gracefully
- Add retry mechanisms for failed syncs

### 7.3 Sync Status & Refresh

- Add "Sync All" button in header
- Show last sync timestamp
- Auto-refresh transaction data option

---

## File Structure After Integration

```
nextjs-dashboard/
├── app/
│   ├── dashboard/
│   │   ├── (overview)/
│   │   │   ├── page.tsx          # Modified: financial widgets
│   │   │   └── loading.tsx       # Modified: financial skeletons
│   │   ├── accounts/
│   │   │   ├── page.tsx          # NEW: linked accounts
│   │   │   └── loading.tsx       # NEW
│   │   ├── transactions/
│   │   │   ├── page.tsx          # NEW: transaction list
│   │   │   └── loading.tsx       # NEW
│   │   └── layout.tsx            # Modified: remove auth check
│   ├── lib/
│   │   ├── plaid-definitions.ts  # NEW: TypeScript types
│   │   ├── plaid-api.ts          # NEW: Go backend client
│   │   ├── financial-data.ts     # NEW: aggregation functions
│   │   ├── user-context.tsx      # NEW: user state
│   │   └── utils.ts              # Keep: formatCurrency, etc.
│   ├── ui/
│   │   ├── accounts/
│   │   │   ├── account-card.tsx      # NEW
│   │   │   └── institution-group.tsx # NEW
│   │   ├── transactions/
│   │   │   ├── table.tsx             # NEW
│   │   │   ├── filters.tsx           # NEW
│   │   │   └── transaction-row.tsx   # NEW
│   │   ├── plaid/
│   │   │   └── plaid-link-button.tsx # NEW
│   │   ├── dashboard/
│   │   │   ├── financial-cards.tsx   # NEW
│   │   │   ├── spending-chart.tsx    # NEW
│   │   │   ├── recent-transactions.tsx # NEW
│   │   │   ├── sidenav.tsx           # Modified
│   │   │   └── nav-links.tsx         # Modified
│   │   ├── user-switcher.tsx         # NEW
│   │   └── skeletons.tsx             # Modified: add financial skeletons
│   └── page.tsx                      # Modified: redirect to dashboard
├── next.config.ts                    # Modified: add rewrites
├── .env.local                        # NEW
└── package.json                      # Modified: dependencies
```

---

## Files to Delete (Auth Cleanup)

```
nextjs-dashboard/
├── auth.ts                    # DELETE
├── auth.config.ts             # DELETE
├── proxy.ts                   # DELETE (NextAuth middleware)
├── app/
│   ├── login/                 # DELETE entire directory
│   └── ui/
│       └── login-form.tsx     # DELETE
```

---

## Go Backend Changes

**File: `compound/go-server/cmd/server/main.go`**
- Add `http://localhost:3000` to CORS AllowOrigins

**Potential new endpoints needed:**
- `GET /api/users/:id/items` - Get user's linked items
- `GET /api/users/:id/accounts` - Get all accounts for user (across items)
- `GET /api/summary/:userId` - Aggregated financial data

---

## Dependencies Changes

**Remove from package.json:**
- `next-auth`
- `bcrypt`
- `@types/bcrypt`
- `postgres` (Neon connection - keeping for now in case we need it, but not using for financial data)

**Add to package.json:**
- `react-plaid-link` - Plaid Link SDK for client-side linking

---

## Development Workflow

1. Start Compound PostgreSQL: `docker-compose up db` (from compound directory)
2. Start Go backend: `make go-air` (from compound directory)
3. Start Next.js: `pnpm dev` (from nextjs-dashboard directory)

Frontend: http://localhost:3000
Go API: http://localhost:8000

---

## Estimated Effort by Phase

| Phase | Description | Estimated Effort |
|-------|-------------|------------------|
| 1 | Project Setup & Auth Removal | 1-2 hours |
| 2 | Data Layer & Types | 1-2 hours |
| 3 | Plaid Link Integration | 2-3 hours |
| 4 | Transactions UI | 3-4 hours |
| 5 | Dashboard Overview Widgets | 2-3 hours |
| 6 | User Switcher | 1 hour |
| 7 | Polish & Error Handling | 2-3 hours |
| **Total** | | **12-18 hours** |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Go backend missing endpoints | Add endpoints as needed (documented above) |
| Plaid Link OAuth redirect | Configure redirect URI in Plaid dashboard |
| Type mismatches | Validate API responses, add Zod schemas |
| CORS issues | Verify Go CORS config includes Next.js origin |

---

## Next Steps

1. Approve this plan
2. Start with Phase 1 (auth removal + proxy setup)
3. Verify Go backend connectivity
4. Proceed through phases sequentially
