'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as authService from './api/auth.service';
import { setAccessToken, setTokenRefreshCallback } from './api/client';
import { HttpError } from './api/client';
import type { User as ApiUser } from './api/types';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [isInitialized, setIsInitialized] = useState(false);

  // Convert API user to local user format
  const convertApiUser = (apiUser: ApiUser): User => ({
    id: apiUser.id,
    name: apiUser.username,
    email: apiUser.email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiUser.email}`,
  });

  // Token refresh function
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await authService.refreshToken();
      setAccessToken(response.accessToken);
      return response.accessToken;
    } catch (error) {
      // Refresh failed, clear user state
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

  // Initialize auth state on mount by attempting token refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh token from cookie
        const response = await authService.refreshToken();
        setAccessToken(response.accessToken);
        
        // Note: The refresh endpoint doesn't return user data
        // We'll get user data after first login/signup
        // For now, just keep the token
      } catch (error) {
        // No valid refresh token, user needs to login
        setAccessToken(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Set up token refresh callback for API client
    setTokenRefreshCallback(refreshAccessToken);
    
    initAuth();
  }, [refreshAccessToken]);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const response = await authService.signin({ email, password });
      
      // Set access token in memory
      setAccessToken(response.accessToken);
      
      // Convert and set user
      const newUser = convertApiUser(response.user);
      setUser(newUser);
      
      // Store email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
    } catch (error) {
      // Clear any existing state on error
      setAccessToken(null);
      setUser(null);
      
      // Re-throw error so components can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({
        email,
        username: name,
        password,
      });

      // Set access token in memory
      setAccessToken(response.accessToken);
      
      // Convert and set user
      const newUser = convertApiUser(response.user);
      setUser(newUser);
    } catch (error) {
      // Clear any existing state on error
      setAccessToken(null);
      setUser(null);
      
      // Re-throw error so components can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear refresh token cookie
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear local state
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('rememberEmail');
    }
  }, []);

  const updateProfile = useCallback((name: string, email: string, avatar?: string) => {
    // Note: This is a local-only update
    // TODO: Implement backend API endpoint for profile updates
    if (user) {
      const updated = { ...user, name, email, avatar: avatar || user.avatar };
      setUser(updated);
    }
  }, [user]);

  const deleteAccount = useCallback(async () => {
    // Note: This is a local-only delete
    // TODO: Implement backend API endpoint for account deletion
    try {
      await logout();
    } catch (error) {
      console.error('Delete account error:', error);
    }
  }, [logout]);

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
      {isInitialized ? children : null}
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
