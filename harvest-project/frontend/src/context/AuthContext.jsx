import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  // Restore the session from the stored token.
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api
      .get('/user')
      .then((res) => setUser(res.data.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  // A 401 anywhere in the app logs the user out (the router then redirects to /login).
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user.data ?? res.data.user);
  }, []);

  const register = useCallback(async (form) => {
    const res = await api.post('/register', form);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user.data ?? res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch {
      /* token may already be invalid – still log out locally */
    }
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
