import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({});

  const logIn = (user) => {
    setIsAuthenticated(true);
    setUser(user);
  };
  const logOut = () => {
    setIsAuthenticated(false);
    setUser({});
  };
  const getUser = () => user;

  useEffect(() => {
    const validateCredentials = async () => {
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
          setUser(json.user);
        }
      } catch {
        console.log('Error validating credentials');
      }
    };

    validateCredentials();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, getUser, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
