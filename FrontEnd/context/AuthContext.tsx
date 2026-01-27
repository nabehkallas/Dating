import { User, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';

// 1. Define the shape of our Context
interface AuthContextData {
  user: User | null;
  loading: boolean;
  getToken: () => Promise<string | undefined>;
}

// 2. Create the Context
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// 3. Create the Provider Component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for login/logout events
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Helper to get the token for Laravel
  const getToken = async () => {
    return user?.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom Hook for easy access
export const useAuth = () => useContext(AuthContext);