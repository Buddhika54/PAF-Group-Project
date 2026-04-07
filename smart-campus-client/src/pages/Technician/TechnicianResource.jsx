import { useEffect, useState } from 'react';
import { resourceAPI } from '../../services/resourceAPI';
import { toast } from 'react-hot-toast';

export default function TechnicianResources() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourceAPI.getAll({});
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await resourceAPI.updateStatus(id, status);
      toast.success('Status updated');
      fetchResources();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 font-semibold';
      case 'UNDER_MAINTENANCE':
        return 'text-orange-500 font-semibold';
      case 'OUT_OF_SERVICE':
        return 'text-gray-500 font-semibold';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Technician Resource Panel</h1>
      <p className="text-gray-500 text-sm">
        Manage resource maintenance & availability
      </p>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Maintenance Note</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  Loading...
                </td>
              </tr>
            ) : (
              data.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-5 py-3 font-medium">{r.name}</td>
                  <td className="px-5 py-3">{r.type}</td>
                  <td className={`px-5 py-3 ${statusColor(r.status)}`}>
                    {r.status}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {r.maintenanceNote || '-'}
                  </td>

                  <td className="px-5 py-3 flex gap-2">
                    <button
                      onClick={() =>
                        updateStatus(r.id, 'UNDER_MAINTENANCE')
                      }
                      className="text-orange-500"
                    >
                      Maintenance
                    </button>

                    <button
                      onClick={() => updateStatus(r.id, 'ACTIVE')}
                      className="text-green-600"
                    >
                      Set Active
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(r.id, 'OUT_OF_SERVICE')
                      }
                      className="text-gray-600"
                    >
                      Disable
                    </button>
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