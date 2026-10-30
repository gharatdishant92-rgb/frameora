import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { UserProfile, UserRole } from '../types.ts';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: UserRole;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('frm_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch profile with token
  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        console.warn('Profile fetch returned status:', res.status);
        if (res.status === 401) {
          localStorage.removeItem('frm_token');
          setToken(null);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      // Check stored token first
      const storedToken = localStorage.getItem('frm_token');
      if (storedToken) {
        setToken(storedToken);
        await fetchProfile(storedToken);
      } else {
        // Default to Priya Sharma demo client on first load so the dashboard is immediately interactive!
        try {
          const res = await fetch('/api/auth/demo-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'customer' }),
          });
          if (res.ok) {
            const data = await res.json();
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('frm_token', data.token);
          }
        } catch (e) {
          console.warn('Initial demo signin error:', e);
        }
      }

      setIsLoading(false);
    };

    initAuth();

    // Listen to Firebase auth changes if signed in via Google
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          setToken(idToken);
          localStorage.setItem('frm_token', idToken);
          await fetchProfile(idToken);
        } catch (err) {
          console.error('Firebase token retrieval error:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('frm_token', idToken);
      await fetchProfile(idToken);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('frm_token', data.token);
      }
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('frm_token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'customer',
        isLoading,
        loginWithGoogle,
        demoLogin,
        logout,
        updateProfile,
        refreshProfile,
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
