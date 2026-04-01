import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceAPI } from '../../services/resourceAPI';
import { toast } from 'react-hot-toast';


export default function Resources() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', capacity: '', location: '' });

 const statusBadge = (status) => {
  const m = {
    ACTIVE: 'text-green-600 font-semibold',
    OUT_OF_SERVICE: 'text-gray-500 font-semibold',
    UNDER_MAINTENANCE: 'text-orange-600 font-semibold'
  };

  return <span className={m[status]}>{status}</span>;
};

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await resourceAPI.getAll(filters);
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const del = async (id) => {
    if (!confirm('Delete resource?')) return;
    await resourceAPI.delete(id);
    toast.success('Deleted');
    fetch();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-gray-500 text-sm">Manage campus resources</p>
        </div>
        <Link to="/admin/resources/add" className="btn">+ Add Resource</Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border flex gap-3 flex-wrap">
        <select className="input" onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting Room</option>
        </select>
        <input placeholder="Min Capacity" className="input" onChange={e => setFilters({ ...filters, capacity: e.target.value })} />
        <input placeholder="Location" className="input" onChange={e => setFilters({ ...filters, location: e.target.value })} />
        <button onClick={fetch} className="btn">Filter</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Capacity</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">Loading...</td></tr>
            ) : data.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{r.name}</td>
                <td className="px-5 py-3">{r.type}</td>
                <td className="px-5 py-3">{r.capacity}</td>
                <td className="px-5 py-3">{statusBadge(r.status)}</td>
                <td className="px-5 py-3 flex gap-2">
                  <Link to={`/admin/resources/${r.id}`} className="text-blue-600">View</Link>
                  <Link to={`/admin/resources/edit/${r.id}`} className="text-yellow-600">Edit</Link>
                  <button onClick={() => del(r.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}