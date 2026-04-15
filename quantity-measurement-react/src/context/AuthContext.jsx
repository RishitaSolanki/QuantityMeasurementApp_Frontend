import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('qm_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('qm_token') || null);
  const [isGuest, setIsGuest] = useState(() => sessionStorage.getItem('qm_guest') === 'true');

  const login = useCallback((data) => {
    localStorage.setItem('qm_token', data.token);
    localStorage.setItem('qm_user', JSON.stringify(data.user));
    sessionStorage.removeItem('qm_guest');
    setToken(data.token);
    setUser(data.user);
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
