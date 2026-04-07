import { useState } from 'react';

export default function ResourceForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    name: initialData.name || '',
    type: initialData.type || 'LECTURE_HALL',
    capacity: initialData.capacity || '',
    location: initialData.location || '',
    building: initialData.building || '',
    availabilityWindows: initialData.availabilityWindows || '',
    isBookable: initialData.isBookable ?? true,
    maintenanceNote: initialData.maintenanceNote || ''
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (image) formData.append('image', image);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" placeholder="Name" onChange={handleChange} value={form.name} className="input" required />
      <select name="type" onChange={handleChange} value={form.type} className="input">
        <option>LECTURE_HALL</option>
        <option>LAB</option>
        <option>MEETING_ROOM</option>
        <option>EQUIPMENT</option>
      </select>
      <input name="capacity" type="number" placeholder="Capacity" onChange={handleChange} value={form.capacity} className="input" />
      <input name="location" placeholder="Location" onChange={handleChange} value={form.location} className="input" />
      <input name="building" placeholder="Building" onChange={handleChange} value={form.building} className="input" />
      <input name="availabilityWindows" placeholder="Availability" onChange={handleChange} value={form.availabilityWindows} className="input" />
      <textarea name="maintenanceNote" placeholder="Maintenance Note" onChange={handleChange} value={form.maintenanceNote} className="input" />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isBookable" checked={form.isBookable} onChange={handleChange} /> Bookable
      </label>
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button className="btn">Submit</button>
    </form>
  );
}