import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import {
  CardsSkeleton,
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
} from '@/app/ui/skeletons';
import FinancialCards from '@/app/ui/dashboard/financial-cards';
import SpendingChart from '@/app/ui/dashboard/spending-chart';
import RecentTransactions from '@/app/ui/dashboard/recent-transactions';
import TotalIncomeCardRSC from '@/app/ui/dashboard/total-income-card-rsc';

export default async function Page() {
  // TODO: Get userId from user context instead of hardcoding
  const userId = 1;

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<CardsSkeleton />}>
          <FinancialCards userId={userId} />
        </Suspense>
      </div>
      {/* RSC comparison section */}
      <h2 className="mt-8">RSC Approaches (Comparison)</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<div>Loading RSC...</div>}>
          <TotalIncomeCardRSC userId={userId} />
        </Suspense>
        
        {/* <Suspense fallback={<div>Loading Server Action...</div>}>
          <TotalIncomeCardServerAction userId={userId} />
        </Suspense> */}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <SpendingChart userId={userId} />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <RecentTransactions userId={userId} />
        </Suspense>
        
      </div>
    </main>
  );
}