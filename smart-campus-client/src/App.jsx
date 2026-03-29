import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Each member fills in their own pages
// Leader creates placeholder pages for now

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Member 4 */}
        <Route path="/login" element={<div>Login Page</div>} />

        {/* Member 1 */}
        <Route path="/resources" element={<div>Resource List</div>} />
        <Route path="/resources/:id" element={<div>Resource Detail</div>} />

        {/* Member 2 */}
        <Route path="/bookings" element={<div>Bookings</div>} />

        {/* Member 3 */}
        <Route path="/tickets" element={<div>Tickets</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;