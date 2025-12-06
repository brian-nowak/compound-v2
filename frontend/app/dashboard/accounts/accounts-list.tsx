'use client';

import { getUserAccounts } from '@/app/lib/plaid-api';
import { InstitutionGroup } from '@/app/ui/accounts/institution-group';
import type { Account } from '@/app/lib/plaid-definitions';
import { useEffect, useState } from 'react';

interface AccountsListProps {
  userId: number;
}

export function AccountsList({ userId }: AccountsListProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getUserAccounts(userId)
      .then((data) => {
        setAccounts(data || []);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to fetch accounts');
        setAccounts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-gray-600">Loading accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 text-center">
        <p className="text-orange-800">
          Unable to load accounts. Make sure the Go backend is running.
        </p>
        <p className="mt-2 text-sm text-orange-600">{error}</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-gray-600">No linked accounts yet.</p>
        <p className="mt-2 text-sm text-gray-500">
          Click &quot;Link Account&quot; above to connect your bank.
        </p>
      </div>
    );
  }

  // Group accounts by institution (using item_id as proxy since we don't have institution directly)
  // TODO: Enhance Go backend to return institution info with accounts
  const accountsByInstitution = accounts.reduce<Record<number, Account[]>>(
    (groups, account) => {
      const key = account.item_id;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(account);
      return groups;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.entries(accountsByInstitution).map(([itemId, itemAccounts]) => (
        <InstitutionGroup
          key={itemId}
          institutionId={itemId}
          institutionName={itemAccounts[0]?.institution_name || undefined}
          accounts={itemAccounts}
        />
      ))}
    </div>
  );
}
