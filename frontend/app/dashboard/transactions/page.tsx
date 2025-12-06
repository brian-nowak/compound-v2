import { lusitana } from '@/app/ui/fonts';
import { getUserTransactions } from '@/app/lib/plaid-api';
import TransactionsTable from '@/app/ui/transactions/table';
import { Suspense } from 'react';
import { TransactionsTableSkeleton } from '@/app/ui/skeletons';

export default async function TransactionsPage() {
  // TODO: Get userId from user context instead of hardcoding
  const userId = 1;

  const transactions = await getUserTransactions(userId);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Transactions
      </h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <p className="text-sm text-gray-600">
          Showing {transactions.length} transactions
        </p>
      </div>
      <Suspense fallback={<TransactionsTableSkeleton />}>
        <TransactionsTable transactions={transactions} />
      </Suspense>
    </main>
  );
}
