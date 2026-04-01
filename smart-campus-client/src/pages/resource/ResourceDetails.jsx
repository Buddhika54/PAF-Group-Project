import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { resourceAPI } from '../../services/resourceAPI';


export default function ResourceDetails() {
  const { id } = useParams();
  const [r, setR] = useState(null);

  useEffect(() => {
    resourceAPI.getById(id).then(res => setR(res.data));
  }, [id]);

  const statusBadge = (status) => {
    const m = {
      ACTIVE: 'text-green-600 font-semibold',
      OUT_OF_SERVICE: 'text-gray-500 font-semibold',
      UNDER_MAINTENANCE: 'text-orange-600 font-semibold'
    };
    return <span className={m[status]}>{status}</span>;
  };

  if (!r) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">{r.name}</h1>

      {r.imageUrl && (
        <img src={r.imageUrl} className="rounded-xl shadow w-full" />
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p><b>Type:</b> {r.type}</p>
        <p><b>Status:</b> {statusBadge(r.status)}</p>
        <p><b>Capacity:</b> {r.capacity}</p>
        <p><b>Location:</b> {r.location}</p>
        <p><b>Building:</b> {r.building}</p>
        <p><b>Availability:</b> {r.availabilityWindows}</p>
      </div>
    </div>
  );
}