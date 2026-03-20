'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string, avatar?: string) => void;
  deleteAccount: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('rememberEmail');
  }, []);

  const updateProfile = useCallback((name: string, email: string, avatar?: string) => {
    if (user) {
      const updated = { ...user, name, email, avatar: avatar || user.avatar };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  }, [user]);

  const deleteAccount = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('rememberEmail');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        deleteAccount,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
