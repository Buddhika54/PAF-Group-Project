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

const priorityBadge = (p) => {
  const m = {
    CRITICAL: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-teal-100 text-teal-700',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[p] || 'bg-gray-100'}`}>{p}</span>;
};

const statusTicketBadge = (s) => {
  const m = {
    OPEN: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-600',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${m[s] || 'bg-gray-100'}`}>{s?.replace(/_/g, ' ')}</span>;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');

  const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAll = async () => {
      // Tickets — fetch separately so other failures don't affect this
      try {
        const ticketsRes = await ticketAPI.getAll();
        const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
        setAllTickets(tickets);
setOpenTickets(tickets.filter(t => t.status === 'OPEN'));
      } catch (err) {
        console.error('Tickets error:', err);
      }

      // Bookings
      try {
        const allBookings = await bookingAPI.getAll();
        setPendingBookings(
          Array.isArray(allBookings.data)
            ? allBookings.data.filter(b => b.status === 'PENDING').slice(0, 5)
            : []
        );
      } catch (err) {
        console.error('Bookings error:', err);
      }

      // Registrations
      try {
        const [regCount, regRequests] = await Promise.all([
          fetch('http://localhost:8080/api/admin/registrations/pending-count', {
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(r => r.ok ? r.json() : { count: 0 }),
          fetch('http://localhost:8080/api/admin/registrations?status=PENDING', {
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(r => r.ok ? r.json() : []),
        ]);
        setPendingCount(regCount.count || 0);
        setPendingRegistrations(Array.isArray(regRequests) ? regRequests.slice(0, 5) : []);
      } catch (err) {
        console.error('Registrations error:', err);
      }
    };
    fetchAll();
  }, []);

  const approve = async (id) => {
    try {
      await bookingAPI.approve(id);
      setPendingBookings(prev => prev.filter(b => b.id !== id));
      toast.success('Booking approved!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
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

  const updateTicketStatus = async () => {
    try {
      await ticketAPI.updateStatus(statusModal.id, {
        status: newStatus,
        resolutionNotes: resolution || null,
      });
      toast.success('Status updated!');
      setStatusModal(null);
      setResolution('');
      const res = await ticketAPI.getAll();
      const tickets = Array.isArray(res.data) ? res.data : [];
      setAllTickets(tickets);
      setOpenTickets(tickets.filter(t => t.status === 'OPEN').slice(0, 5));
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <Navbar>
      <div className="space-y-8 animate-[fadeIn_0.4s_ease]">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage campus operations from one place.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Open Tickets"
            value={openTickets.length}
            color="bg-red-50 text-red-700"
            icon="🎫"
            onClick={() => navigate('/admin/tickets')}
          />
          <StatCard
            label="Total Tickets"
            value={allTickets.length}
            color="bg-blue-50 text-blue-700"
            icon="📋"
          />
          <StatCard
            label="Pending Bookings"
            value={pendingBookings.length}
            color="bg-yellow-50 text-yellow-700"
            icon="⏳"
            onClick={() => navigate('/admin/bookings')}
          />
          <StatCard
            label="Pending Registrations"
            value={pendingCount}
            color="bg-purple-50 text-purple-700"
            icon="👤"
            onClick={() => navigate('/admin/registrations')}
          />
        </div>

        {/* Pending Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Pending Bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-teal-600 hover:underline">View all</Link>
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
                          : <div className="w-6 h-6 rounded-full bg-teal-200 flex items-center justify-center text-xs font-bold text-teal-700">{b.user?.name?.charAt(0)}</div>
                        }
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
                        <button onClick={() => approve(b.id)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors">
                          Approve
                        </button>
                        <button onClick={() => { setRejectModal(b.id); setRejectReason(''); }}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingBookings.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No pending bookings</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registration Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Registration Requests</h2>
            <Link to="/admin/registrations" className="text-sm text-teal-600 hover:underline">View all</Link>
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
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <button onClick={() => navigate('/admin/registrations')}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingRegistrations.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No pending registration requests</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              Recent Open Tickets
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                {openTickets.length}
              </span>
            </h2>
            <Link to="/admin/tickets" className="text-sm text-teal-600 hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50">
                <tr className="text-left text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Reported By</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {openTickets.map(t => (
                  <tr key={t.id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900 max-w-[150px] truncate">{t.title}</td>
                    <td className="px-6 py-3 text-gray-600">{t.createdBy?.name || '—'}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100">{t.category || 'OTHER'}</span>
                    </td>
                    <td className="px-6 py-3">{priorityBadge(t.priority)}</td>
                    <td className="px-6 py-3">{statusTicketBadge(t.status)}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setStatusModal(t); setNewStatus(t.status || 'OPEN'); setResolution(t.resolutionNotes || ''); }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors">
                          Update
                        </button>
                        <button
                          onClick={() => navigate(`/tickets/${t.id}`)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {openTickets.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No open tickets 🎉</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Booking Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..." rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={reject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition-colors">
                Confirm Reject
              </button>
              <button onClick={() => setRejectModal(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Status – <span className="text-blue-600">{statusModal.title}</span>
            </h3>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 mb-1 block">New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            {(newStatus === 'RESOLVED' || newStatus === 'CLOSED') && (
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Resolution Notes</label>
                <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3}
                  placeholder="Add resolution notes..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={updateTicketStatus}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors">
                Update
              </button>
              <button onClick={() => setStatusModal(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Navbar>
  );
}