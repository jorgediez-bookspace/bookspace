import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { AppStorage } from '../storage/storage';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const DEMO_USER: UserProfile = {
  id: 'demo-user-1',
  email: 'demo@bookspace.app',
  displayName: 'Alex Reader',
  avatarPresetId: 'avatar-1',
};

export const DEMO_PASSWORD = 'BookSpace123!';

const AUTH_USER_KEY = '@bookspace:auth_user';
const USERS_DB_KEY = '@bookspace:users_db';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth & ensure demo account is seeded
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Ensure demo user exists in registered users db
        const usersDb = await AppStorage.getItem<Record<string, { profile: UserProfile; password: string }>>(
          USERS_DB_KEY,
          {}
        );

        if (!usersDb[DEMO_USER.email.toLowerCase()]) {
          usersDb[DEMO_USER.email.toLowerCase()] = {
            profile: DEMO_USER,
            password: DEMO_PASSWORD,
          };
          await AppStorage.setItem(USERS_DB_KEY, usersDb);
        }

        // Check if an active session exists
        const savedUser = await AppStorage.getItem<UserProfile | null>(AUTH_USER_KEY, null);
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (err) {
        console.warn('[AuthContext] init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const usersDb = await AppStorage.getItem<Record<string, { profile: UserProfile; password: string }>>(
      USERS_DB_KEY,
      {}
    );

    const match = usersDb[cleanEmail];
    if (!match) {
      // If it's the demo email, allow it
      if (cleanEmail === DEMO_USER.email.toLowerCase() && pass === DEMO_PASSWORD) {
        await AppStorage.setItem(AUTH_USER_KEY, DEMO_USER);
        setUser(DEMO_USER);
        return { success: true };
      }
      return { success: false, error: 'User not found. Please sign up or use Quick Demo.' };
    }

    if (match.password !== pass) {
      return { success: false, error: 'Incorrect password.' };
    }

    await AppStorage.setItem(AUTH_USER_KEY, match.profile);
    setUser(match.profile);
    return { success: true };
  };

  const signup = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const usersDb = await AppStorage.getItem<Record<string, { profile: UserProfile; password: string }>>(
      USERS_DB_KEY,
      {}
    );

    if (usersDb[cleanEmail]) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      email: cleanEmail,
      displayName: name.trim() || cleanEmail.split('@')[0],
      avatarPresetId: 'avatar-1',
    };

    usersDb[cleanEmail] = {
      profile: newProfile,
      password: pass,
    };

    await AppStorage.setItem(USERS_DB_KEY, usersDb);
    await AppStorage.setItem(AUTH_USER_KEY, newProfile);
    setUser(newProfile);
    return { success: true };
  };

  const loginWithGoogle = async () => {
    const googleUser: UserProfile = {
      id: 'google-user-1',
      email: 'alex.google@bookspace.app',
      displayName: 'Alex Reader (Google)',
      avatarPresetId: 'avatar-2',
    };
    await AppStorage.setItem(AUTH_USER_KEY, googleUser);
    setUser(googleUser);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = { ...user, ...updates };
    setUser(updated);
    await AppStorage.setItem(AUTH_USER_KEY, updated);

    // Also update users DB
    const usersDb = await AppStorage.getItem<Record<string, { profile: UserProfile; password: string }>>(
      USERS_DB_KEY,
      {}
    );
    if (usersDb[updated.email.toLowerCase()]) {
      usersDb[updated.email.toLowerCase()].profile = updated;
      await AppStorage.setItem(USERS_DB_KEY, usersDb);
    }
  };

  const logout = async () => {
    await AppStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  const deleteAccount = async () => {
    if (!user) return;
    const usersDb = await AppStorage.getItem<Record<string, { profile: UserProfile; password: string }>>(
      USERS_DB_KEY,
      {}
    );
    delete usersDb[user.email.toLowerCase()];
    await AppStorage.setItem(USERS_DB_KEY, usersDb);
    await AppStorage.removeItem(AUTH_USER_KEY);
    // Wipe user-specific books and notes
    await AppStorage.removeItem(`@bookspace:books:${user.id}`);
    await AppStorage.removeItem(`@bookspace:notes:${user.id}`);
    await AppStorage.removeItem(`@bookspace:sessions:${user.id}`);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        updateProfile,
        logout,
        deleteAccount,
      }}
    >
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
