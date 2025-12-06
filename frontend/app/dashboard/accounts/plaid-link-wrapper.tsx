import { getLinkToken } from '@/app/lib/plaid-api';
import { PlaidLinkClient } from './plaid-link-client';

interface PlaidLinkWrapperProps {
  userId: number;
  itemId?: number;
}

export async function PlaidLinkWrapper({ userId, itemId }: PlaidLinkWrapperProps) {
  let linkToken: string | null = null;
  let error: string | null = null;

  try {
    linkToken = await getLinkToken(userId, itemId);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to get link token';
    console.error('Failed to get Plaid link token:', error);
  }

  if (!linkToken) {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
        title={error || 'Unable to connect to Plaid'}
      >
        Link Account
      </button>
    );
  }

  return <PlaidLinkClient userId={userId} linkToken={linkToken} itemId={itemId} />;
}
