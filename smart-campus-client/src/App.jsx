import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, PrivateRoute, AdminRoute } from './context/AuthContext';

// User pages
import NewTicket from './pages/NewTicket';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';

// Admin pages
import AdminTickets from './pages/AdminTickets';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
            success: { iconTheme: { primary: '#22c55e', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />

        <Routes>
          {/* User protected routes */}
          <Route path="/tickets/new" element={<PrivateRoute><NewTicket /></PrivateRoute>} />
          <Route path="/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
          <Route path="/tickets/:id" element={<PrivateRoute><TicketDetail /></PrivateRoute>} />

          {/* Admin only routes */}
          <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}