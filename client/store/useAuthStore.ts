'use client';

import { create } from 'zustand';
import { User, SavedAddress } from '@/types';
import { apiRequest, getStoredToken, setStoredToken } from '@/lib/api';

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

interface AuthState {
  user: User | null;
  initialized: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (payload: {
    name?: string;
    phone?: string;
    savedAddress?: SavedAddress;
  }) => Promise<User>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  isLoading: false,
  isAuthModalOpen: false,

  fetchMe: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ initialized: true, user: null });
      return;
    }
    try {
      const data = await apiRequest<{ success: boolean; user: User }>('/auth/me');
      set({ user: data.user, initialized: true });
    } catch {
      setStoredToken(null);
      set({ user: null, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(data.token);
      set({ user: data.user, isLoading: false, isAuthModalOpen: false, initialized: true });
      return data.user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredToken(data.token);
      set({ user: data.user, isLoading: false, isAuthModalOpen: false, initialized: true });
      return data.user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout network error
    }
    setStoredToken(null);
    set({ user: null });
  },

  updateProfile: async (payload) => {
    const data = await apiRequest<{ success: boolean; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    set({ user: data.user });
    return data.user;
  },

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
