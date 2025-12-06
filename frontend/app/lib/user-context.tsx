'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from './plaid-definitions';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  userId: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    if (storedUserId) {
      // Fetch user data from API
      fetch(`/api/plaid/users/${storedUserId}`)
        .then((res) => res.json())
        .then((user) => setCurrentUserState(user))
        .catch(() => {
          // Default to user 1 if fetch fails
          setCurrentUserState({ id: 1, username: 'demo_user', created_at: '', updated_at: '' });
        });
    } else {
      // Default to user 1
      setCurrentUserState({ id: 1, username: 'demo_user', created_at: '', updated_at: '' });
    }
  }, []);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('currentUserId', user.id.toString());
    } else {
      localStorage.removeItem('currentUserId');
    }
  };

  const userId = currentUser?.id || 1;

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, userId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
