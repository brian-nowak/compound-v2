import {
  BanknotesIcon,
  CreditCardIcon,
  ScaleIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchFinancialSummary } from '@/app/lib/financial-data';
import { formatCurrency } from '@/app/lib/utils';

const iconMap = {
  cash: BanknotesIcon,
  credit: CreditCardIcon,
  balance: WalletIcon,
  netWorth: ScaleIcon,
  income: ArrowTrendingUpIcon,
};

const getValueColor = (type: string) => {
  switch(type) {
    case 'income': return 'text-green-600 dark:text-green-400';
    case 'credit': return 'text-red-600 dark:text-red-400';
    default: return 'text-card-foreground';
  }
};

export default async function FinancialCards({ userId }: { userId: number }) {
  const summary = await fetchFinancialSummary(userId);

  return (
    <>
      <Card title="Total Income" value={summary.totalIncome} type="income" />      
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
  type: 'cash' | 'credit' | 'balance' | 'netWorth' | 'income';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-card p-2 shadow-sm border border-border">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-muted-foreground" /> : null}
        <h3 className="ml-2 text-sm font-medium text-card-foreground">{title}</h3>
      </div>
      <p
        className={`${lusitana.className} truncate rounded-xl bg-muted px-4 py-8 text-center text-2xl ${getValueColor(type)}`}
      >
        {typeof value === 'number' ? formatCurrency(value) : value}
      </p>
    </div>
  );
}
