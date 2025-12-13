'use client';

import { getLinkToken } from '@/app/lib/plaid-api';
import { PlaidLinkClient } from './plaid-link-client';
import { useEffect, useState } from 'react';

interface PlaidLinkWrapperProps {
  userId: number;
  itemId?: number;
}

export function PlaidLinkWrapper({ userId, itemId }: PlaidLinkWrapperProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getLinkToken(userId, itemId)
      .then((token) => {
        setLinkToken(token);
        setError(null);
      })
      .catch((e) => {
        const errorMessage = e instanceof Error ? e.message : 'Failed to get link token';
        setError(errorMessage);
        console.error('Failed to get Plaid link token:', errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId, itemId]);

  if (isLoading) {
    return (
      <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
    );
  }

  if (!linkToken) {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed"
        title={error || 'Unable to connect to Plaid'}
      >
        Link Account
      </button>
    );
  }

  return <PlaidLinkClient userId={userId} linkToken={linkToken} itemId={itemId} />;
}
