import { useState, useEffect } from 'react';
import { bookingAPI } from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

const statusClr = { APPROVED:'bg-green-100 text-green-700', PENDING:'bg-yellow-100 text-yellow-700',
                     REJECTED:'bg-red-100 text-red-700', CANCELLED:'bg-gray-100 text-gray-600' };
const TABS = ['ALL','PENDING','APPROVED','REJECTED','CANCELLED'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try { const r = await bookingAPI.getAll(); setBookings(r.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const approve = async (id) => {
    try {
      await bookingAPI.approve(id);
      toast.success('Booking approved!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
  };

  const reject = async () => {
    if (!reason.trim()) return toast.error('Provide a reason');
    try {
      await bookingAPI.reject(rejectModal, reason);
      toast.success('Booking rejected');
      setRejectModal(null);
      setReason('');
      fetchAll();
    } catch { toast.error('Failed to reject'); }
  };

  const filtered = tab === 'ALL' ? bookings : bookings.filter(b => b.status === tab);

  return (
    <Navbar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-gray-500 mt-1">Review and process all booking requests</p>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Resource</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Purpose</th>
                  <th className="px-5 py-3">Attendees</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div></td></tr>
                ) : filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {b.user?.profilePicture
                          ? <img src={b.user.profilePicture} className="w-7 h-7 rounded-full" alt="" />
                          : <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">{b.user?.name?.charAt(0)}</div>}
                        <span className="font-medium">{b.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700"><div className="font-medium">{b.resource?.name}</div><div className="text-xs text-gray-400">{b.resource?.type?.replace(/_/g,' ')}</div></td>
                    <td className="px-5 py-3 text-gray-600 text-xs whitespace-nowrap"><div>{b.bookingDate}</div><div className="text-gray-400">{b.startTime} – {b.endTime}</div></td>
                    <td className="px-5 py-3 text-gray-600 max-w-[150px] truncate">{b.purpose}</td>
                    <td className="px-5 py-3 text-gray-600 text-center">{b.expectedAttendees || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClr[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      {b.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => approve(b.id)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">Approve</button>
                          <button onClick={() => { setRejectModal(b.id); setReason(''); }} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h3>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Enter reason..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={reject} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition-colors">Confirm Reject</button>
              <button onClick={() => setRejectModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Navbar>
  );
}
