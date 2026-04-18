import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('qm_user') || 'null');
  } catch {
    return null;
  }
});
  const [token, setToken] = useState(() => localStorage.getItem('qm_token') || null);
  const [isGuest, setIsGuest] = useState(() => sessionStorage.getItem('qm_guest') === 'true');

  const login = useCallback((data) => {
    const token = data.Token || data.token; // Handle both capital T and lowercase
    localStorage.setItem('qm_token', token);
    
    // Extract user info from JWT token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = {
        email: payload.email,
        name: payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.sub || 'User'
      };
      localStorage.setItem('qm_user', JSON.stringify(user));
      setUser(user);
    } catch {
      // If JWT parsing fails, store minimal user info
      localStorage.setItem('qm_user', JSON.stringify({ name: 'User' }));
      setUser({ name: 'User' });
    }
    
    sessionStorage.removeItem('qm_guest');
    setToken(token);
    setIsGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    sessionStorage.setItem('qm_guest', 'true');
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_user');
    setToken(null);
    setUser(null);
    setIsGuest(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_user');
    sessionStorage.removeItem('qm_guest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  }, []);

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isGuest, isLoggedIn, login, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
