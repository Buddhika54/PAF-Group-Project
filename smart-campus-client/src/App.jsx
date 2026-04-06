import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/admin/AdminDashboard';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        {/* ── Toast Notifications ──────────────────────── */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: {
                background: '#0d9488',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#0d9488',
              },
            },
            error: {
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />

        {/* ── Routes ───────────────────────────────────── */}
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Admin Routes wrapped in Navbar */}
          {/* <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Navbar>
                  <AdminDashboard />
                </Navbar>
              </AdminRoute>
            }
          />
          <Route path="/register" element={<div>Register Page</div>} />

          {/* ── Admin Routes ───────────────────────────── */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<div>Admin Bookings</div>} />
          <Route path="/admin/tickets" element={<div>Admin Tickets</div>} />
          <Route path="/admin/resources" element={<div>Admin Resources</div>} />
          <Route path="/admin/registrations" element={<div>Admin Registrations</div>} />
          <Route path="/admin/users" element={<div>Admin Users</div>} />

          {/* ── User Dashboard ─────────────────────────── */}
          <Route path="/dashboard" element={<div>User Dashboard</div>} />

          {/* ── Technician Dashboard ───────────────────── */}
          <Route path="/technician/dashboard" element={<div>Technician Dashboard</div>} />

          {/* ── Member 1 — Resources ───────────────────── */}
          <Route path="/resources" element={<div>Resource List</div>} />
          <Route path="/resources/:id" element={<div>Resource Detail</div>} />

          {/* ── Member 2 — Bookings ────────────────────── */}
          <Route path="/bookings" element={<div>Bookings</div>} />
          <Route path="/my-bookings" element={<div>My Bookings</div>} />

          {/* ── Member 3 — Tickets ─────────────────────── */}
          <Route path="/tickets" element={<div>Tickets</div>} />
          <Route path="/tickets/:id" element={<div>Ticket Detail</div>} />

          {/* ── 404 Fallback ───────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;