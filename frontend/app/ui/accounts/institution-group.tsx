'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { BuildingLibraryIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import type { Account } from '@/app/lib/plaid-definitions';
import { AccountCard, AccountCardSkeleton } from './account-card';
import { formatCurrency } from '@/app/lib/utils';
import { syncTransactions } from '@/app/lib/plaid-api';

interface InstitutionGroupProps {
  institutionId: string;
  institutionName?: string;
  accounts: Account[];
  defaultExpanded?: boolean;
}

export function InstitutionGroup({
  institutionId,
  institutionName,
  accounts,
  defaultExpanded = true,
}: InstitutionGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ added: number; modified: number; removed: number } | null>(null);

  const handleSyncTransactions = async () => {
    if (accounts.length === 0) return;

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      // Get item_id from first account (all accounts in a group share the same item_id)
      const itemId = accounts[0].item_id;
      const result = await syncTransactions(itemId);
      setSyncStatus(result);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (error) {
      console.error('Error syncing transactions:', error);
      alert('Failed to sync transactions. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Calculate total balance across all accounts in this institution
  const totalBalance = accounts.reduce((sum, account) => {
    const balance = account.current_balance ?? account.available_balance ?? 0;
    // For credit/loan accounts, balance represents debt (subtract from total)
    if (account.type === 'credit' || account.type === 'loan') {
      return sum - balance;
    }
    return sum + balance;
  }, 0);

  const displayName = institutionName || `Institution ${institutionId.slice(0, 8)}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between p-4 text-left hover:bg-gray-100"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{displayName}</h2>
            <p className="text-sm text-gray-500">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSyncTransactions();
            }}
            onKeyDown={(e) => e.stopPropagation()}
            disabled={isSyncing}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50',
              isSyncing ? 'text-blue-400' : 'text-blue-600'
            )}
            title="Sync transactions from Plaid"
          >
            <ArrowPathIcon className={clsx('h-4 w-4', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-500">Net Balance</p>
            <p
              className={clsx(
                'text-lg font-semibold',
                totalBalance < 0 ? 'text-red-600' : 'text-gray-900'
              )}
            >
              {formatCurrency(totalBalance)}
            </p>
          </div>
          {expanded ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {syncStatus && (
        <div className="mx-4 mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <p className="font-medium">Sync completed!</p>
          <p className="text-xs text-green-700">
            Added: {syncStatus.added} | Modified: {syncStatus.modified} | Removed: {syncStatus.removed}
          </p>
        </div>
      )}

      {expanded && (
        <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}

export function InstitutionGroupSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gray-200" />
          <div>
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="mt-1 h-4 w-20 rounded bg-gray-200" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="mt-1 h-6 w-24 rounded bg-gray-200" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AccountCardSkeleton />
        <AccountCardSkeleton />
      </div>
    </div>
  );
}
