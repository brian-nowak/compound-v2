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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  TotalIncomeValue,
  TotalBalanceValue,
  CashBalanceValue,
  CreditBalanceValue,
  NetWorthValue,
} from '@/app/ui/dashboard/financial-metric-values';
import FilterSidebar from '@/app/ui/dashboard/filter-sidebar';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ dateRange?: string; category?: string }>
}) {
  // TODO: Get userId from user context instead of hardcoding
  const userId = 1;

  // Await searchParams in Next.js 15+
  const params = await searchParams;

  // Extract filters from URL
  const filters = {
    dateRange: params.dateRange || 'all',
    category: params.category || 'all'
  };

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - spans 3 columns */}
        <div className="col-span-12 lg:col-span-3">
          <FilterSidebar />
        </div>

        {/* Main content - spans 9 columns */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Suspense fallback={<CardsSkeleton />}>
              <FinancialCards userId={userId} />
            </Suspense>
          </div>

          {/* RSC comparison section */}
          <div>
            <h2 className="mb-4">React Server Components (RSCs) + shadcn/ui</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Income</CardTitle>
                  <CardDescription>
                    Income from Databricks - {filters.dateRange === 'all' ? 'All Time' : filters.dateRange === '30d' ? 'Last 30 Days' : filters.dateRange === '90d' ? 'Last 90 Days' : 'Last Year'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="text-2xl font-bold">Loading...</div>}>
                    <TotalIncomeValue userId={userId} filters={filters} />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Balance</CardTitle>
                  <CardDescription>
                    All depository, investment, and brokerage accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="text-2xl font-bold">Loading...</div>}>
                    <TotalBalanceValue userId={userId} />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cash</CardTitle>
                  <CardDescription>
                    Checking and savings accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="text-2xl font-bold">Loading...</div>}>
                    <CashBalanceValue userId={userId} />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credit Card Debt</CardTitle>
                  <CardDescription>
                    Total credit card and loan balances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="text-2xl font-bold">Loading...</div>}>
                    <CreditBalanceValue userId={userId} />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Net Worth</CardTitle>
                  <CardDescription>
                    Total assets minus liabilities -------
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="text-2xl font-bold">Loading...</div>}>
                    <NetWorthValue userId={userId} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Spending Chart */}
          <div>
            <Suspense fallback={<RevenueChartSkeleton />}>
              <SpendingChart userId={userId} filters={filters} />
            </Suspense>
          </div>

          {/* Recent Transactions */}
          <div>
            <Suspense fallback={<LatestInvoicesSkeleton />}>
              <RecentTransactions userId={userId} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}