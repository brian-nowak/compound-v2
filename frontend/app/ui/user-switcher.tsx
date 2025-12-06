'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/lib/user-context';
import { User } from '@/app/lib/plaid-definitions';
import { ChevronDownIcon, UserCircleIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function UserSwitcher() {
  const { currentUser, setCurrentUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all users when dropdown opens
  useEffect(() => {
    if (isOpen && allUsers.length === 0) {
      setIsLoading(true);
      fetch('/api/plaid/users')
        .then((res) => res.json())
        .then((users) => setAllUsers(users))
        .catch((err) => console.error('Failed to fetch users:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, allUsers.length]);

  const handleCreateUser = async () => {
    const username = prompt('Enter username for new user:');
    if (!username) return;

    try {
      const response = await fetch('/api/plaid/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setAllUsers([...allUsers, newUser]);
        setCurrentUser(newUser);
        setIsOpen(false);
        // Reload page to refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setIsOpen(false);
    // Reload page to refresh data for new user
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
      >
        <UserCircleIcon className="h-5 w-5" />
        <span className="flex-1 text-left truncate">
          {currentUser?.username || 'Loading...'}
        </span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 z-20 mt-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  Loading users...
                </div>
              ) : (
                <>
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSwitchUser(user)}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                        currentUser?.id === user.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {user.username}
                      {currentUser?.id === user.id && (
                        <span className="ml-2 text-xs">(current)</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={handleCreateUser}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Create New User
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
