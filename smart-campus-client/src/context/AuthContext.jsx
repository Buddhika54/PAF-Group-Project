import { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext(null);

const parseToken = (token) => {
  if (!token || token === 'undefined' || token === 'null') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const payload = parseToken(storedToken);
    if (payload) {
      setToken(storedToken);
      setUser({
        id: payload.id,
        name: payload.name || payload.sub?.split('@')[0] || 'User',
        email: payload.sub || payload.email,
        role: payload.role || 'USER',
      });
    } else {
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

<<<<<<< HEAD
  const login = (newToken) => {
    const payload = parseToken(newToken);
    if (!payload) {
      console.error('Invalid token');
      return;
    }
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser({
      id: payload.id,
      name: payload.name || payload.sub?.split('@')[0] || 'User',
      email: payload.sub || payload.email,
      role: payload.role || 'USER',
    });
  };
=======
  const login = (token) => {
  localStorage.setItem('token', token);
  const decoded = jwtDecode(token);

  setToken(token);
  setUser({
    id: decoded.id,
    name: decoded.name,
    email: decoded.sub,
    picture: decoded.picture,
    role: decoded.role || "USER",
  });
};
>>>>>>> baa448a036f09821e3b60f7128394aabd04c1726

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user && !!token,
      isAdmin: user?.role === 'ADMIN',
      isTechnician: user?.role === 'TECHNICIAN',
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};