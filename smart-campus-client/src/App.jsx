import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, PrivateRoute } from './context/AuthContext';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Register from './pages/Register';
import UserDashboard from './pages/user/UserDashboard';
import Tickets from './pages/user/Tickets';
import NewTicket from './pages/user/NewTicket';
import TicketDetail from './pages/user/TicketDetail';
import AdminTickets from './pages/admin/AdminTickets';

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
          <Route path="/" element={<Login />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;