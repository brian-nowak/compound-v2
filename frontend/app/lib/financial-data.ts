import { getUserAccounts, getUserTransactions, getUserIncome } from './plaid-api';
import { Account } from './plaid-definitions';

export interface FinancialSummary {
  totalIncome: number;
  totalBalance: number;
  cashBalance: number;
  creditBalance: number;
  netWorth: number;
}

export async function fetchFinancialSummary(
  userId: number
): Promise<FinancialSummary> {
  const [accounts, totalIncome] = await Promise.all([
    getUserAccounts(userId),
    getUserIncome(userId),
  ]);

  // Handle null or undefined accounts
  if (!accounts) {
    return {
      totalIncome,
      totalBalance: 0,
      cashBalance: 0,
      creditBalance: 0,
      netWorth: 0,
    };
  }

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

    // Credit cards and loans are liabilities (negative in net worth calculation)
    if (account.type === 'credit' || account.type === 'loan') {
      creditBalance += balance;
    }
  });

  const netWorth = totalAssets - creditBalance;

  return {
    totalIncome,
    totalBalance: totalAssets,
    cashBalance,
    creditBalance,
    netWorth,
  };
}

export async function fetchRecentTransactions(userId: number, limit: number) {
  const allTransactions = await getUserTransactions(userId);

  // Handle null or undefined transactions
  if (!allTransactions) {
    return [];
  }

  // Sort by date descending and take the first 'limit' items
  return allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export interface SpendingByCategory {
  category: string;
  amount: number;
}

export async function fetchSpendingByCategory(
  userId: number
): Promise<SpendingByCategory[]> {
  const transactions = await getUserTransactions(userId);

  // Handle null or undefined transactions
  if (!transactions) {
    return [];
  }

  // Group transactions by category and sum amounts
  const categoryMap = new Map<string, number>();

  transactions.forEach((transaction) => {
    // Only count positive amounts (expenses, not income)
    if (transaction.amount > 0) {
      const category = transaction.category || 'Uncategorized';
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + transaction.amount);
    }
  });

  // Convert map to array and sort by amount descending
  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}
