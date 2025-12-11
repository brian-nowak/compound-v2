import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { Transaction } from '@/app/lib/plaid-definitions';
import TransactionRow from './transaction-row';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TransactionsTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="mt-6 flow-root">
      {/* Mobile view - cards */}
      <div className="rounded-lg bg-muted p-2 md:hidden">
        {transactions?.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {/* Desktop view - table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => {
              const isIncome = transaction.amount < 0;
              const displayAmount = Math.abs(transaction.amount);

              return (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateToLocal(transaction.date)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{transaction.name}</div>
                    {transaction.account_owner && (
                      <div className="text-xs text-muted-foreground">
                        {transaction.account_owner}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {(transaction.primary_category || transaction.category) ? (
                      <span className="text-foreground">
                        {transaction.primary_category || transaction.category}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize">
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold ${
                        isIncome
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-foreground'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(displayAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.pending ? (
                      <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                        Posted
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
