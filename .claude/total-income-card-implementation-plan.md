# Total Income Card - Implementation Plan

## Overview
This plan details how to add a "Total Income" card to the dashboard using a **flexible SQL query builder** approach. Instead of creating a separate endpoint for each metric, we'll implement a reusable filter system that can handle any transaction aggregation (income, expenses, spending by category, etc.).

## Key Design Decision: Flexible SQL Filters

Rather than adding a simple `/api/users/:id/income` endpoint, this plan implements:

1. **Reusable Query Builder** (`QueryTransactionsAggregate`) - Handles any aggregation with dynamic filters
2. **Type-Safe Filters** - Go structs define field, operator, and value
3. **SQL-Level Filtering** - Database does the heavy lifting for performance
4. **Extensible Architecture** - Easy to add new metrics without new endpoints

This approach future-proofs your application for metrics like:
- Total expenses
- Spending by category
- Monthly income trends
- Transaction counts
- Average transaction amounts

---

## Current "Total Balance" Card - End-to-End Flow

### 1. **Frontend UI Layer** (`frontend/app/`)

#### Dashboard Page: `dashboard/(overview)/page.tsx:22-24`
```tsx
<Suspense fallback={<CardsSkeleton />}>
  <FinancialCards userId={userId} />
</Suspense>
```
- The main dashboard renders `FinancialCards` component with a `userId`
- Uses React Suspense for loading states

#### Financial Cards Component: `ui/dashboard/financial-cards.tsx`
```tsx
export default async function FinancialCards({ userId }: { userId: number }) {
  const summary = await fetchFinancialSummary(userId);

  return (
    <>
      <Card title="Total Balance" value={summary.totalBalance} type="balance" />
      <Card title="Cash" value={summary.cashBalance} type="cash" />
      <Card title="Credit Card Debt" value={summary.creditBalance} type="credit" />
      <Card title="Net Worth" value={summary.netWorth} type="netWorth" />
    </>
  );
}
```
- Server component that fetches financial data
- Renders individual `Card` components with title, value, and type
- Uses `formatCurrency()` to format numbers

#### Card Component: `ui/dashboard/financial-cards.tsx:35-59`
```tsx
export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'cash' | 'credit' | 'balance' | 'netWorth';
}) {
  const Icon = iconMap[type];
  // Renders card with icon, title, and formatted value
}
```
- Generic reusable card component
- Maps `type` to icon via `iconMap`
- Supports dark mode styling

### 2. **Frontend Data Layer** (`frontend/app/lib/`)

#### Financial Data: `lib/financial-data.ts:4-58`
```tsx
export interface FinancialSummary {
  totalBalance: number;
  cashBalance: number;
  creditBalance: number;
  netWorth: number;
}

export async function fetchFinancialSummary(userId: number): Promise<FinancialSummary> {
  const accounts = await getUserAccounts(userId);

  let totalAssets = 0;
  let cashBalance = 0;
  let creditBalance = 0;

  accounts.forEach((account: Account) => {
    const balance = account.current_balance || 0;

    // Depository accounts (checking, savings, etc.) are assets
    if (account.type === 'depository') {
      totalAssets += balance;
      cashBalance += balance;
    }

    // Investment/brokerage accounts are assets
    if (account.type === 'investment' || account.type === 'brokerage') {
      totalAssets += balance;
    }

    // Credit cards and loans are liabilities
    if (account.type === 'credit' || account.type === 'loan') {
      creditBalance += balance;
    }
  });

  const netWorth = totalAssets - creditBalance;

  return {
    totalBalance: totalAssets,
    cashBalance,
    creditBalance,
    netWorth,
  };
}
```
- Aggregates account balances from API data
- Performs business logic calculations
- Returns typed summary object

#### Plaid API Client: `lib/plaid-api.ts:107-117`
```tsx
export async function getUserAccounts(userId: number): Promise<Account[]> {
  try {
    const response = await fetch(`${GO_BACKEND_URL}/api/users/${userId}/accounts`);
    return handleResponse<Account[]>(response);
  } catch (error) {
    console.error('Failed to fetch user accounts:', error);
    return [];
  }
}
```
- Fetches raw account data from Go backend
- Handles errors gracefully

### 3. **Backend API Layer** (`backend/go-server/`)

#### API Endpoint: `cmd/server/main.go:117`
```go
router.GET("/api/users/:id/accounts", handlers.GetUserAccounts)
```

#### Handler: `internal/handlers/accounts.go:15-36`
```go
func GetUserAccounts(c *gin.Context) {
  userIDStr := c.Param("id")
  userID, err := strconv.Atoi(userIDStr)
  if err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
    return
  }

  accounts, err := db.GetAccountsByUserID(context.Background(), userID)
  if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{
      "error": "failed to get accounts: " + err.Error(),
    })
    return
  }

  c.JSON(http.StatusOK, accounts)
}
```
- Parses user ID from URL
- Calls database layer
- Returns JSON response

### 4. **Database Layer** (`backend/go-server/internal/db/`)

#### Query Function: `db/accounts.go:156-203`
```go
func GetAccountsByUserID(ctx context.Context, userID int) ([]*models.Account, error) {
  query := `SELECT a.id, a.item_id, a.plaid_account_id, i.institution_name, a.name, a.mask,
            a.official_name, a.current_balance, a.available_balance,
            a.iso_currency_code, a.unofficial_currency_code,
            a.type, a.subtype, a.created_at, a.updated_at
            FROM accounts_table a
            JOIN items_table i ON a.item_id = i.id
            WHERE i.user_id = $1
            ORDER BY a.created_at DESC`

  rows, err := conn.Query(ctx, query, userID)
  // Scan rows into Account structs
  return accounts, nil
}
```
- Joins `accounts_table` with `items_table` to filter by user
- Returns all accounts with balance information

### 5. **Database Schema** (`backend/database/init/create.sql`)

#### Accounts Table: Lines 121-137
```sql
CREATE TABLE accounts_table (
  id SERIAL PRIMARY KEY,
  item_id integer REFERENCES items_table(id) ON DELETE CASCADE,
  plaid_account_id text UNIQUE NOT NULL,
  name text NOT NULL,
  mask text NOT NULL,
  official_name text,
  current_balance numeric(28,10),
  available_balance numeric(28,10),
  iso_currency_code text,
  unofficial_currency_code text,
  type text NOT NULL,
  subtype text NOT NULL,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```
- Stores account data with balances
- `current_balance` is used for Total Balance calculation

---

## Transaction Amount Convention (CRITICAL for Income Calculation)

Based on code analysis in the transaction components:

```tsx
// From: frontend/app/ui/transactions/transaction-row.tsx:15-18
// Positive amounts are typically expenses in Plaid
// Negative amounts are income/credits
const isIncome = transaction.amount < 0;
```

**Plaid Convention:**
- **Positive amounts** (`> 0`) = Expenses/Debits (money going out)
- **Negative amounts** (`< 0`) = Income/Credits (money coming in)

**Examples:**
- Grocery purchase: `+45.67` (expense)
- Paycheck deposit: `-2500.00` (income)
- Refund: `-15.00` (income/credit)

---

## Implementation Plan: Total Income Card

This implementation follows a **backend-first approach** using a flexible SQL query builder.

### Implementation Steps Overview:

**Backend (Go):**
1. Create flexible filter types and query builder in `db/transactions.go`
2. Add convenience function `GetUserTotalIncome()`
3. Create handler `GetUserIncome()` in `handlers/transactions.go`
4. Add route in `cmd/server/main.go`

**Frontend (Next.js/TypeScript):**
5. Add `getUserIncome()` API client function
6. Update `FinancialSummary` interface and `fetchFinancialSummary()`
7. Update UI components to display the card
8. (Optional) Adjust dashboard layout

Let's start with the backend implementation, then move to frontend.

---

## Database Considerations

### Current Transactions Table Schema
From `backend/database/init/create.sql:173-191`:

```sql
CREATE TABLE transactions_table (
  id SERIAL PRIMARY KEY,
  account_id integer REFERENCES accounts_table(id) ON DELETE CASCADE,
  plaid_transaction_id text UNIQUE NOT NULL,
  plaid_category_id text,
  category text,
  category_data jsonb,
  type text NOT NULL,
  name text NOT NULL,
  amount numeric(28,10) NOT NULL,  -- This is what we'll sum
  iso_currency_code text,
  unofficial_currency_code text,
  date date NOT NULL,  -- Can filter by this for time periods
  pending boolean NOT NULL,
  account_owner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Enriched Transactions View
From `backend/database/migrations/002_add_enriched_transactions_view.sql:38`:

The view already has a `transaction_type` field that categorizes income vs expense:
```sql
CASE WHEN i.institution_name = 'Capital One' and UPPER(t.name) like '%DATABRICKS%'
     then 'Income'
     else 'Expense'
end as transaction_type
```

**Note:** This logic is currently hardcoded for a specific use case. The proper way to determine income vs expense is by the sign of `amount`:
- `amount < 0` = Income
- `amount > 0` = Expense

---

## Recommended Implementation Approach: Flexible SQL Filter Function

Instead of creating separate endpoints for each aggregation (income, expenses, etc.), we'll create a **flexible query builder** that accepts dynamic filters. This approach:

- **Reusable:** One function handles income, expenses, spending by category, etc.
- **Performant:** Database does the filtering and aggregation
- **Extensible:** Easy to add new filters without new endpoints
- **Type-safe:** Go's type system validates filters at compile time

### Architecture

```
Frontend Request → Handler → QueryTransactionsWithFilters(filters) → SQL with dynamic WHERE clause → Result
```

### Step 1: Create Filter Types and Query Builder

**File:** `backend/go-server/internal/db/transactions.go`

Add after the existing functions (after line 202):

```go
// TransactionFilter defines a filter that can be applied to transaction queries
type TransactionFilter struct {
	Field    string      // Field to filter on (e.g., "amount", "date", "pending")
	Operator string      // SQL operator (e.g., "<", ">", "=", "BETWEEN", "IN")
	Value    interface{} // Value(s) to compare against
}

// TransactionAggregation defines what aggregate operation to perform
type TransactionAggregation struct {
	Function string // SQL function (e.g., "SUM", "COUNT", "AVG")
	Field    string // Field to aggregate (e.g., "amount", "id")
	Alias    string // Result column name (e.g., "total_income")
}

// QueryTransactionsAggregate performs an aggregation query on transactions for a user
// with dynamic filters applied
func QueryTransactionsAggregate(
	ctx context.Context,
	userID int,
	aggregation TransactionAggregation,
	filters []TransactionFilter,
) (float64, error) {
	// Build the base query
	baseQuery := `SELECT %s(%s) as %s
	              FROM transactions_table t
	              LEFT JOIN accounts_table a ON t.account_id = a.id
	              LEFT JOIN items_table i ON a.item_id = i.id
	              WHERE i.user_id = $1`

	// Start with user ID as the first parameter
	args := []interface{}{userID}
	argCounter := 2 // Next parameter will be $2

	// Build WHERE clause from filters
	whereClauses := []string{}
	for _, filter := range filters {
		clause, arg := buildFilterClause(filter, argCounter)
		whereClauses = append(whereClauses, clause)
		args = append(args, arg)
		argCounter++
	}

	// Construct final query
	query := fmt.Sprintf(
		baseQuery,
		aggregation.Function,
		aggregation.Field,
		aggregation.Alias,
	)

	// Add filter clauses
	if len(whereClauses) > 0 {
		query += " AND " + strings.Join(whereClauses, " AND ")
	}

	// Execute query
	var result float64
	err := conn.QueryRow(ctx, query, args...).Scan(&result)
	if err != nil {
		return 0, fmt.Errorf("aggregation query failed: %w", err)
	}

	return result, nil
}

// buildFilterClause converts a TransactionFilter into a SQL WHERE clause fragment
func buildFilterClause(filter TransactionFilter, argNum int) (string, interface{}) {
	placeholder := fmt.Sprintf("$%d", argNum)

	switch filter.Operator {
	case "<", ">", "<=", ">=", "=", "!=":
		return fmt.Sprintf("t.%s %s %s", filter.Field, filter.Operator, placeholder), filter.Value

	case "BETWEEN":
		// Expects Value to be a slice/array with 2 elements [start, end]
		// Note: For BETWEEN, you'll need to handle 2 parameters - see enhanced version below
		return fmt.Sprintf("t.%s BETWEEN %s AND %s", filter.Field, placeholder, placeholder), filter.Value

	case "IN":
		// Expects Value to be a slice
		return fmt.Sprintf("t.%s IN (%s)", filter.Field, placeholder), filter.Value

	case "LIKE", "ILIKE":
		return fmt.Sprintf("t.%s %s %s", filter.Field, filter.Operator, placeholder), filter.Value

	default:
		// Default to equality
		return fmt.Sprintf("t.%s = %s", filter.Field, placeholder), filter.Value
	}
}
```

### Step 2: Add Convenience Function for Income

**File:** `backend/go-server/internal/db/transactions.go`

Add a helper function that uses the flexible query builder:

```go
// GetUserTotalIncome calculates total income for a user
// Income is defined as transactions with negative amounts
// Optionally filtered by date range
func GetUserTotalIncome(ctx context.Context, userID int, startDate, endDate *string) (float64, error) {
	aggregation := TransactionAggregation{
		Function: "COALESCE(SUM(ABS",
		Field:    "t.amount))",  // Note: We need ABS to get positive sum
		Alias:    "total_income",
	}

	// Base filter: amount < 0 (negative = income)
	filters := []TransactionFilter{
		{
			Field:    "amount",
			Operator: "<",
			Value:    0,
		},
	}

	// Add date range filters if provided
	if startDate != nil {
		filters = append(filters, TransactionFilter{
			Field:    "date",
			Operator: ">=",
			Value:    *startDate,
		})
	}

	if endDate != nil {
		filters = append(filters, TransactionFilter{
			Field:    "date",
			Operator: "<=",
			Value:    *endDate,
		})
	}

	return QueryTransactionsAggregate(ctx, userID, aggregation, filters)
}
```

### Step 3: Create Handler

**File:** `backend/go-server/internal/handlers/transactions.go`

Add after `GetUserTransactions` function:

```go
// GetUserIncome handles GET /api/users/:userID/income
// Query params:
//   - start_date: optional start date (YYYY-MM-DD)
//   - end_date: optional end date (YYYY-MM-DD)
func GetUserIncome(c *gin.Context) {
	userIDStr := c.Param("userID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	// Parse optional date range from query params
	var startDate, endDate *string
	if sd := c.Query("start_date"); sd != "" {
		startDate = &sd
	}
	if ed := c.Query("end_date"); ed != "" {
		endDate = &ed
	}

	totalIncome, err := db.GetUserTotalIncome(context.Background(), userID, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to calculate income: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_income": totalIncome,
	})
}
```

### Step 4: Add Route

**File:** `backend/go-server/cmd/server/main.go`

Add after the existing transaction routes (around line 129):

```go
router.GET("/api/users/:userID/income", handlers.GetUserIncome)
```

### Step 5: Frontend API Client

**File:** `frontend/app/lib/plaid-api.ts`

Add after `getUserTransactions`:

```tsx
export async function getUserIncome(
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<number> {
  try {
    let url = `${GO_BACKEND_URL}/api/users/${userId}/income`;

    // Add query params if date range provided
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    const data = await handleResponse<{ total_income: number }>(response);
    return data.total_income;
  } catch (error) {
    console.error('Failed to fetch user income:', error);
    return 0;
  }
}
```

### Step 6: Update Frontend Data Layer

**File:** `frontend/app/lib/financial-data.ts`

Update interface and add income to summary:

```tsx
export interface FinancialSummary {
  totalBalance: number;
  cashBalance: number;
  creditBalance: number;
  netWorth: number;
  totalIncome: number;  // NEW
}

export async function fetchFinancialSummary(
  userId: number
): Promise<FinancialSummary> {
  // Fetch accounts and income in parallel
  const [accounts, totalIncome] = await Promise.all([
    getUserAccounts(userId),
    getUserIncome(userId),  // Uses new backend endpoint
  ]);

  // Handle null or undefined accounts
  if (!accounts) {
    return {
      totalBalance: 0,
      cashBalance: 0,
      creditBalance: 0,
      netWorth: 0,
      totalIncome: 0,
    };
  }

  let totalAssets = 0;
  let cashBalance = 0;
  let creditBalance = 0;

  accounts.forEach((account: Account) => {
    const balance = account.current_balance || 0;

    if (account.type === 'depository') {
      totalAssets += balance;
      cashBalance += balance;
    }

    if (account.type === 'investment' || account.type === 'brokerage') {
      totalAssets += balance;
    }

    if (account.type === 'credit' || account.type === 'loan') {
      creditBalance += balance;
    }
  });

  const netWorth = totalAssets - creditBalance;

  return {
    totalBalance: totalAssets,
    cashBalance,
    creditBalance,
    netWorth,
    totalIncome,  // NEW
  };
}
```

---

## Frontend UI Implementation

### Step 7: Update Financial Cards Component

**File:** `frontend/app/ui/dashboard/financial-cards.tsx`

**Add Icon Import:**
```tsx
import {
  BanknotesIcon,
  CreditCardIcon,
  ScaleIcon,
  WalletIcon,
  ArrowTrendingUpIcon,  // NEW ICON for income
} from '@heroicons/react/24/outline';

const iconMap = {
  cash: BanknotesIcon,
  credit: CreditCardIcon,
  balance: WalletIcon,
  netWorth: ScaleIcon,
  income: ArrowTrendingUpIcon,  // NEW ENTRY
};
```

**Update Component:**
```tsx
export default async function FinancialCards({ userId }: { userId: number }) {
  const summary = await fetchFinancialSummary(userId);

  return (
    <>
      <Card title="Total Balance" value={summary.totalBalance} type="balance" />
      <Card title="Total Income" value={summary.totalIncome} type="income" />  {/* NEW CARD */}
      <Card title="Cash" value={summary.cashBalance} type="cash" />
      <Card
        title="Credit Card Debt"
        value={summary.creditBalance}
        type="credit"
      />
      <Card title="Net Worth" value={summary.netWorth} type="netWorth" />
    </>
  );
}
```

**Update Card Type:**
```tsx
export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'cash' | 'credit' | 'balance' | 'netWorth' | 'income';  // ADD 'income'
}) {
  const Icon = iconMap[type];
  // ... rest of component
}
```

### Step 8: Update Dashboard Layout (Optional)

**File:** `frontend/app/dashboard/(overview)/page.tsx`

Currently displays 4 cards in a row:
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
```

With 5 cards, you may want to adjust the layout:

**Option A:** Keep 4 columns, cards will wrap to second row (recommended for minimal changes)
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
```

**Option B:** Use 5 columns for large screens
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
```

**Option C:** Use 3 columns (creates a 2-row layout)
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
```

---

## Future Extensions Using the Flexible Filter System

Once the flexible query builder is in place, you can easily add new aggregations without new endpoints:

### Example: Total Expenses
```go
func GetUserTotalExpenses(ctx context.Context, userID int, startDate, endDate *string) (float64, error) {
	aggregation := TransactionAggregation{
		Function: "COALESCE(SUM",
		Field:    "t.amount)",
		Alias:    "total_expenses",
	}

	filters := []TransactionFilter{
		{Field: "amount", Operator: ">", Value: 0},  // Positive = expense
	}

	// Add date filters...
	return QueryTransactionsAggregate(ctx, userID, aggregation, filters)
}
```

### Example: Spending by Category
```go
func GetSpendingByCategory(ctx context.Context, userID int, category string) (float64, error) {
	aggregation := TransactionAggregation{
		Function: "COALESCE(SUM",
		Field:    "t.amount)",
		Alias:    "category_spending",
	}

	filters := []TransactionFilter{
		{Field: "amount", Operator: ">", Value: 0},
		{Field: "category", Operator: "ILIKE", Value: "%" + category + "%"},
	}

	return QueryTransactionsAggregate(ctx, userID, aggregation, filters)
}
```

### Example: Transaction Count
```go
func GetTransactionCount(ctx context.Context, userID int, pending bool) (float64, error) {
	aggregation := TransactionAggregation{
		Function: "COUNT",
		Field:    "*",
		Alias:    "transaction_count",
	}

	filters := []TransactionFilter{
		{Field: "pending", Operator: "=", Value: pending},
	}

	return QueryTransactionsAggregate(ctx, userID, aggregation, filters)
}
```

### Benefits of This Approach

1. **Single Source of Truth:** One query builder handles all transaction aggregations
2. **Easy Testing:** Test the query builder once, reuse for all aggregations
3. **SQL Injection Safe:** Parameterized queries throughout
4. **Performance:** Database does heavy lifting, results can be cached
5. **Flexible Frontend:** Can request any combination of filters via query params

---

## Testing Checklist

After implementation, verify:

1. **Data Accuracy:**
   - [ ] Total Income sums all negative transaction amounts correctly
   - [ ] Pending transactions are handled appropriately
   - [ ] Different currency codes are considered

2. **UI/UX:**
   - [ ] Card displays in correct position
   - [ ] Icon renders properly
   - [ ] Currency formatting is correct
   - [ ] Dark mode styling works
   - [ ] Responsive layout on mobile/tablet/desktop

3. **Edge Cases:**
   - [ ] User with no transactions shows $0.00
   - [ ] User with no income shows $0.00
   - [ ] Large income amounts format correctly
   - [ ] API errors are handled gracefully

4. **Performance:**
   - [ ] Page load time is acceptable
   - [ ] No unnecessary re-fetching of data

---

## Additional Considerations

### Time Period Selection
Consider adding a time period filter for income:
- **All Time** (default)
- **This Month**
- **This Year**
- **Last 30 Days**
- **Year to Date**

This would require:
1. Adding a dropdown/toggle to the dashboard
2. Passing date range to `fetchTotalIncome()`
3. Filtering transactions by date

### Income Subcategories
You could further break down income by source:
- Salary/Paycheck
- Refunds
- Interest
- Other Income

This would use the `category_data` JSONB field from the transactions table.

### Card Ordering
Consider the logical flow of cards:
- **Current:** Total Balance → Cash → Credit Debt → Net Worth
- **Option 1:** Total Balance → Total Income → Cash → Credit Debt → Net Worth
- **Option 2:** Total Balance → Net Worth → Total Income → Cash → Credit Debt

### Color Coding
Income is typically shown in green. Consider updating the Card component to apply special styling:
```tsx
const getValueColor = (type: string) => {
  switch(type) {
    case 'income': return 'text-green-600 dark:text-green-400';
    case 'credit': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-900 dark:text-gray-100';
  }
};
```

---

## Summary

The "Total Balance" card follows a clean data flow:
1. Dashboard → FinancialCards component
2. FinancialCards → fetchFinancialSummary() → getUserAccounts()
3. getUserAccounts() → Go backend `/api/users/:id/accounts`
4. Handler → Database query joining accounts + items tables
5. Returns account balances, frontend calculates totals

To add "Total Income":
1. Follow the same pattern, but fetch transactions instead of accounts
2. Filter for negative amounts (income in Plaid convention)
3. Sum the absolute values
4. Add to FinancialSummary interface and display in a new Card

**Recommended Path:** Start with frontend-only calculation (Approach A) for quick implementation, then optimize with backend calculation (Approach B) if needed for performance.
