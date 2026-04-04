import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';

// Each member fills in their own pages
// Leader creates placeholder pages for now

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Member 4 */}
          <Route path="/" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
      

          {/* Member 1 */}
          <Route path="/resources" element={<div>Resource List</div>} />
          <Route path="/resources/:id" element={<div>Resource Detail</div>} />

          {/* Member 2 */}
          <Route path="/bookings" element={<div>Bookings</div>} />

          {/* Member 3 */}
          <Route path="/tickets" element={<div>Tickets</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;