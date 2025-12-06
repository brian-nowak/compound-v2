import {
  BanknotesIcon,
  CreditCardIcon,
  ScaleIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchFinancialSummary } from '@/app/lib/financial-data';
import { formatCurrency } from '@/app/lib/utils';

const iconMap = {
  cash: BanknotesIcon,
  credit: CreditCardIcon,
  balance: WalletIcon,
  netWorth: ScaleIcon,
};

export default async function FinancialCards({ userId }: { userId: number }) {
  const summary = await fetchFinancialSummary(userId);

  return (
    <>
      <Card title="Total Balance" value={summary.totalBalance} type="balance" />
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

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className} truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {typeof value === 'number' ? formatCurrency(value) : value}
      </p>
    </div>
  );
}
