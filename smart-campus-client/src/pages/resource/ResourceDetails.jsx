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
  LECTURE_HALL: 'bg-indigo-500/10 text-indigo-300',
  LAB: 'bg-teal-500/10 text-teal-300',
  MEETING_ROOM: 'bg-purple-500/10 text-purple-300',
  EQUIPMENT: 'bg-amber-500/10 text-amber-300'
};

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: { dot: 'bg-green-400 shadow-[0_0_6px_#4ade8088]', text: 'text-green-400', label: 'Active' },
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
        <div className="text-slate-500">Loading resource details...</div>
      </div>
    );
  }

  if (!r) {
    return <div className="min-h-screen bg-[#0d0f14] p-6 text-center text-slate-400">Resource not found</div>;
  }

  const isEquipment = r.type === 'EQUIPMENT';

  return (
    <div className="min-h-screen bg-[#0d0f14] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#f0f4ff]">{r.name}</h1>
            <p className="text-slate-500 mt-1">Resource Details</p>
          </div>
          <Link
            to="/admin/resources"
            className="px-5 py-2 text-slate-400 hover:text-white border border-[#1e2535] hover:border-slate-600 rounded-xl transition-colors"
          >
            ← Back to Resources
          </Link>
        </div>

        <div className="bg-[#161b27] border border-[#1e2535] rounded-3xl overflow-hidden">
          {/* Image Section - Only for Equipment */}
          {isEquipment && r.imageUrl && (
            <div className="relative h-96 bg-[#0a0c12]">
              <img
                src={r.imageUrl}
                alt={r.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("❌ Image failed to load from:", r.imageUrl);
                  e.target.style.display = 'none';
                }}
                onLoad={() => console.log("✅ Image loaded successfully from:", r.imageUrl)}
              />
            </div>
          )}

          {isEquipment && !r.imageUrl && (
            <div className="h-64 bg-[#0f121a] flex items-center justify-center text-slate-500 border-b border-[#1e2535]">
              No image uploaded
            </div>
          )}

          <div className="p-8">
            <div className="mb-6">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${typeStyles[r.type]}`}>
                {typeLabel[r.type]}
              </span>
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">CURRENT STATUS</p>
              <StatusBadge status={r.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Resource Name</p>
                <p className="text-[#f0f4ff] text-lg font-medium">{r.name}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Resource Type</p>
                <p className="text-[#f0f4ff] text-lg font-medium">{typeLabel[r.type]}</p>
              </div>

              {!isEquipment ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Capacity (Persons)</p>
                    <p className="text-[#f0f4ff] text-lg font-medium">{r.capacity || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Building</p>
                    <p className="text-[#f0f4ff] text-lg font-medium">{r.building || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Location / Floor</p>
                    <p className="text-[#f0f4ff] text-lg font-medium">{r.location || '—'}</p>
                  </div>
                </>
              ) : (
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Special Notes / Specifications</p>
                  <p className="text-[#f0f4ff] text-lg leading-relaxed whitespace-pre-wrap bg-[#0d0f14] p-4 rounded-2xl border border-[#1e2535]">
                    {r.specialNotes || 'No specifications provided'}
                  </p>
                </div>
              )}

              <div className={isEquipment ? "md:col-span-2" : ""}>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Availability (Daily Time Range)</p>
                <p className="text-[#f0f4ff] text-lg font-mono">
                  {r.availabilityWindows || 'Not specified'}
                </p>
              </div>

              {r.maintenanceNote && (
                <div className={isEquipment ? "md:col-span-2" : ""}>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Maintenance Note</p>
                  <p className="text-slate-300 bg-[#0d0f14] p-4 rounded-2xl border border-[#1e2535]">
                    {r.maintenanceNote}
                  </p>
                </div>
              )}

              {!isEquipment && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Bookable</p>
                  <p className={`text-lg font-medium ${r.isBookable ? 'text-green-400' : 'text-red-400'}`}>
                    {r.isBookable ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}