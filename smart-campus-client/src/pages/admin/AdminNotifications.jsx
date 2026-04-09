import { useState, useEffect } from 'react';
import { systemNotificationAPI } from '../../api/axiosInstance';
import Navbar from '../../components/layout/Navbar';

const emptyForm = { title: '', message: '', isImportant: false };

export default function AdminNotifications() {
    const [broadcasts, setBroadcasts] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null); // null = create mode
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const fetchBroadcasts = async () => {
        setFetchLoading(true);
        try {
            const res = await systemNotificationAPI.getAll();
            setBroadcasts(res.data);
        } catch (err) {
            setError('Failed to load notifications.');
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.title.trim() || !form.message.trim()) {
            setError('Title and message are required.');
            return;
        }
        setLoading(true);
        try {
            if (editingId) {
                await systemNotificationAPI.update(editingId, form);
                showSuccess('Notification updated successfully!');
            } else {
                await systemNotificationAPI.create(form);
                showSuccess('Notification broadcast sent to all users!');
            }
            setForm(emptyForm);
            setEditingId(null);
            fetchBroadcasts();
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setForm({ title: item.title, message: item.message, isImportant: item.isImportant });
        setEditingId(item.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError('');
    };

    const handleDelete = async (id) => {
        try {
            await systemNotificationAPI.delete(id);
            setDeleteConfirmId(null);
            showSuccess('Notification deleted successfully!');
            fetchBroadcasts();
        } catch (err) {
            setError('Failed to delete notification.');
        }
    };

    const formatDate = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
            ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Navbar>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">Create, edit, and delete campus-wide broadcast notifications for all users.</p>
                </div>

                {/* Feedback banners */}
                {success && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm font-medium">
                        <span className="text-lg">✅</span> {success}
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                        <span className="text-lg">⚠️</span> {error}
                        <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 font-bold">✕</button>
                    </div>
                )}

                {/* Create / Edit Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3 ${editingId ? 'bg-amber-50' : 'bg-slate-50'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${editingId ? 'bg-amber-200' : 'bg-teal-100'}`}>
                            {editingId ? '✏️' : '📣'}
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 text-sm">
                                {editingId ? 'Edit Notification' : 'Create New Broadcast'}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {editingId ? 'Update the existing broadcast below.' : 'This will be visible to all users via the notification bell.'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Scheduled Maintenance Tonight"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm outline-none transition"
                                maxLength={120}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/120</p>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Write the detailed notification message here..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm outline-none resize-none transition"
                                maxLength={1000}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/1000</p>
                        </div>

                        {/* Important Toggle */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${form.isImportant ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    {form.isImportant && <span className="text-amber-500 animate-pulse">🚨</span>}
                                    Mark as Important
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">Important notifications are visually highlighted for all users.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isImportant"
                                    checked={form.isImportant}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            </label>
                        </div>

                        {/* Form Buttons */}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-all ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-600 hover:bg-teal-700'} disabled:opacity-60`}
                            >
                                {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                                {editingId ? 'Update Notification' : '📣 Broadcast to All Users'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Broadcasts History Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold text-gray-800 text-sm">Broadcast History</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{broadcasts.length} total notification{broadcasts.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button onClick={fetchBroadcasts} className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Refresh
                        </button>
                    </div>

                    {fetchLoading ? (
                        <div className="p-12 flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-500">Loading broadcasts...</p>
                        </div>
                    ) : broadcasts.length === 0 ? (
                        <div className="p-12 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-3xl">📭</div>
                            <p className="text-gray-600 font-medium text-sm">No broadcasts yet</p>
                            <p className="text-gray-400 text-xs">Create your first broadcast above.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {broadcasts.map(item => (
                                <div key={item.id} className={`p-5 hover:bg-gray-50 transition-colors ${item.isImportant ? 'border-l-4 border-amber-500 bg-amber-50/30' : ''}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${item.isImportant ? 'bg-amber-100' : 'bg-blue-50 border border-blue-100'}`}>
                                            {item.isImportant ? '🚨' : '📢'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                                                {item.isImportant && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wide">
                                                        Important
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.message}</p>
                                            <p className="text-[11px] text-gray-400 mt-2">
                                                Created: {formatDate(item.createdAt)}
                                                {item.updatedAt && <span className="ml-3 text-amber-500">Edited: {formatDate(item.updatedAt)}</span>}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(item.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Notification?</h3>
                        <p className="text-sm text-gray-500 mb-6">This broadcast will be permanently removed and users will no longer see it. This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Navbar>
    );
}
