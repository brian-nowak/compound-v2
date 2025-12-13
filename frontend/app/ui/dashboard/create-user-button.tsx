'use client';

import { useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { createUser } from '@/app/lib/plaid-api';

export default function CreateUserButton() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUser = async () => {
    const username = prompt('Enter new username:');

    if (!username || username.trim() === '') {
      return;
    }

    setIsCreating(true);

    try {
      const user = await createUser(username.trim());
      alert(`User created successfully!\nUsername: ${user.username}\nUser ID: ${user.id}`);

      // Refresh the page to update user switcher
      window.location.reload();
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreateUser}
      disabled={isCreating}
      className="flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-muted p-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 md:justify-start md:p-2 md:px-3 transition-colors"
    >
      <UserPlusIcon className="w-6" />
      <span className="hidden md:block">
        {isCreating ? 'Creating...' : 'Create User'}
      </span>
    </button>
  );
}
