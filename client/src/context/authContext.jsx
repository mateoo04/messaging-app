import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import socket from '../utils/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState({});

  const logIn = (user) => {
    setIsAuthenticated(true);
    setAuthenticatedUser(user);
  };
  const logOut = async () => {
    try {
      const response = await fetch('/api/auth/log-out', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error logging out');

      const json = await response.json();

      if (json.success) {
        setIsAuthenticated(false);
        setAuthenticatedUser({});
      }
    } catch {
      toast.error('Error logging out');
    }
  };

  useEffect(() => {
    const validateCredentials = async () => {
      if (!Cookies.get('username')) return;

      try {
        const response = await fetch('/api/auth/validate-credentials', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.status === 401) return;
        if (!response.ok) throw new Error('Failed to validate credentials');

        const json = await response.json();

        if (json.success) {
          setIsAuthenticated(true);
          setAuthenticatedUser(json.user);
        }
      } catch {
        console.log('Error validating credentials');
      }
    };

    validateCredentials();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authenticatedUser,
        setAuthenticatedUser,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
