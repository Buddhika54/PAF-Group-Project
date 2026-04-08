import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceAPI } from '../../services/resourceAPI';
import { toast } from 'react-hot-toast';

const typeLabel = { LECTURE_HALL: 'Lecture Hall', LAB: 'Lab', MEETING_ROOM: 'Meeting Room' };

const typeStyles = {
  LECTURE_HALL: 'bg-indigo-500/10 text-indigo-300',
  LAB: 'bg-teal-500/10 text-teal-300',
  MEETING_ROOM: 'bg-purple-500/10 text-purple-300',
};

const avatarStyles = {
  LECTURE_HALL: 'bg-indigo-500/20 text-indigo-300',
  LAB: 'bg-teal-500/20 text-teal-300',
  MEETING_ROOM: 'bg-purple-500/20 text-purple-300',
};

const initials = (name) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('');

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: { dot: 'bg-green-400 shadow-[0_0_6px_#4ade8088]', text: 'text-green-400', label: 'Active' },
    UNDER_MAINTENANCE: { dot: 'bg-amber-400 shadow-[0_0_6px_#fbbf2488]', text: 'text-amber-400', label: 'Maintenance' },
    OUT_OF_SERVICE: { dot: 'bg-slate-500', text: 'text-slate-500', label: 'Out of Service' },
  };
  const s = map[status] || map.OUT_OF_SERVICE;
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
    </span>
  );
};

const StatCard = ({ icon, value, label, accent }) => {
  const accents = {
    blue: 'before:bg-indigo-500',
    green: 'before:bg-green-500',
    amber: 'before:bg-amber-500',
    red: 'before:bg-red-500',
  };
  const iconBg = {
    blue: 'bg-indigo-500/15',
    green: 'bg-green-500/15',
    amber: 'bg-amber-500/15',
    red: 'bg-red-500/15',
  };
  return (
    <div className={`bg-[#161b27] border border-[#1e2535] rounded-2xl p-4 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:rounded-t-2xl ${accents[accent]}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3 ${iconBg[accent]}`}>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-[#f0f4ff] font-mono mb-0.5">{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
};

export default function Resources() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', capacity: '', location: '', status: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await resourceAPI.getAll();
      setData(res.data);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reactive filtering — runs whenever filters or data changes
  useEffect(() => {
    const f = data.filter((r) =>
      (!filters.type || r.type === filters.type) &&
      (!filters.capacity || r.capacity >= parseInt(filters.capacity)) &&
      (!filters.location || r.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.status || r.status === filters.status)
    );
    setFiltered(f);
  }, [filters, data]);

  const resetFilter = () => {
    setFilters({ type: '', capacity: '', location: '', status: '' });
  };

  const del = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await resourceAPI.delete(id);
      toast.success('Deleted');
      loadData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const stats = {
    total: filtered.length,
    active: filtered.filter((r) => r.status === 'ACTIVE').length,
    maintenance: filtered.filter((r) => r.status === 'UNDER_MAINTENANCE').length,
    oos: filtered.filter((r) => r.status === 'OUT_OF_SERVICE').length,
  };

  const inputClass =
    'bg-[#0d0f14] border border-[#1e2535] text-slate-300 text-sm px-3 py-2 rounded-lg outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600';

  return (
    <div className="min-h-screen bg-[#0d0f14] p-6">

      {/* Header */}
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-[#f0f4ff] mb-1">Resources</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Campus Resource Management</p>
        </div>
        <Link
          to="/admin/resources/add"
          className="flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <span className="text-lg leading-none">+</span> Add Resource
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard icon="🏛" value={stats.total}       label="Total Resources" accent="blue"  />
        <StatCard icon="✅" value={stats.active}      label="Active"          accent="green" />
        <StatCard icon="🔧" value={stats.maintenance} label="Maintenance"     accent="amber" />
        <StatCard icon="⛔" value={stats.oos}         label="Out of Service"  accent="red"   />
      </div>

      {/* Filter Bar */}
      <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl px-4 py-3.5 flex gap-2.5 flex-wrap items-center mb-5">
        <svg className="text-slate-600 shrink-0" width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M1 3h13M3 7h9M5 11h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>

        <select
          className={inputClass}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting Room</option>
        </select>

        <input
          className={inputClass}
          style={{ width: 110 }}
          placeholder="Min capacity"
          value={filters.capacity}
          onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
        />

        <input
          className={inputClass}
          style={{ width: 130 }}
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />

        <select
          className={inputClass}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="UNDER_MAINTENANCE">Maintenance</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>

        <button
          onClick={resetFilter}
          className="bg-[#1a2030] hover:bg-[#1e2535] text-slate-400 text-sm px-4 py-2 rounded-lg transition-colors ml-auto"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1a2030] border-b border-[#1e2535]">
              {['Resource', 'Type', 'Capacity', 'Status', 'Location', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-600 text-sm">
                  <div className="w-5 h-5 border-2 border-[#1e2535] border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                  Loading resources…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-600 text-sm">
                  No resources found
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#1a2030] last:border-0 hover:bg-[#1a2030] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0 ${avatarStyles[r.type]}`}>
                        {initials(r.name)}
                      </div>
                      <span className="text-[#f0f4ff] text-sm font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${typeStyles[r.type]}`}>
                      {typeLabel[r.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{r.capacity}</span>
                      <div className="w-16 h-1 bg-[#1e2535] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min((r.capacity / 200) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{r.location}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <Link
                        to={`/admin/resources/${r.id}`}
                        className="text-[11px] text-slate-400 hover:text-indigo-300 border border-[#1e2535] hover:border-indigo-500/50 px-2.5 py-1 rounded-md transition-all"
                      >
                        View
                      </Link>
                      <Link
                        to={`/admin/resources/edit/${r.id}`}
                        className="text-[11px] text-slate-400 hover:text-amber-300 border border-[#1e2535] hover:border-amber-500/50 px-2.5 py-1 rounded-md transition-all"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => del(r.id)}
                        className="text-[11px] text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/30 hover:bg-red-500/10 px-2.5 py-1 rounded-md transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}