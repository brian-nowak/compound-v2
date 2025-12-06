'use client';

import { lusitana } from '@/app/ui/fonts';
import { getUserTransactions } from '@/app/lib/plaid-api';
import TransactionsTable from '@/app/ui/transactions/table';
import { Suspense, useEffect, useState } from 'react';
import { TransactionsTableSkeleton } from '@/app/ui/skeletons';
import { useUser } from '@/app/lib/user-context';
import type { Transaction } from '@/app/lib/plaid-definitions';

export default function TransactionsPage() {
  const { userId } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getUserTransactions(userId)
      .then((data) => setTransactions(data))
      .catch((err) => console.error('Failed to fetch transactions:', err))
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Transactions
      </h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <p className="text-sm text-gray-600">
          {isLoading ? 'Loading...' : `Showing ${transactions.length} transactions`}
        </p>
      </div>
      <Suspense fallback={<TransactionsTableSkeleton />}>
        {isLoading ? (
          <TransactionsTableSkeleton />
        ) : (
          <TransactionsTable transactions={transactions} />
        )}
      </Suspense>
    </main>
  );
}
