import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resourceAPI } from '../../services/resourceAPI';
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

  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  //  NEW: Ticket status handling
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const resStats = await resourceAPI.getStats();
        const allBookings = await bookingAPI.getAll();
        const allTickets = await ticketAPI.getAll();

        setStats(resStats.data);

        setPendingBookings(
          allBookings.data
            .filter(b => {
              const status = typeof b.status === 'string' ? b.status : b.status?.name;
              return status?.toUpperCase() === 'PENDING';
            })
            .slice(0, 5)
        );

        setOpenTickets(
          allTickets.data
            .filter(t => t.status?.toUpperCase() === 'OPEN')
            .slice(0, 5)
        );
      } catch (err) {
        console.error(err);
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

  //  NEW: Update ticket status
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

      setOpenTickets(
        tickets.filter(t => t.status?.toUpperCase() === 'OPEN').slice(0, 5)
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <Navbar>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage campus operations from one place.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Resources" value={stats.total} color="bg-teal-50 text-teal-700" icon="🏛️" />
          <StatCard label="Active" value={stats.active} color="bg-teal-100 text-teal-800" icon="✅" />
          <StatCard label="Pending Bookings" value={stats.pendingBookings} color="bg-yellow-50 text-yellow-700" icon="⏳" />
          <StatCard label="Open Tickets" value={openTickets.length} color="bg-red-50 text-red-700" icon="🎫" />
          <StatCard label="Out of Service" value={stats.outOfService} color="bg-gray-50 text-gray-700" icon="🔧" />
          <StatCard label="Maintenance" value={stats.underMaintenance} color="bg-orange-50 text-orange-700" icon="⚠️" />
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

        {/* Open Tickets */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="flex justify-between px-6 py-4 border-b">
            <h2 className="font-semibold">Recent Open Tickets</h2>
            <Link to="/admin/tickets">View all</Link>
          </div>

          <table className="w-full text-sm">
            <tbody>
              {openTickets.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-3">{t.title}</td>
                  <td>{t.createdBy?.name}</td>
                  <td>{priorityBadge(t.priority)}</td>
                  <td>{t.resource?.name}</td>
                  <td>
                    <button
                      onClick={() => {
                        setStatusModal(t);
                        setNewStatus(t.status || 'OPEN');
                        setResolution(t.resolutionNotes || '');
                      }}
                    >
                      Update
                    </button>

                    <button onClick={() => navigate('/admin/tickets')}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-5">
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <button onClick={reject}>Confirm</button>
            <button onClick={() => setRejectModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ✅ Ticket Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3>Update Status - {statusModal.title}</h3>

            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {STATUSES.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            {(newStatus === 'RESOLVED' || newStatus === 'CLOSED') && (
              <textarea
                placeholder="Resolution"
                value={resolution}
                onChange={e => setResolution(e.target.value)}
              />
            )}

            <button onClick={updateTicketStatus}>Update</button>
            <button onClick={() => setStatusModal(null)}>Cancel</button>
          </div>
        </div>
      )}

    </Navbar>
  );
}