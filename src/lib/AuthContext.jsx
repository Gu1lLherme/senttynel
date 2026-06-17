import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getFakeUser, setFakeUser, clearFakeUser } from '@/lib/fakeAuth';

const AuthContext = createContext();

// Autenticação FICTÍCIA — liberada para todos os usuários (modo de teste).
// Não utiliza a autenticação real do Base44; os dados ficam no localStorage.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const existing = getFakeUser();
    if (existing) {
      setUser(existing);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (data) => {
    const u = setFakeUser(data || {});
    setUser(u);
    setIsAuthenticated(true);
    return u;
  };

  const logout = () => {
    clearFakeUser();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const navigateToLogin = () => {
    window.location.href = '/acesso';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      login,
      logout,
      navigateToLogin,
      checkAppState: () => {},
    }}>
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