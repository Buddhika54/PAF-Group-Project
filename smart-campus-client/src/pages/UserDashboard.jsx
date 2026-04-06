import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, ticketAPI } from '../services/api';
import Navbar from "../components/layout/Navbar";

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
  const m = { APPROVED: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700',
               REJECTED: 'bg-red-100 text-red-700', CANCELLED: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[s] || 'bg-gray-100'}`}>{s}</span>;
};

const priorityBadge = (p) => {
  const m = { CRITICAL: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700',
               MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[p] || 'bg-gray-100'}`}>{p}</span>;
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookingStats, setBookingStats] = useState({});
  const [ticketStats, setTicketStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bStats, tStats, bList, tList] = await Promise.all([
          bookingAPI.getMyStats(),
          ticketAPI.getMyStats(),
          bookingAPI.getMyBookings(),
          ticketAPI.getMyTickets(),
        ]);
        setBookingStats(bStats.data || {});
        setTicketStats(tStats.data || {});
        
        const bookingsData = Array.isArray(bList.data) ? bList.data : [];
        const ticketsData = Array.isArray(tList.data) ? tList.data : [];
        
        setRecentBookings(bookingsData.slice(0, 3));
        setRecentTickets(ticketsData.slice(0, 3));
      } catch {
        // Set empty arrays on error
        setRecentBookings([]);
        setRecentTickets([]);
        setBookingStats({});
        setTicketStats({});
      }
    };
    fetchAll();
  }, []);

  return (
    <Navbar>
      <div className="space-y-8 animate-[fadeIn_0.4s_ease]">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your bookings and tickets.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="My Bookings" value={bookingStats.total} color="bg-blue-50 text-blue-700" icon="📅" />
          <StatCard label="Pending" value={bookingStats.pending} color="bg-yellow-50 text-yellow-700" icon="⏳" />
          <StatCard label="Open Tickets" value={ticketStats.open} color="bg-red-50 text-red-700" icon="🎫" />
          <StatCard label="Resolved Tickets" value={ticketStats.resolved} color="bg-green-50 text-green-700" icon="✅" />
        </div>

        {/* Quick actions */}
        <div className="flex gap-4">
          <Link to="/resources" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors">
            🏛️ Book a Resource
          </Link>
          <Link to="/tickets/new" className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors">
            🎫 Report an Issue
          </Link>
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Bookings</h2>
            <Link to="/my-bookings" className="text-sm text-blue-600 hover:underline">View all</Link>
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

        {/* Recent tickets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Tickets</h2>
            <Link to="/tickets" className="text-sm text-blue-600 hover:underline">View all</Link>
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
                  <td className="px-6 py-3">{statusBadge(t.status)}</td>
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
