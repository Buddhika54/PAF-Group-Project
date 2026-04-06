import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI, resourceAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import Navbar from "../components/layout/Navbar";

const CATEGORIES = ['HARDWARE','SOFTWARE','ELECTRICAL','PLUMBING','HVAC','OTHER'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];

export default function NewTicket() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ title:'', resourceId:'', category:'OTHER', priority:'MEDIUM', description:'', preferredContact:'' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    resourceAPI.getAll({}).then(r => setResources(r.data));
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 3) {
      toast.error('Maximum 3 attachments allowed');
      return;
    }
    setFiles(prev => [...prev, ...selected].slice(0, 3));
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        priority: form.priority,
        description: form.description,
        preferredContact: form.preferredContact,
        resourceId: form.resourceId ? parseInt(form.resourceId) : null,
      };
      const res = await ticketAPI.create(payload);
      const ticketId = res.data.id;

      for (const file of files) {
        try { await ticketAPI.uploadAttachment(ticketId, file); }
        catch { /* attachment fails silently */ }
      }

      toast.success('Ticket submitted successfully!');
      window.location.href = '/tickets';
    } catch { toast.error('Failed to submit ticket'); }
    setSubmitting(false);
  };

  return (
    <Navbar>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-500 mt-1">Submit a maintenance or incident ticket</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="Brief description of the issue..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Resource</label>
              <select value={form.resourceId} onChange={e => setForm(f => ({...f, resourceId: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">None</option>
                {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Description *</label>
            <textarea required rows={4} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              placeholder="Describe the issue in detail..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Preferred Contact</label>
            <input value={form.preferredContact} onChange={e => setForm(f => ({...f, preferredContact: e.target.value}))}
              placeholder="Phone / Email / Ext..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          {/* File upload area */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Attachments <span className="text-gray-400 font-normal">({files.length}/3 images)</span>
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
              <span className="text-2xl mb-2">📎</span>
              <span className="text-sm text-gray-500">Click or drag to upload images</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG, JPEG • Max 3 files</span>
              <input type="file" accept="image/jpeg,image/png,image/jpg" multiple onChange={handleFileChange} className="hidden" />
            </label>
            {files.length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {files.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(f)} alt={f.name} className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => removeFile(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors">
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </Navbar>
  );
}
