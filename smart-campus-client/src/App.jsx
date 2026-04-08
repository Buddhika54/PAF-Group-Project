
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Resources from './pages/resource/Resources';
import ResourceDetails from './pages/resource/ResourceDetails';
import EditResource from './pages/resource/EditResource';
import AddResource from './pages/resource/AddResource'; 
import { Toaster } from 'react-hot-toast';
<<<<<<< HEAD
import { AuthProvider, PrivateRoute } from './context/AuthContext';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Register from './pages/Register';
import UserDashboard from './pages/user/UserDashboard';
import Tickets from './pages/user/Tickets';
import NewTicket from './pages/user/NewTicket';
import TicketDetail from './pages/user/TicketDetail';
import AdminTickets from './pages/admin/AdminTickets';
=======

import { AuthProvider, PrivateRoute } from './context/AuthContext';

import Login from './pages/Login';
import Homepage from './pages/Homepage';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/admin/AdminDashboard';
import Register from './pages/Register';
import UserDashboard from './pages/user/UserDashboard';
import MyBookings from './pages/user/MyBooking';
import NewBooking from './pages/user/NewBooking';
import { Navigate } from 'react-router-dom';
import TechnicianResources from './pages/Technician/TechnicianResource';
>>>>>>> baa448a036f09821e3b60f7128394aabd04c1726

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
<<<<<<< HEAD
=======


        {/* Member 1 */}
        
          {/* Member 2 */}
        {/* ── Toast Notifications ──────────────────────── */}
>>>>>>> baa448a036f09821e3b60f7128394aabd04c1726
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

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/tickets" element={
            <PrivateRoute>
              <Tickets />
            </PrivateRoute>
          } />
          
          <Route path="/tickets/new" element={
            <PrivateRoute>
              <NewTicket />
            </PrivateRoute>
          } />
          
          <Route path="/tickets/:id" element={
            <PrivateRoute>
              <TicketDetail />
            </PrivateRoute>
          } />

<<<<<<< HEAD
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin/tickets" element={
            <PrivateRoute>
              <AdminTickets />
            </PrivateRoute>
          } />
          
          <Route path="/admin/registrations" element={
            <PrivateRoute>
              <div>Admin Registrations</div>
            </PrivateRoute>
          } />
          
          <Route path="/admin/users" element={
            <PrivateRoute>
              <div>Admin Users</div>
            </PrivateRoute>
          } />

          {/* Technician Dashboard */}
          <Route path="/technician/dashboard" element={
            <PrivateRoute>
              <div>Technician Dashboard</div>
            </PrivateRoute>
          } />

          {/* Member 1 — Resources */}
          <Route path="/resources" element={
            <PrivateRoute>
              <div>Resource List</div>
            </PrivateRoute>
          } />
          
          <Route path="/resources/:id" element={
            <PrivateRoute>
              <div>Resource Detail</div>
            </PrivateRoute>
          } />

          {/* Member 2 — Bookings */}
          <Route path="/bookings" element={
            <PrivateRoute>
              <div>Bookings</div>
            </PrivateRoute>
          } />
          
          <Route path="/my-bookings" element={
            <PrivateRoute>
              <div>My Bookings</div>
            </PrivateRoute>
          } />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
=======
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/bookings/new" element={<NewBooking />} />

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

          {/* ── 404 Fallback ───────────────────────────── 
          <Route path="*" element={<Navigate to="/login" replace />} />*/}

>>>>>>> baa448a036f09821e3b60f7128394aabd04c1726
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

