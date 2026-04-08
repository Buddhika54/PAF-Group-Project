import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from "../../components/layout/Navbar";
import { ticketAPI } from '../../api/axiosInstance';

const priorityClr = { 
  CRITICAL:'bg-red-100 text-red-700', 
  HIGH:'bg-orange-100 text-orange-700',
  MEDIUM:'bg-yellow-100 text-yellow-700', 
  LOW:'bg-green-100 text-green-700' 
};

const statusClr = { 
  OPEN:'bg-blue-100 text-blue-700', 
  IN_PROGRESS:'bg-purple-100 text-purple-700',
  RESOLVED:'bg-green-100 text-green-700', 
  CLOSED:'bg-gray-100 text-gray-600', 
  REJECTED:'bg-red-100 text-red-700' 
};

const STATUSES = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'];

export default function AdminTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketAPI.getAll();
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadTickets(); 
  }, []);

  const updateStatus = async () => {
    try {
      await ticketAPI.updateStatus(statusModal.id, {
        status: newStatus,
        resolutionNotes: resolution || null,
      });
      toast.success('Status updated successfully!');
      setStatusModal(null);
      setResolution('');
      loadTickets();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        // No delete API yet — just reload
        toast.error('Delete not supported via API yet');
      } catch (error) {
        toast.error('Failed to delete ticket');
      }
    }
  };

  const filtered = tickets
    .filter(t => !statusFilter || t.status === statusFilter)
    .filter(t => !priorityFilter || t.priority === priorityFilter);

  return (
    <Navbar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tickets</h1>
          <p className="text-gray-500 mt-1">Review and resolve all maintenance incidents</p>
          <p className="text-xs text-gray-400 mt-1">Total tickets: {tickets.length}</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Priorities</option>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={() => { setStatusFilter(''); setPriorityFilter(''); }}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Clear Filters
          </button>
          <button onClick={loadTickets}
            className="px-4 py-2 text-sm text-white bg-blue-600 border border-gray-200 rounded-xl hover:bg-blue-700 transition-colors">
            🔄 Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">#{t.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                      {t.title}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100">
                        {t.category || 'OTHER'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${priorityClr[t.priority] || 'bg-gray-100'}`}>
                        {t.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusClr[t.status] || 'bg-blue-100'}`}>
                        {t.status?.replace(/_/g,' ') || 'OPEN'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { 
                            setStatusModal(t); 
                            setNewStatus(t.status || 'OPEN'); 
                            setResolution(t.resolutionNotes || ''); 
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors">
                          Update
                        </button>
                        <button 
                          onClick={() => navigate(`/tickets/${t.id}`)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors">
                          View
                        </button>
                        <button 
                          onClick={() => deleteTicket(t.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {statusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Status – <span className="text-blue-600">{statusModal.title}</span>
            </h3>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 mb-1 block">New Status</label>
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            {(newStatus === 'RESOLVED' || newStatus === 'CLOSED') && (
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Resolution Notes</label>
                <textarea 
                  value={resolution} 
                  onChange={e => setResolution(e.target.value)} 
                  rows={3}
                  placeholder="Add resolution notes..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" 
                />
              </div>
            )}
            <div className="flex gap-3">
              <button 
                onClick={updateStatus} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors">
                Update
              </button>
              <button 
                onClick={() => setStatusModal(null)} 
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