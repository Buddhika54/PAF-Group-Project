import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceAPI } from '../../services/resourceAPI';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

const typeLabel = { LECTURE_HALL: 'Lecture Hall', LAB: 'Lab', MEETING_ROOM: 'Meeting Room' };

const typeStyles = {
  LECTURE_HALL: 'bg-blue-100 text-blue-600',
  LAB: 'bg-teal-100 text-teal-600',
  MEETING_ROOM: 'bg-purple-100 text-purple-600',
};

const avatarStyles = {
  LECTURE_HALL: 'bg-blue-100 text-blue-600',
  LAB: 'bg-teal-100 text-teal-600',
  MEETING_ROOM: 'bg-purple-100 text-purple-600',
};

const initials = (name) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('');

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'Active' },
    UNDER_MAINTENANCE: { dot: 'bg-yellow-500', text: 'text-yellow-600', label: 'Maintenance' },
    OUT_OF_SERVICE: { dot: 'bg-gray-400', text: 'text-gray-500', label: 'Out of Service' },
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
    blue: 'before:bg-teal-500',
    green: 'before:bg-emerald-500',
    amber: 'before:bg-yellow-500',
    red: 'before:bg-red-400',
  };
  const iconBg = {
    blue: 'bg-teal-100',
    green: 'bg-emerald-100',
    amber: 'bg-yellow-100',
    red: 'bg-red-100',
  };
  return (
    <div className={`
      bg-white border border-gray-100 rounded-2xl p-4
      relative
      before:absolute before:top-0 before:left-0 before:right-0
      before:h-0.5 before:rounded-t-2xl
      ${accents[accent]}
    `}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3 ${iconBg[accent]}`}>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-gray-800 font-mono mb-0.5">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</p>
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

  useEffect(() => {
    const f = data.filter((r) =>
      (!filters.type     || r.type === filters.type) &&
      (!filters.capacity || r.capacity >= parseInt(filters.capacity)) &&
      (!filters.location || r.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.status   || r.status === filters.status)
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
    'bg-white border border-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg outline-none focus:border-teal-500 transition-colors placeholder:text-gray-400';

  return (
    <Navbar>
      <div className="min-h-screen bg-gray-50 p-6">

        {/* Header */}
        <div className="flex justify-between items-start mb-7">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">
              Resources
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Campus Resource Management
            </p>
          </div>
          <Link
            to="/admin/resources/add"
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl"
          >
            <span className="text-lg leading-none">+</span> Add Resource
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3.5 mb-6">
          <StatCard icon="🏛" value={stats.total} label="Total Resources" accent="blue" />
          <StatCard icon="✅" value={stats.active} label="Active" accent="green" />
          <StatCard icon="🔧" value={stats.maintenance} label="Maintenance" accent="amber" />
          <StatCard icon="⛔" value={stats.oos} label="Out of Service" accent="red" />
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex gap-2.5 flex-wrap items-center mb-5">
          <select className={inputClass} value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
          </select>

          <input className={inputClass} style={{ width: 110 }} placeholder="Min capacity"
            value={filters.capacity}
            onChange={(e) => setFilters({ ...filters, capacity: e.target.value })} />

          <input className={inputClass} style={{ width: 130 }} placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })} />

          <select className={inputClass} value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">Maintenance</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>

          <button onClick={resetFilter}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg ml-auto">
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-50 border-b border-gray-200">
                {['Resource', 'Type', 'Capacity', 'Status', 'Location', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 text-sm">
                    No resources found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold ${avatarStyles[r.type]}`}>
                          {initials(r.name)}
                        </div>
                        <span className="text-gray-800 text-sm font-medium">{r.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${typeStyles[r.type]}`}>
                        {typeLabel[r.type]}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-gray-600 text-xs">{r.capacity}</td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="px-4 py-3.5 text-gray-500 text-xs">{r.location}</td>

                    <td className="px-4 py-3.5 flex gap-2">
                      <Link to={`/admin/resources/${r.id}`} className="text-teal-600 text-xs">View</Link>
                      <Link to={`/admin/resources/edit/${r.id}`} className="text-yellow-600 text-xs">Edit</Link>
                      <button onClick={() => del(r.id)} className="text-red-500 text-xs">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Navbar>
  );
}