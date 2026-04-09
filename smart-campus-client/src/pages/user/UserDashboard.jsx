import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { bookingAPI, ticketAPI } from "../../api/axiosInstance";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, ticketAPI } from '../../api/axiosInstance';
import Navbar from '../../components/layout/Navbar';
import SmartSuggestions from '../../components/SmartSuggestions'; // Import the AI component
import AILearningDashboard from '../../components/AILearningDashboard';

const StatCard = ({ label, value, color, icon }) => (
  <div className={`${color} rounded-2xl p-5 flex items-center gap-4 shadow-sm`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
    </div>
  </div>
);

const statusBadge = (s) => {
  const m = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-600'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[s] || 'bg-gray-100'}`}>{s}</span>;
};

const priorityBadge = (p) => {
  const m = {
    CRITICAL: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-green-100 text-green-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[p] || 'bg-gray-100'}`}>{p}</span>;
};

const ticketStatusBadge = (s) => {
  const m = {
    OPEN: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-600',
    REJECTED: 'bg-red-100 text-red-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[s] || 'bg-gray-100'}`}>{s?.replace(/_/g, ' ')}</span>;
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookingStats, setBookingStats] = useState({});
  const [ticketStats, setTicketStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true); // Toggle for suggestions

  useEffect(() => {
    const fetchAll = async () => {
      // Tickets
      try {
        const [tStats, tList] = await Promise.all([
          ticketAPI.getMyStats(),
          ticketAPI.getMyTickets(),
        ]);
        setTicketStats(tStats.data || {});
        const ticketsData = Array.isArray(tList.data) ? tList.data : [];
        setRecentTickets(ticketsData.slice(0, 3));
      } catch {
        setTicketStats({});
        console.log('USER DASHBOARD - Fetching data...');
        const [bStats, bList] = await Promise.all([
          bookingAPI.getMyStats(),
          bookingAPI.getMyBookings(),
        ]);
        
        console.log('USER DASHBOARD - Stats response:', bStats);
        console.log('USER DASHBOARD - Bookings response:', bList);
        
        setBookingStats(bStats.data || {});
        
        const bookingsData = Array.isArray(bList.data) ? bList.data : [];
        
        console.log('USER DASHBOARD - Processed bookings data:', bookingsData);
        
        setRecentBookings(bookingsData.slice(0, 3));
        setRecentTickets([]); // Set empty since ticket APIs don't exist yet
      } catch (error) {
        console.error('USER DASHBOARD - Error fetching data:', error);
        // Set empty arrays on error
        setRecentBookings([]);
        setRecentTickets([]);
      }

      // Bookings — separate try/catch
      try {
        const [bStats, bList] = await Promise.all([
          bookingAPI.getMyStats(),
          bookingAPI.getMyBookings(),
        ]);
        setBookingStats(bStats.data || {});
        const bookingsData = Array.isArray(bList.data) ? bList.data : [];
        setRecentBookings(bookingsData.slice(0, 3));
      } catch {
        setBookingStats({});
        setRecentBookings([]);
      }
    };
    fetchAll();
  }, []);

  return (
    <Navbar>
      <div className="space-y-8">
      <div className="space-y-8 animate-[fadeIn_0.4s_ease]">
        
        {/* ============================================ */}
        {/* AI SMART SUGGESTIONS SECTION */}
        {/* ============================================ */}
        {showSuggestions && (
          <div className="relative">
            {/* Close button for suggestions */}
            <button
              onClick={() => setShowSuggestions(false)}
              className="absolute -top-2 -right-2 z-10 bg-gray-800 hover:bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg transition-colors"
              title="Hide suggestions"
            >
              ✕
            </button>
            <SmartSuggestions />
            <AILearningDashboard />
          </div>
        )}

        {/* Show suggestions button if hidden */}
        {!showSuggestions && (
          <button
            onClick={() => setShowSuggestions(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
          >
            <span>🤖</span> Show AI Suggestions
          </button>
        )}

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your bookings and tickets.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="My Bookings" value={bookingStats.total} color="bg-blue-50 text-blue-700" icon="📅" />
          <StatCard label="Pending" value={bookingStats.pending} color="bg-yellow-50 text-yellow-700" icon="⏳" />
          <StatCard label="Open Tickets" value={ticketStats.open} color="bg-red-50 text-red-700" icon="🎫" />
          <StatCard label="Resolved" value={ticketStats.resolved} color="bg-green-50 text-green-700" icon="✅" />
        </div>

        {/* Quick actions */}
        <div className="flex gap-4 flex-wrap">
          <Link to="/resourceslist" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors">
            🏛️ Book a Resource
          </Link>
          <Link to="/tickets/new" className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors">
            🎫 Report an Issue
          </Link>
          <button 
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
          >
            🤖 Get AI Recommendations
          </button>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Bookings</h2>
            <Link to="/my-bookings" className="text-sm text-teal-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Resource</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-900">{b.resource?.name}</td>
                  <td className="px-6 py-3 text-gray-600">{b.bookingDate}</td>
                  <td className="px-6 py-3 text-gray-600">{b.startTime} – {b.endTime}</td>
                  <td className="px-6 py-3">{statusBadge(b.status)}</td>
                 </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Recent tickets - commented out until API ready */}
        {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Tickets</h2>
            <Link to="/tickets" className="text-sm text-teal-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTickets.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-6 py-3">{priorityBadge(t.priority)}</td>
                  <td className="px-6 py-3">{ticketStatusBadge(t.status)}</td>
                  <td className="px-6 py-3 text-gray-600">{t.createdAt?.split('T')[0]}</td>
                 </tr>
              ))}
              {recentTickets.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No tickets yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Navbar>
  );
}