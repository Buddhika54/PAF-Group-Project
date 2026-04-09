import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, PrivateRoute } from './context/AuthContext';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Homepage from './pages/Homepage';

// User
import UserDashboard from './pages/user/UserDashboard';
import Tickets from './pages/user/Tickets';
import NewTicket from './pages/user/NewTicket';
import TicketDetail from './pages/user/TicketDetail';
import MyBookings from './pages/user/MyBooking';
import NewBooking from './pages/user/NewBooking';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets from './pages/admin/AdminTickets';

// Resources
import Resources from './pages/resource/Resources';
import ResourceDetails from './pages/resource/ResourceDetails';
import EditResource from './pages/resource/EditResource';
import AddResource from './pages/resource/AddResource';

// Technician
import ResourceList from './pages/resource/ResourceList';
import { Navigate } from 'react-router-dom';
import TechnicianResources from './pages/Technician/TechnicianResource';
import AdminBookings from './pages/admin/AdminBookings';
import MaintenanceTasks from './pages/Technician/MaintenanceTask';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
              style: { background: '#0d9488', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#0d9488' },
            },
            error: {
              style: { background: '#ef4444', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#ef4444' },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* User Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute><UserDashboard /></PrivateRoute>
          } />
          <Route path="/tickets" element={
            <PrivateRoute><Tickets /></PrivateRoute>
          } />
          <Route path="/tickets/new" element={
            <PrivateRoute><NewTicket /></PrivateRoute>
          } />
          <Route path="/tickets/:id" element={
            <PrivateRoute><TicketDetail /></PrivateRoute>
          } />
          <Route path="/my-bookings" element={
            <PrivateRoute><MyBookings /></PrivateRoute>
          } />
          <Route path="/bookings/new" element={
            <PrivateRoute><NewBooking /></PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/tickets" element={
            <PrivateRoute><AdminTickets /></PrivateRoute>
          } />
          <Route path="/admin/registrations" element={
            <PrivateRoute><div>Admin Registrations</div></PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute><div>Admin Users</div></PrivateRoute>
          } />
          <Route path="/admin/bookings" element={
            <PrivateRoute><div>Admin Bookings</div></PrivateRoute>
          } />
          <Route path="/admin/resources" element={
            <PrivateRoute><Resources /></PrivateRoute>
          } />
          <Route path="/admin/resources/add" element={
            <PrivateRoute><AddResource /></PrivateRoute>
          } />
          <Route path="/admin/resources/edit/:id" element={
            <PrivateRoute><EditResource /></PrivateRoute>
          } />
          <Route path="/admin/resources/:id" element={
            <PrivateRoute><ResourceDetails /></PrivateRoute>
          } />

          {/* Technician Routes */}
          <Route path="/technician/dashboard" element={
            <PrivateRoute><TechnicianResources /></PrivateRoute>
          } />

          {/* Resource Routes */}
          <Route path="/resources" element={
            <PrivateRoute><div>Resource List</div></PrivateRoute>
          } />
          <Route path="/resources/:id" element={
            <PrivateRoute><div>Resource Detail</div></PrivateRoute>
          } />

          {/* Booking Routes */}
          <Route path="/bookings" element={
            <PrivateRoute><div>Bookings</div></PrivateRoute>
          } />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/bookings/new" element={<NewBooking />} />
          <Route path="/resourceslist" element={<ResourceList />} />

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
          <Route path="/admin/bookings" element={<AdminBookings />} />
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
          <Route path="/technician/resources" element={<TechnicianResources />} />
          <Route path="/technician/maintenance-tasks" element={<MaintenanceTasks />} />

          {/* ── Member 1 — Resources ───────────────────── */}
          <Route path="/resources" element={<div>Resource List</div>} />
          <Route path="/resources/:id" element={<div>Resource Detail</div>} />

          {/* ── Member 2 — Bookings ────────────────────── */}
          <Route path="/bookings" element={<div>Bookings</div>} />
          <Route path="/my-bookings" element={<div>My Bookings</div>} />

          {/* ── Member 3 — Tickets ─────────────────────── */}
          <Route path="/tickets" element={<div>Tickets</div>} />
          <Route path="/tickets/:id" element={<div>Ticket Detail</div>} />

          {/* ── 404 Fallback ───────────────────────────── 
          <Route path="*" element={<Navigate to="/login" replace />} />*/}

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;