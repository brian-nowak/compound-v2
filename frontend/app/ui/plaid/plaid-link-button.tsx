'use client';

import { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface PlaidLinkButtonProps {
  userId: number;
  linkToken: string;
  itemId?: number;
  onSuccess?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function PlaidLinkButton({
  userId,
  linkToken,
  itemId,
  onSuccess,
  className,
  variant = 'primary',
}: PlaidLinkButtonProps) {
  const [isExchanging, setIsExchanging] = useState(false);

  const handleSuccess = useCallback(
    async (publicToken: string) => {
      setIsExchanging(true);
      try {
        const response = await fetch('/api/plaid/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicToken, userId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to link account');
        }

        // Sync transactions for the newly linked item
        const data = await response.json();
        await fetch(`/api/plaid/items/${data.item_id}/sync-transactions`, {
          method: 'POST',
        });

        onSuccess?.();
      } catch (error) {
        console.error('Error exchanging token:', error);
      } finally {
        setIsExchanging(false);
      }
    },
    [userId, onSuccess]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken) => handleSuccess(publicToken),
    onExit: (err) => {
      if (err) {
        console.error('Plaid Link error:', err);
      }
    },
  });

  const isUpdate = itemId !== undefined;

  return (
    <button
      onClick={() => open()}
      disabled={!ready || isExchanging}
      className={clsx(
        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && [
          'bg-blue-500 text-white hover:bg-blue-400',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        ],
        variant === 'secondary' && [
          'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ],
        className
      )}
    >
      {isExchanging ? (
        <>
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          Linking...
        </>
      ) : isUpdate ? (
        <>
          <ArrowPathIcon className="h-5 w-5" />
          Reconnect
        </>
      ) : (
        <>
          <PlusIcon className="h-5 w-5" />
          Link Account
        </>
      )}
    </button>
  );
}
