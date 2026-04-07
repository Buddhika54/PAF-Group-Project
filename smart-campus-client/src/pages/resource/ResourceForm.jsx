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
      // Only append image if it's Equipment
      if (image) formData.append('image', image);
    }

    if (form.availabilityStart) formData.append('availabilityStart', form.availabilityStart);
    if (form.availabilityEnd) formData.append('availabilityEnd', form.availabilityEnd);
    if (form.maintenanceNote) formData.append('maintenanceNote', form.maintenanceNote);

    onSubmit(formData);
  };

  const isEquipment = form.type === 'EQUIPMENT';

  const inputClass = 
    'bg-[#0d0f14] border border-[#1e2535] text-slate-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 w-full';

  const labelClass = 'text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 block';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className={labelClass}>Resource Name</label>
        <input
          name="name"
          placeholder="e.g. Main Lecture Hall A-101"
          value={form.name}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      {/* Type */}
      <div>
        <label className={labelClass}>Resource Type</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className={`${inputClass} py-3`}
        >
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
      </div>

      {/* Non-Equipment Fields */}
      {!isEquipment && (
        <>
          <div>
            <label className={labelClass}>Capacity (Persons)</label>
            <input
              name="capacity"
              type="number"
              placeholder="Maximum number of people"
              value={form.capacity}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Building</label>
              <input
                name="building"
                placeholder="e.g. Science Block"
                value={form.building}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Location / Floor</label>
              <input
                name="location"
                placeholder="e.g. Ground Floor, Room 205"
                value={form.location}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </>
      )}

      {/* Equipment Fields */}
      {isEquipment && (
        <div>
          <label className={labelClass}>Special Notes / Specifications</label>
          <textarea
            name="specialNotes"
            placeholder="Brand, Model, Serial Number, Specifications, etc."
            value={form.specialNotes}
            onChange={handleChange}
            rows={4}
            className={`${inputClass} resize-y min-h-[110px]`}
          />
        </div>
      )}

      {/* Availability Time Range */}
      <div>
        <label className={labelClass}>Availability (Daily Time Range)</label>
        <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <p className="text-xs text-slate-500 mb-1">Start Time</p>
            <input
              type="time"
              name="availabilityStart"
              value={form.availabilityStart}
              onChange={handleChange}
              className={`${inputClass} text-center font-mono`}
            />
          </div>

          <div className="text-slate-500 text-xl font-light hidden sm:block">→</div>

          <div className="flex-1 w-full">
            <p className="text-xs text-slate-500 mb-1">End Time</p>
            <input
              type="time"
              name="availabilityEnd"
              value={form.availabilityEnd}
              onChange={handleChange}
              className={`${inputClass} text-center font-mono`}
            />
          </div>
        </div>
      </div>

      {/* Maintenance Note */}
      <div>
        <label className={labelClass}>Maintenance Note</label>
        <textarea
          name="maintenanceNote"
          placeholder="Any special maintenance instructions..."
          value={form.maintenanceNote}
          onChange={handleChange}
          rows={3}
          className={`${inputClass} resize-y min-h-[100px]`}
        />
      </div>

      {/* Bookable Checkbox */}
      <div className="flex items-center gap-3 bg-[#161b27] border border-[#1e2535] rounded-2xl px-4 py-3.5">
        <input
          type="checkbox"
          name="isBookable"
          checked={form.isBookable}
          onChange={handleChange}
          className="w-4 h-4 accent-indigo-500"
        />
        <div>
          <p className="text-sm text-[#f0f4ff]">Bookable by users</p>
          <p className="text-xs text-slate-500">Allow students and staff to book this resource</p>
        </div>
      </div>

      {/* Image Upload - ONLY for EQUIPMENT */}
      {isEquipment && (
        <div>
          <label className={labelClass}>Resource Image (Optional)</label>
          <div className="mt-1 border border-dashed border-[#1e2535] rounded-2xl p-6 text-center hover:border-indigo-500/50 transition-colors">
            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="hidden"
              id="resource-image"
              accept="image/*"
            />
            <label
              htmlFor="resource-image"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-2xl">
                📸
              </div>
              <div>
                <p className="text-sm text-slate-300">Click to upload image</p>
                <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
              </div>
            </label>
            {image && (
              <p className="mt-3 text-xs text-emerald-400 font-medium">
                Selected: {image.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-br from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium py-3.5 rounded-2xl transition-all active:scale-[0.985]"
      >
        {initialData.id ? 'Update Resource' : 'Create Resource'}
      </button>
    </form>
  );
}