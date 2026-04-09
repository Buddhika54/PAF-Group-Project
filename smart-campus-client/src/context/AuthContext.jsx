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
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.sub,
            picture: decoded.picture,
            role: decoded.role || "USER",
          });
        } else {
          localStorage.clear();
        }
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

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
  const login = (token) => {
    console.log('AUTH CONTEXT - login() called with token:', token ? 'exists' : 'missing');
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);

    console.log('AUTH CONTEXT - Setting user state:', decoded);
    setToken(token);
    setUser({
      id: decoded.id,
      name: decoded.name,
      email: decoded.sub,
      picture: decoded.picture,
      role: decoded.role || "USER",
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // Helper functions for role checking
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isStudent = user?.role === 'USER' || user?.role === 'STUDENT';
  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600"></div>
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
      isAuthenticated,
      isAdmin,
      isTechnician,
      isStudent,
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

// Route guard for authenticated users only
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  
  return children;
};

// Route guard for Admin only
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
  
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  
  if (!isAdmin) {
    window.location.href = '/dashboard';
    return null;
  }
  
  return children;
};

// Route guard for Technician only
export const TechnicianRoute = ({ children }) => {
  const { isAuthenticated, isTechnician } = useAuth();
  
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  
  if (!isTechnician) {
    window.location.href = '/dashboard';
    return null;
  }
  
  return children;
};

// Route guard for Student/User only
export const StudentRoute = ({ children }) => {
  const { isAuthenticated, isStudent, isAdmin, isTechnician } = useAuth();
  
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  
  // Redirect if not student (i.e., admin or technician trying to access student routes)
  if (!isStudent) {
    if (isAdmin) {
      window.location.href = '/admin/dashboard';
    } else if (isTechnician) {
      window.location.href = '/technician/dashboard';
    } else {
      window.location.href = '/dashboard';
    }
    return null;
  }
  
  return children;
};

// Combined route guard for specific roles
export const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  
  if (!allowedRoles.includes(user?.role)) {
    // Redirect based on role
    if (user?.role === 'ADMIN') {
      window.location.href = '/admin/dashboard';
    } else if (user?.role === 'TECHNICIAN') {
      window.location.href = '/technician/dashboard';
    } else {
      window.location.href = '/dashboard';
    }
    return null;
  }
  
  return children;
};