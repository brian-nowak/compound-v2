'use client';

import { useRouter } from 'next/navigation';
import { PlaidLinkButton } from '@/app/ui/plaid/plaid-link-button';

interface PlaidLinkClientProps {
  userId: number;
  linkToken: string;
  itemId?: number;
}

export function PlaidLinkClient({ userId, linkToken, itemId }: PlaidLinkClientProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Refresh the page to show newly linked accounts
    router.refresh();
  };

  return (
    <PlaidLinkButton
      userId={userId}
      linkToken={linkToken}
      itemId={itemId}
      onSuccess={handleSuccess}
    />
  );
}
