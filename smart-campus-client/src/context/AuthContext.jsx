import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
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
    localStorage.clear();
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
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

export const useAuth = () => useContext(AuthContext);

// Route guard for authenticated users only
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  
  return children;
};

// Route guard for Admin only
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
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