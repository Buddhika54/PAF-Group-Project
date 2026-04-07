import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resourceAPI, bookingAPI } from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

export default function NewBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(location.state?.resource || null);
  const [form, setForm] = useState({ bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    resourceAPI.getAll({ status: 'ACTIVE', isBookable: true }).then(r => setResources(r.data));
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResource) return toast.error('Please select a resource');
    if (form.startTime >= form.endTime) return toast.error('End time must be after start time');
    setSubmitting(true);
    try {
      const response = await bookingAPI.create({
        resourceId: selectedResource.id,
        ...form,
        expectedAttendees: parseInt(form.expectedAttendees) || null,
      });
      toast.success('Booking request submitted!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit booking';
      toast.error(errorMessage);
    }
    setSubmitting(false);
  };

  return (
    <Navbar>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book a Resource</h1>
          <p className="text-gray-500 mt-1">Fill in the details below to submit a booking request</p>
        </div>

        {/* Resource selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Select Resource</h2>
          {selectedResource ? (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              {selectedResource.imageUrl
                ? <img src={selectedResource.imageUrl} alt={selectedResource.name} className="w-16 h-16 rounded-xl object-cover" />
                : <div className="w-16 h-16 rounded-xl bg-blue-200 flex items-center justify-center text-2xl">🏛️</div>}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{selectedResource.name}</p>
                <p className="text-sm text-gray-500">{selectedResource.type?.replace(/_/g,' ')} · {selectedResource.location}</p>
              </div>
              <button onClick={() => setSelectedResource(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
          ) : (
            <select onChange={e => { const r = resources.find(x => x.id === parseInt(e.target.value)); setSelectedResource(r); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">-- Select a resource --</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type?.replace(/_/g,' ')})</option>)}
            </select>
          )}
        </div>

        {/* Booking form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Booking Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Date *</label>
              <input type="date" min={today} required value={form.bookingDate}
                onChange={e => setForm(f => ({...f, bookingDate: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Start Time *</label>
              <input type="time" required value={form.startTime}
                onChange={e => setForm(f => ({...f, startTime: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">End Time *</label>
              <input type="time" required value={form.endTime}
                onChange={e => setForm(f => ({...f, endTime: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Purpose *</label>
            <textarea required placeholder="Describe the purpose of this booking..." rows={3} value={form.purpose}
              onChange={e => setForm(f => ({...f, purpose: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Expected Attendees</label>
            <input type="number" min="1" value={form.expectedAttendees}
              onChange={e => setForm(f => ({...f, expectedAttendees: e.target.value}))}
              className="w-48 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors">
            {submitting ? 'Submitting...' : 'Request Booking'}
          </button>
        </form>
      </div>
    </Navbar>
  );
}
