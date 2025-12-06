import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchSpendingByCategory } from '@/app/lib/financial-data';
import { formatCurrency } from '@/app/lib/utils';

export default async function SpendingChart({ userId }: { userId: number }) {
  const spendingData = await fetchSpendingByCategory(userId);

  // Take top 5 categories for display
  const topCategories = spendingData.slice(0, 5);

  // Find max for scaling
  const maxAmount = topCategories[0]?.amount || 1;

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Top Spending Categories
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 sm:gap-4 md:gap-4">
          {topCategories.map((category) => {
            const heightPercentage = (category.amount / maxAmount) * 100;

            return (
              <div
                key={category.category}
                className="flex flex-col items-center gap-2"
                style={{ gridColumn: 'span 2' }}
              >
                <div className="w-full flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-md bg-blue-300"
                    style={{
                      height: `${Math.max(heightPercentage * 2, 20)}px`,
                    }}
                  ></div>
                  <p className="text-xs text-gray-600 text-center break-words w-full">
                    {category.category}
                  </p>
                </div>
                <p className="text-xs font-medium">
                  {formatCurrency(category.amount)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">All time</h3>
        </div>
      </div>
    </div>
  );
}
