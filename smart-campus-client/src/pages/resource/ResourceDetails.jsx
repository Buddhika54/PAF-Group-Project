import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resourceAPI } from '../../services/resourceAPI';
import { toast } from 'react-hot-toast';

const typeLabel = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment'
};

const typeStyles = {
  LECTURE_HALL: 'bg-teal-500/10 text-teal-400',
  LAB: 'bg-teal-500/10 text-teal-400',
  MEETING_ROOM: 'bg-teal-500/10 text-teal-400',
  EQUIPMENT: 'bg-teal-500/10 text-teal-400'
};

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: { dot: 'bg-teal-400 shadow-[0_0_6px_#2dd4bf88]', text: 'text-teal-400', label: 'Active' },
    UNDER_MAINTENANCE: { dot: 'bg-amber-400 shadow-[0_0_6px_#fbbf2488]', text: 'text-amber-400', label: 'Under Maintenance' },
    OUT_OF_SERVICE: { dot: 'bg-slate-500', text: 'text-slate-500', label: 'Out of Service' },
  };
  const s = map[status] || map.OUT_OF_SERVICE;
  
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      <span className={`font-medium ${s.text}`}>{s.label}</span>
    </span>
  );
};

export default function ResourceDetails() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const res = await resourceAPI.getById(id);
        setR(res.data);
      } catch (err) {
        toast.error('Failed to load resource details');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-400">Loading resource details...</div>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-400">
        Resource not found
      </div>
    );
  }

  const isEquipment = r.type === 'EQUIPMENT';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">{r.name}</h1>
            <p className="text-gray-500 mt-1">Resource Details</p>
          </div>
          <Link
            to="/admin/resources"
            className="text-gray-500 hover:text-teal-600 transition-colors flex items-center gap-2"
          >
            ← Back to Resources
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          {/* Image Section - Only for Equipment */}
          {isEquipment && r.imageUrl && (
            <div className="relative h-80 bg-gray-100">
              <img 
                src={r.imageUrl} 
                alt={r.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}

          <div className="p-8">
            {/* Type Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${typeStyles[r.type]}`}>
                {typeLabel[r.type]}
              </span>
            </div>

            {/* Status */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">CURRENT STATUS</p>
              <StatusBadge status={r.status} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Common Fields */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Resource Name</p>
                <p className="text-gray-800 text-lg font-medium">{r.name}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Resource Type</p>
                <p className="text-gray-800 text-lg font-medium">{typeLabel[r.type]}</p>
              </div>

              {/* Conditional Fields */}
              {!isEquipment ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Capacity (Persons)</p>
                    <p className="text-gray-800 text-lg font-medium">{r.capacity || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Building</p>
                    <p className="text-gray-800 text-lg font-medium">{r.building || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Location / Floor</p>
                    <p className="text-gray-800 text-lg font-medium">{r.location || '—'}</p>
                  </div>
                </>
              ) : (
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Special Notes / Specifications</p>
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {r.specialNotes || 'No specifications provided'}
                  </p>
                </div>
              )}

              {/* Availability */}
              <div className={isEquipment ? "md:col-span-2" : ""}>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Availability (Daily Time Range)</p>
                <p className="text-gray-800 text-lg font-medium font-mono">
                  {r.availabilityWindows || 'Not specified'}
                </p>
              </div>

              {/* Maintenance Note */}
              {r.maintenanceNote && (
                <div className={isEquipment ? "md:col-span-2" : ""}>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Maintenance Note</p>
                  <p className="text-gray-600 leading-relaxed">
                    {r.maintenanceNote}
                  </p>
                </div>
              )}

              {/* Bookable - Only for non-equipment */}
              {!isEquipment && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Bookable</p>
                  <p className={`text-lg font-medium ${r.isBookable ? 'text-teal-600' : 'text-red-500'}`}>
                    {r.isBookable ? 'Yes' : 'No'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Link
            to={`/admin/resources/edit/${r.id}`}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-2xl text-center font-medium transition-colors shadow-sm hover:shadow-md"
          >
            Edit Resource
          </Link>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this resource?')) {
                // Add delete logic here if needed
                toast.success('Delete feature coming soon');
              }
            }}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3.5 rounded-2xl text-center font-medium transition-colors border border-red-200"
          >
            Delete Resource
          </button>
        </div>
      </div>
    </div>
  );
}