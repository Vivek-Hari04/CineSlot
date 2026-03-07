import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const userId = window.localStorage.getItem('cineslotUserId');
    const userName = window.localStorage.getItem('cineslotUserName');
    const userRole = window.localStorage.getItem('cineslotUserRole');

    if (userId && userName) {
      setUser({ id: userId, name: userName, role: userRole || 'user' });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    window.localStorage.setItem('cineslotUserId', userData.id);
    window.localStorage.setItem('cineslotUserName', userData.name);
    window.localStorage.setItem('cineslotUserRole', userData.role || 'user');
    setUser({ id: userData.id, name: userData.name, role: userData.role || 'user' });
  };

  const logout = () => {
    window.localStorage.removeItem('cineslotUserId');
    window.localStorage.removeItem('cineslotUserName');
    window.localStorage.removeItem('cineslotUserRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
