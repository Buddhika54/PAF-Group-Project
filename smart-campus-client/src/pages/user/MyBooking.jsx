import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const statusClr = {
  APPROVED:  'bg-teal-100 text-teal-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  REJECTED:  'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getMyBookings(); // ← FIXED: added ()

      // ── Safely handle response ─────────────────
      const data = res?.data;
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (data?.content && Array.isArray(data.content)) {
        // Spring Page object
        setBookings(data.content);
      } else {
        setBookings([]);
      }

    } catch (err) {
      console.error('Fetch bookings error:', err);
      toast.error('Failed to load bookings');
      setBookings([]); // ← always set to array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.error
        || 'Failed to cancel booking';
      toast.error(msg);
    }
  };

  // ── Safe filter ────────────────────────────────
  const filtered = Array.isArray(bookings)
    ? (tab === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === tab))
    : [];

  // ── Count per tab ──────────────────────────────
  const countFor = (t) => t === 'ALL'
    ? bookings.length
    : bookings.filter(b => b.status === t).length;

  return (
    <Navbar>
      <div className="space-y-6">

        {/* ── Header ───────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Bookings
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Track all your room and equipment reservations
            </p>
          </div>
          <Link to="/bookings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
            + New Booking
          </Link>
        </div>

        {/* ── Tabs ─────────────────────────────── */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                tab === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t}
              {/* Count badge */}
              {countFor(t) > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {countFor(t)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Table ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50">
                <tr className="text-left text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  <th className="px-6 py-3">Resource</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Purpose</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">

                {/* Loading state */}
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm">
                          Loading your bookings...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Booking rows */}
                {!loading && filtered.map(b => (
                  <tr key={b.id}
                    className="hover:bg-teal-50/30 transition-colors">

                    {/* Resource */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {b.resource?.imageUrl ? (
                          <img
                            src={b.resource.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-xl">
                            🏛️
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {b.resource?.name || '—'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {b.resource?.type?.replace(/_/g, ' ') || ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-600">
                      {b.bookingDate || '—'}
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {b.startTime && b.endTime
                        ? `${b.startTime} – ${b.endTime}`
                        : '—'}
                    </td>

                    {/* Purpose */}
                    <td className="px-6 py-4 text-gray-600 max-w-[160px] truncate"
                      title={b.purpose}>
                      {b.purpose || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClr[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                      {b.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1 max-w-[140px] truncate"
                          title={b.rejectionReason}>
                          {b.rejectionReason}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {(b.status === 'PENDING' ||
                        b.status === 'APPROVED') && (
                        <button
                          onClick={() => cancel(b.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-5xl">📅</span>
                        <p className="text-gray-500 font-medium">
                          No {tab !== 'ALL'
                            ? tab.toLowerCase()
                            : ''} bookings yet
                        </p>
                        <Link to="/resources"
                          className="text-teal-600 text-sm hover:underline">
                          Book a resource →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Navbar>
  );
}