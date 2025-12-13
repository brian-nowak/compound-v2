import {
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { Account, AccountType } from '@/app/lib/plaid-definitions';
import { formatCurrency } from '@/app/lib/utils';

const accountTypeIcons: Record<AccountType, React.ComponentType<{ className?: string }>> = {
  depository: BanknotesIcon,
  credit: CreditCardIcon,
  loan: BuildingLibraryIcon,
  investment: ChartBarIcon,
  brokerage: ChartBarIcon,
  other: BanknotesIcon,
};

const accountTypeColors: Record<AccountType, string> = {
  depository: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  credit: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  loan: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  investment: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  brokerage: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  other: 'bg-muted text-muted-foreground',
};

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const Icon = accountTypeIcons[account.type] || BanknotesIcon;
  const colorClass = accountTypeColors[account.type] || accountTypeColors.other;

  const balance = account.current_balance ?? account.available_balance;
  const displayBalance = balance !== null ? formatCurrency(balance) : 'N/A';

  // Credit accounts show debt as positive, so we display it differently
  const isDebt = account.type === 'credit' || account.type === 'loan';

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx('rounded-lg p-2', colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-card-foreground">{account.name}</h3>
            <p className="text-sm text-muted-foreground">
              {account.subtype} {account.mask && `••••${account.mask}`}
            </p>
          </div>
        </div>
        <span
          className={clsx(
            'rounded-full px-2 py-1 text-xs font-medium',
            colorClass
          )}
        >
          {account.type}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {isDebt ? 'Balance Owed' : 'Current Balance'}
          </p>
          <p
            className={clsx(
              'text-xl font-semibold',
              isDebt && balance !== null && balance > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-card-foreground'
            )}
          >
            {displayBalance}
          </p>
        </div>
        {account.available_balance !== null &&
          account.available_balance !== account.current_balance && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-lg font-medium text-muted-foreground">
                {formatCurrency(account.available_balance)}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

export function AccountCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-muted" />
          <div>
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="mt-1 h-4 w-24 rounded bg-muted" />
          </div>
        </div>
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>
      <div className="mt-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="mt-1 h-7 w-28 rounded bg-muted" />
      </div>
    </div>
  );
}
