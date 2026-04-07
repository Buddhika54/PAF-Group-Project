import { useState, useEffect } from 'react';
import { bookingAPI } from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

const TABS = ['ALL','PENDING','APPROVED','REJECTED','CANCELLED'];

const statusClr = { APPROVED: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700',
                     REJECTED: 'bg-red-100 text-red-700', CANCELLED: 'bg-gray-100 text-gray-600' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data);
    } catch { toast.error('Failed to load bookings'); }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch { toast.error('Failed to cancel'); }
  };

  const filtered = tab === 'ALL' ? bookings : bookings.filter(b => b.status === tab);

  return (
    <Navbar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1">Track all your room and equipment reservations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Resource</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Purpose</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div></td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {b.resource?.imageUrl
                        ? <img src={b.resource.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        : <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">🏛️</div>}
                      <span className="font-medium text-gray-900">{b.resource?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{b.bookingDate}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{b.startTime} – {b.endTime}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-45 truncate" title={b.purpose}>{b.purpose}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClr[b.status] || 'bg-gray-100'}`}>{b.status}</span>
                    {b.rejectionReason && <p className="text-xs text-red-500 mt-1">{b.rejectionReason}</p>}
                  </td>
                  <td className="px-6 py-4">
                    {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                      <button onClick={() => cancel(b.id)}
                        className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400">No {tab !== 'ALL' ? tab.toLowerCase() : ''} bookings yet. <a href="/resources" className="text-blue-600 hover:underline">Book a resource!</a></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Navbar>
  );
}
