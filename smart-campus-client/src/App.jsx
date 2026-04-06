import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Resources from './pages/resource/Resources';
import ResourceDetails from './pages/resource/ResourceDetails';
import EditResource from './pages/resource/EditResource';
import AddResource from './pages/resource/AddResource'; 
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Member 4 */}
          <Route path="/" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
      


        {/* Member 1 */}
        <Route path="/admin/resources" element={<Resources />} />
        <Route path="/admin/resources/add" element={<AddResource />} />
        <Route path="/admin/resources/edit/:id" element={<EditResource />} />
        <Route path="/admin/resources/:id" element={<ResourceDetails />} />
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