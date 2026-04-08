import { useState, useEffect } from 'react';
import { ticketAPI } from '../../api/axiosInstance';
import { Link } from 'react-router-dom';

const priorityClr = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusClr = {
  OPEN: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-purple-500/20 text-purple-400',
  RESOLVED: 'bg-teal-500/20 text-teal-400',
  CLOSED: 'bg-gray-500/20 text-gray-400',
  REJECTED: 'bg-red-500/20 text-red-400',
};

export default function RecentTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    ticketAPI.getAll()
      .then(r => setTickets(Array.isArray(r.data) ? r.data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL'
    ? tickets
    : tickets.filter(t => t.status === filter);

  const counts = {
    ALL: tickets.length,
    OPEN: tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full" />
          <h2 className="text-white font-semibold text-lg">All Tickets</h2>
          <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/30">
            {tickets.length} total
          </span>
        </div>
        <Link
          to="/admin/tickets"
          className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-xl w-fit mb-5">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filter === key
                ? 'bg-gray-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {key.replace('_', ' ')}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              filter === key ? 'bg-teal-500/30 text-teal-300' : 'bg-gray-700 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          No {filter !== 'ALL' ? filter.replace('_', ' ').toLowerCase() : ''} tickets found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left pb-3 font-medium">Title</th>
                <th className="text-left pb-3 font-medium">Submitted By</th>
                <th className="text-left pb-3 font-medium">Category</th>
                <th className="text-left pb-3 font-medium">Priority</th>
                <th className="text-left pb-3 font-medium">Status</th>
                <th className="text-left pb-3 font-medium">Date</th>
                <th className="text-left pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.slice(0, 10).map(t => (
                <tr key={t.id} className="hover:bg-gray-800/40 transition-colors group">
                  <td className="py-3 pr-4">
                    <span className="text-white font-medium line-clamp-1 max-w-[180px] block">
                      {t.title}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-gray-400 text-xs">
                      {t.createdBy?.name || t.createdBy?.email || '—'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-gray-400 text-xs">{t.category || '—'}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityClr[t.priority] || ''}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClr[t.status] || ''}`}>
                      {t.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-gray-500 text-xs">
                      {t.createdAt?.split('T')[0]}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      to={`/tickets/${t.id}`}
                      className="text-xs text-teal-500 hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}