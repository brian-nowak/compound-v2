import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { Transaction } from '@/app/lib/plaid-definitions';
import TransactionRow from './transaction-row';

export default async function TransactionsTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        {/* Mobile view - cards */}
        <div className="rounded-lg bg-gray-50 p-2 md:hidden">
          {transactions?.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </div>

        {/* Desktop view - table */}
        <table className="hidden min-w-full text-gray-900 md:table">
          <thead className="rounded-lg text-left text-sm font-normal">
            <tr>
              <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                Date
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Description
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Category
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Type
              </th>
              <th scope="col" className="px-3 py-5 font-medium text-right">
                Amount
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {transactions?.map((transaction, idx) => {
              const isIncome = transaction.amount < 0;
              const displayAmount = Math.abs(transaction.amount);

              return (
                <tr
                  key={transaction.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-3 py-3 pl-6">
                    {formatDateToLocal(transaction.date)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{transaction.name}</div>
                    {transaction.account_owner && (
                      <div className="text-xs text-gray-500">
                        {transaction.account_owner}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {transaction.category ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {transaction.category}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 capitalize">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        isIncome ? 'text-green-600' : 'text-gray-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(displayAmount)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {transaction.pending ? (
                      <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        Posted
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
