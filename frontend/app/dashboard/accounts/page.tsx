'use client';

import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { InstitutionGroupSkeleton } from '@/app/ui/accounts/institution-group';
import { AccountsList } from './accounts-list';
import { PlaidLinkWrapper } from './plaid-link-wrapper';
import { useUser } from '@/app/lib/user-context';

export default function AccountsPage() {
  const { userId } = useUser();

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Linked Accounts</h1>
        <Suspense fallback={<PlaidLinkButtonSkeleton />}>
          <PlaidLinkWrapper userId={userId} />
        </Suspense>
      </div>

      <div className="mt-6 space-y-6">
        <Suspense fallback={<AccountsListSkeleton />}>
          <AccountsList userId={userId} />
        </Suspense>
      </div>
    </main>
  );
}

function PlaidLinkButtonSkeleton() {
  return (
    <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
  );
}

function AccountsListSkeleton() {
  return (
    <div className="space-y-6">
      <InstitutionGroupSkeleton />
      <InstitutionGroupSkeleton />
    </div>
  );
}
