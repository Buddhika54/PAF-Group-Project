import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, ticketAPI } from '../../api/axiosInstance';
import Navbar from '../../components/layout/Navbar';
import SmartSuggestions from '../../components/SmartSuggestions';
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
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[s] || 'bg-gray-100'}`}>
      {s?.replace(/_/g, ' ')}
    </span>
  );
};

export default function UserDashboard() {
  const { user } = useAuth();

  const [bookingStats, setBookingStats] = useState({});
  const [ticketStats, setTicketStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {

      //  BOOKINGS (your original logic)
      try {
        const [bStats, bList] = await Promise.all([
          bookingAPI.getMyStats(),
          bookingAPI.getMyBookings(),
        ]);

        setBookingStats(bStats.data || {});
        const bookingsData = Array.isArray(bList.data) ? bList.data : [];
        setRecentBookings(bookingsData.slice(0, 3));

      } catch (error) {
        console.error('Booking error:', error);
        setBookingStats({});
        setRecentBookings([]);
      }

      //  TICKETS (added cleanly)
      try {
        const [tStats, tList] = await Promise.all([
          ticketAPI.getMyStats(),
          ticketAPI.getMyTickets(),
        ]);

        setTicketStats(tStats.data || {});
        const ticketsData = Array.isArray(tList.data) ? tList.data : [];
        setRecentTickets(ticketsData.slice(0, 3));

      } catch (error) {
        console.error('Ticket error:', error);
        setTicketStats({});
        setRecentTickets([]);
      }
    };

    fetchAll();
  }, []);

  return (
    <Navbar>
      <div className="space-y-8 animate-[fadeIn_0.4s_ease]">

        {/* AI Suggestions */}
        {showSuggestions && (
          <div className="relative">
            <button
              onClick={() => setShowSuggestions(false)}
              className="absolute -top-2 -right-2 z-10 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>
            <SmartSuggestions />
            <AILearningDashboard />
          </div>
        )}

        {!showSuggestions && (
          <button
            onClick={() => setShowSuggestions(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg"
          >
            🤖 Show AI Suggestions
          </button>
        )}

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="My Bookings" value={bookingStats.total} color="bg-blue-50 text-blue-700" icon="📅" />
          <StatCard label="Pending" value={bookingStats.pending} color="bg-yellow-50 text-yellow-700" icon="⏳" />
          <StatCard label="Open Tickets" value={ticketStats.open} color="bg-red-50 text-red-700" icon="🎫" />
          <StatCard label="Resolved Tickets" value={ticketStats.resolved} color="bg-green-50 text-green-700" icon="✅" />
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="flex justify-between px-6 py-4 border-b">
            <h2>Recent Bookings</h2>
            <Link to="/my-bookings">View all</Link>
          </div>

          <table className="w-full text-sm">
            <tbody>
              {recentBookings.map(b => (
                <tr key={b.id}>
                  <td className="px-6 py-3">{b.resource?.name}</td>
                  <td>{b.bookingDate}</td>
                  <td>{b.startTime} – {b.endTime}</td>
                  <td>{statusBadge(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/*  Recent Tickets (NOW ENABLED) */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="flex justify-between px-6 py-4 border-b">
            <h2>Recent Tickets</h2>
            <Link to="/tickets">View all</Link>
          </div>

          <table className="w-full text-sm">
            <tbody>
              {recentTickets.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-3">{t.title}</td>
                  <td>{priorityBadge(t.priority)}</td>
                  <td>{ticketStatusBadge(t.status)}</td>
                  <td>{t.createdAt?.split('T')[0]}</td>
                </tr>
              ))}

              {recentTickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400">
                    No tickets yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Navbar>
  );
}