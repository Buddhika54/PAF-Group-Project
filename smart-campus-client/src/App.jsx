
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Resources from './pages/resource/Resources';
import ResourceDetails from './pages/resource/ResourceDetails';
import EditResource from './pages/resource/EditResource';
import AddResource from './pages/resource/AddResource'; 
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/admin/AdminDashboard';
import Register from './pages/Register';
import { Navigate } from 'react-router-dom';
import TechnicianResources from './pages/Technician/TechnicianResource';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>


        {/* Member 1 */}
        
          {/* Member 2 */}
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
          
          <Route path="/admin/registrations" element={<div>Admin Registrations</div>} />
          <Route path="/admin/users" element={<div>Admin Users</div>} />


          <Route path="/admin/resources" element={<Resources />} />
        <Route path="/admin/resources/add" element={<AddResource />} />
        <Route path="/admin/resources/edit/:id" element={<EditResource />} />
        <Route path="/admin/resources/:id" element={<ResourceDetails />} />

          {/* ── User Dashboard ─────────────────────────── */}
          <Route path="/dashboard" element={<div>User Dashboard</div>} />

          {/* ── Technician Dashboard ───────────────────── */}
          <Route path="/technician/dashboard" element={<TechnicianResources />} />

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

