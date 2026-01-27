'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import type { User, AuthState } from '@/types';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        const response = await authAPI.getProfile();
        setAuthState({
          user: { ...response.data, token },
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error loading user profile:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      const response = await authAPI.login({ email, password });
      const user = response.data as User;
      
      localStorage.setItem('token', user.token as string);
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState({
        ...authState,
        loading: false,
        error: error.response?.data?.message || 'Login failed',
      });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      const response = await authAPI.register(userData);
      const user = response.data as User;
      
      if (!user.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', user.token as string);
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed.';
      setAuthState({
        ...authState,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  };

  const updateProfile = async (userData: any) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data as User;
      
      if (updatedUser.token) {
        localStorage.setItem('token', updatedUser.token as string);
      }
      
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState({
        ...authState,
        loading: false,
        error: error.response?.data?.message || 'Profile update failed',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
