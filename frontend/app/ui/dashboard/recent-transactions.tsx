import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { lusitana } from '@/app/ui/fonts';
import { fetchRecentTransactions } from '@/app/lib/financial-data';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';

export default async function RecentTransactions({
  userId,
}: {
  userId: number;
}) {
  const recentTransactions = await fetchRecentTransactions(userId, 5);

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Transactions
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {recentTransactions.map((transaction, i) => {
            const isIncome = transaction.amount < 0;
            const displayAmount = Math.abs(transaction.amount);

            return (
              <div
                key={transaction.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  }
                )}
              >
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {transaction.name}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {formatDateToLocal(transaction.date)}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base ${
                    isIncome ? 'text-green-600' : 'text-gray-900'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(displayAmount)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
