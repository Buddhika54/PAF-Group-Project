import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { bookingAPI, ticketAPI } from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

const StatCard = ({ label, value, color, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`${color} rounded-2xl p-5 flex items-center gap-4 shadow-sm ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
  >
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
    </div>
  </div>
);

const statusBadge = (s) => {
  const m = {
    APPROVED: 'bg-teal-100 text-teal-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[s] || 'bg-gray-100'}`}>
      {s}
    </span>
  );
};

const priorityBadge = (p) => {
  const m = {
    CRITICAL: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-teal-100 text-teal-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[p] || 'bg-gray-100'}`}>
      {p}
    </span>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [pendingBookings, setPendingBookings] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resStats, allBookings, allTickets, regCount, regRequests] = await Promise.all([
          resourceAPI.getStats(),
          bookingAPI.getAll(),
          ticketAPI.getAll(),
          fetch('http://localhost:8080/api/admin/registrations/pending-count', {
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(r => r.ok ? r.json() : { count: 0 }),
          fetch('http://localhost:8080/api/admin/registrations?status=PENDING', {
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(r => r.ok ? r.json() : []),
        ]);

        setStats(resStats.data);
        setPendingBookings(allBookings.data.filter(b => b.status === 'PENDING').slice(0, 5));
        setOpenTickets(allTickets.data.filter(t => t.status === 'OPEN').slice(0, 5));
        setPendingCount(regCount.count || 0);
        setPendingRegistrations(Array.isArray(regRequests) ? regRequests.slice(0, 5) : []);
      } catch {}
    };
    fetchAll();
  }, []);

  const approve = async (id) => {
    try {
      await bookingAPI.approve(id);
      setPendingBookings(prev => prev.filter(b => b.id !== id));
      toast.success('Booking approved!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to approve';
      toast.error(msg);
    }
  };

  const reject = async () => {
    if (!rejectReason.trim()) return toast.error('Please provide a reason');
    try {
      await bookingAPI.reject(rejectModal, rejectReason);
      setPendingBookings(prev => prev.filter(b => b.id !== rejectModal));
      setRejectModal(null);
      setRejectReason('');
      toast.success('Booking rejected');
    } catch {
      toast.error('Failed to reject');
    }
  };

  return (
    <Navbar>
      <div className="space-y-8 animate-[fadeIn_0.4s_ease]">

        {/* ── Page Header ─────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage campus operations from one place.</p>
        </div>

        {/* ── Stats Cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          <StatCard
            label="Total Resources"
            value={stats.total}
            color="bg-teal-50 text-teal-700"
            icon="🏛️"
          />
          <StatCard
            label="Active"
            value={stats.active}
            color="bg-teal-100 text-teal-800"
            icon="✅"
          />
          <StatCard
            label="Pending Bookings"
            value={stats.pendingBookings}
            color="bg-yellow-50 text-yellow-700"
            icon="⏳"
            onClick={() => navigate('/admin/bookings')}
          />
          <StatCard
            label="Open Tickets"
            value={openTickets.length}
            color="bg-red-50 text-red-700"
            icon="🎫"
            onClick={() => navigate('/admin/tickets')}
          />
          <StatCard
            label="Pending Registrations"
            value={pendingCount}
            color="bg-yellow-50 text-yellow-700"
            icon="👤"
            onClick={() => navigate('/admin/registrations')}
          />
          <StatCard
            label="Out of Service"
            value={stats.outOfService}
            color="bg-gray-50 text-gray-700"
            icon="🔧"
          />
          <StatCard
            label="Maintenance"
            value={stats.underMaintenance}
            color="bg-orange-50 text-orange-700"
            icon="⚠️"
          />
        </div>

        {/* ── Pending Bookings Table ───────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Pending Bookings</h2>
            <Link
              to="/admin/bookings"
              className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50">
                <tr className="text-left text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Resource</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Purpose</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingBookings.map(b => (
                  <tr key={b.id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {b.user?.profilePicture
                          ? <img src={b.user.profilePicture} className="w-6 h-6 rounded-full" alt="" />
                          : (
                            <div className="w-6 h-6 rounded-full bg-teal-200 flex items-center justify-center text-xs font-bold text-teal-700">
                              {b.user?.name?.charAt(0)}
                            </div>
                          )}
                        <span className="font-medium text-gray-900">{b.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{b.resource?.name}</td>
                    <td className="px-6 py-3 text-gray-600 text-xs">
                      <div>{b.bookingDate}</div>
                      <div className="text-gray-400">{b.startTime} – {b.endTime}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 max-w-[160px] truncate">{b.purpose}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => approve(b.id)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => { setRejectModal(b.id); setRejectReason(''); }}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No pending bookings
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Registration Requests Table ──────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Registration Requests</h2>
            <Link
              to="/admin/registrations"
              className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50">
                <tr className="text-left text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingRegistrations.map(req => (
                  <tr key={req.id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{req.fullName}</td>
                    <td className="px-6 py-3 text-gray-600">{req.email}</td>
                    <td className="px-6 py-3 text-gray-600">{req.department}</td>
                    <td className="px-6 py-3 text-gray-600 text-xs">
                      <div>{new Date(req.createdAt).toLocaleDateString()}</div>
                      <div className="text-gray-400">
                        {Math.floor((new Date() - new Date(req.createdAt)) / (1000 * 60 * 60))}h ago
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => navigate('/admin/registrations')}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No pending registration requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Open Tickets Table ───────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Open Tickets</h2>
            <Link
              to="/admin/tickets"
              className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50">
                <tr className="text-left text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Reported By</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Resource</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {openTickets.map(t => (
                  <tr key={t.id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{t.title}</td>
                    <td className="px-6 py-3 text-gray-600">{t.createdBy?.name}</td>
                    <td className="px-6 py-3">{priorityBadge(t.priority)}</td>
                    <td className="px-6 py-3 text-gray-600">{t.resource?.name || '—'}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => navigate('/admin/tickets')}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {openTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No open tickets
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Reject Modal ─────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rejection Reason
            </h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={reject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition-colors"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Navbar>
  );
}