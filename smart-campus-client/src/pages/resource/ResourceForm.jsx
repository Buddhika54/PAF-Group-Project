import { useState } from 'react';

export default function ResourceForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    name: initialData.name || '',
    type: initialData.type || 'LECTURE_HALL',
    capacity: initialData.capacity || '',
    location: initialData.location || '',
    building: initialData.building || '',
    availabilityStart: initialData.availabilityStart || '',
    availabilityEnd: initialData.availabilityEnd || '',
    isBookable: initialData.isBookable ?? true,
    maintenanceNote: initialData.maintenanceNote || '',
    specialNotes: initialData.specialNotes || ''
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('name', form.name);
    formData.append('type', form.type);
    formData.append('isBookable', form.isBookable);

    const isEquipment = form.type === 'EQUIPMENT';

    if (!isEquipment) {
      if (form.capacity) formData.append('capacity', form.capacity);
      if (form.building) formData.append('building', form.building);
      if (form.location) formData.append('location', form.location);
    } else {
      if (form.specialNotes) formData.append('specialNotes', form.specialNotes);
      if (image) formData.append('image', image);
    }

    if (form.availabilityStart) formData.append('availabilityStart', form.availabilityStart);
    if (form.availabilityEnd) formData.append('availabilityEnd', form.availabilityEnd);
    if (form.maintenanceNote) formData.append('maintenanceNote', form.maintenanceNote);

    onSubmit(formData);
  };

  const isEquipment = form.type === 'EQUIPMENT';

  // Improved styles with better sizing
  const inputClass =
    'bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition placeholder:text-gray-400 w-full';

  const labelClass =
    'text-xs font-semibold text-gray-600 mb-1.5 block';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-800">
            {initialData.id ? 'Edit Resource' : 'New Resource'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Fill in the details below</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className={labelClass}>Resource Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              required
              placeholder="e.g., Hall A, Projector, etc."
            />
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Lab</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </div>

          {/* Non-Equipment */}
          {!isEquipment && (
            <>
              <div>
                <label className={labelClass}>Capacity</label>
                <input
                  name="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Number of people"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Building</label>
                  <input
                    name="building"
                    value={form.building}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g., Science Tower"
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Floor, Room #"
                  />
                </div>
              </div>
            </>
          )}

          {/* Equipment */}
          {isEquipment && (
            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                name="specialNotes"
                value={form.specialNotes}
                onChange={handleChange}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Any special instructions or notes about this equipment"
              />
            </div>
          )}

          {/* Availability */}
          <div>
            <label className={labelClass}>Availability Hours</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Start</label>
                <input
                  type="time"
                  name="availabilityStart"
                  value={form.availabilityStart}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">End</label>
                <input
                  type="time"
                  name="availabilityEnd"
                  value={form.availabilityEnd}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div>
            <label className={labelClass}>Maintenance Notes</label>
            <textarea
              name="maintenanceNote"
              value={form.maintenanceNote}
              onChange={handleChange}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Any maintenance issues or schedule"
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              name="isBookable"
              checked={form.isBookable}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2"
            />
            <label className="text-sm text-gray-700 font-medium">Available for booking</label>
          </div>

          {/* Image */}
          {isEquipment && (
            <div>
              <label className={labelClass}>Image (optional)</label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:text-sm file:rounded-lg file:border-0 file:text-gray-700 file:bg-gray-100 hover:file:bg-gray-200 file:cursor-pointer"
                accept="image/*"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-base py-2.5 rounded-xl font-semibold transition-colors shadow-sm hover:shadow"
          >
            {initialData.id ? 'Update Resource' : 'Create Resource'}
          </button>
        </div>
      </div>
    </form>
  );
}