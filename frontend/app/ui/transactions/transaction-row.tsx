import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { Transaction } from '@/app/lib/plaid-definitions';
import {
  BanknotesIcon,
  ShoppingBagIcon,
  HomeIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

export default function TransactionRow({
  transaction,
}: {
  transaction: Transaction;
}) {
  // Determine if this is income or expense
  // Positive amounts are typically expenses in Plaid
  // Negative amounts are income/credits
  const isIncome = transaction.amount < 0;
  const displayAmount = Math.abs(transaction.amount);

  // Get icon based on type
  const getIcon = () => {
    switch (transaction.type) {
      case 'special':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'place':
        return <ShoppingBagIcon className="h-5 w-5" />;
      default:
        return <CreditCardIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="mb-2 w-full rounded-md bg-card p-4 border border-border">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${isIncome ? 'bg-green-100 dark:bg-green-950' : 'bg-muted'}`}>
            {getIcon()}
          </div>
          <div>
            <p className="font-medium text-card-foreground">{transaction.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateToLocal(transaction.date)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-lg font-semibold ${
              isIncome
                ? 'text-green-600 dark:text-green-400'
                : 'text-card-foreground'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(displayAmount)}
          </p>
          {transaction.pending && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Pending</p>
          )}
        </div>
      </div>
      {(transaction.primary_category || transaction.category) && (
        <div className="pt-2">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {transaction.primary_category || transaction.category}
          </span>
        </div>
      )}
    </div>
  );
}
