import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-green-900 text-white flex flex-col p-4">
      
      {/* Logo / Title */}
      <h1 className="text-xl font-bold mb-6">Smart Campus</h1>

      {/* Menu */}
      <nav className="flex flex-col gap-3">

        <Link to="/dashboard" className="hover:bg-green-700 p-2 rounded">
          🏠 Dashboard
        </Link>

        <Link to="/resources" className="hover:bg-green-700 p-2 rounded">
          🏢 Resources
        </Link>

        <Link to="/my-bookings" className="hover:bg-green-700 p-2 rounded">
          📅 My Bookings
        </Link>

        <Link to="/tickets" className="hover:bg-green-700 p-2 rounded">
          🎫 My Tickets
        </Link>

      </nav>

      {/* Bottom */}
      <div className="mt-auto pt-6 border-t border-green-700">
        <Link to="/login" className="hover:bg-red-600 p-2 rounded block">
          🚪 Logout
        </Link>
      </div>
    </div>
  );
}