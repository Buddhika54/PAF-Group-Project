import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ticketAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Navbar from "../components/layout/Navbar";

const priorityClr = { CRITICAL: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700', MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700' };
const statusSteps = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED'];

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [editComment, setEditComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [lightbox, setLightbox] = useState(null);

  const fetchTicket = async () => {
    try {
      const r = await ticketAPI.getById(id);
      setTicket(r.data);
    } catch { toast.error('Failed to load ticket'); }
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await ticketAPI.addComment(id, comment);
      setComment('');
      fetchTicket();
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
  };

  const saveEdit = async (cid) => {
    try {
      await ticketAPI.editComment(id, cid, editContent);
      setEditComment(null);
      fetchTicket();
    } catch { toast.error('Failed to edit'); }
  };

  const deleteComment = async (cid) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await ticketAPI.deleteComment(id, cid);
      fetchTicket();
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (!ticket) return (
    <Navbar><div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div></Navbar>
  );

  const statusIdx = statusSteps.indexOf(ticket.status);

  return (
    <Navbar>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 flex-1">{ticket.title}</h1>
              <div className="flex gap-2 flex-shrink-0">
                {ticket.priority && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityClr[ticket.priority]}`}>{ticket.priority}</span>}
                {ticket.category && <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{ticket.category}</span>}
              </div>
            </div>
            {ticket.resource && <p className="text-sm text-blue-600 mb-3">🏛️ {ticket.resource.name}</p>}
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ticket.description}</p>
            {ticket.resolutionNotes && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-sm font-semibold text-green-700 mb-1">✅ Resolution Notes</p>
                <p className="text-sm text-green-800">{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Attachments */}
          {ticket.attachments?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-3">Attachments ({ticket.attachments.length})</h2>
              <div className="flex gap-3 flex-wrap">
                {ticket.attachments.map(a => (
                  <img key={a.id} src={a.fileUrl} alt={a.fileName}
                    onClick={() => setLightbox(a.fileUrl)}
                    className="w-24 h-24 object-cover rounded-xl cursor-pointer border border-gray-200 hover:scale-105 transition-transform" />
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-5">Comments ({ticket.comments?.length || 0})</h2>
            <div className="space-y-5">
              {ticket.comments?.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div>
                    {c.author?.profilePicture
                      ? <img src={c.author.profilePicture} className="w-8 h-8 rounded-full" alt="" />
                      : <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">{c.author?.name?.charAt(0)}</div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{c.author?.name}</span>
                      <span className="text-xs text-gray-400">{c.createdAt?.replace('T',' ').split('.')[0]}</span>
                      {c.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                    </div>
                    {editComment === c.id ? (
                      <div className="flex gap-2">
                        <input value={editContent} onChange={e => setEditContent(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                        <button onClick={() => saveEdit(c.id)} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg">Save</button>
                        <button onClick={() => setEditComment(null)} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg">Cancel</button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">{c.content}</p>
                    )}
                    {user?.id === c.author?.id && editComment !== c.id && (
                      <div className="flex gap-3 mt-1">
                        <button onClick={() => { setEditComment(c.id); setEditContent(c.content); }} className="text-xs text-blue-500 hover:text-blue-700">Edit</button>
                        <button onClick={() => deleteComment(c.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submitComment} className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              <div>
                {user?.picture
                  ? <img src={user.picture} className="w-8 h-8 rounded-full" alt="" />
                  : <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">{user?.name?.charAt(0)}</div>}
              </div>
              <div className="flex-1 flex gap-2">
                <input value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Post</button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Ticket Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                {ticket.createdBy?.profilePicture
                  ? <img src={ticket.createdBy.profilePicture} className="w-8 h-8 rounded-full" alt="" />
                  : <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">{ticket.createdBy?.name?.charAt(0)}</div>}
                <div>
                  <p className="text-xs text-gray-400">Created by</p>
                  <p className="font-medium text-gray-900">{ticket.createdBy?.name}</p>
                </div>
              </div>
              <div className="border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-400 mb-1">Assigned to</p>
                <p className="font-medium text-gray-900">{ticket.assignedTo?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Created</p>
                <p className="text-gray-700">{ticket.createdAt?.split('T')[0]}</p>
              </div>
              {ticket.preferredContact && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contact</p>
                  <p className="text-gray-700">{ticket.preferredContact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Status Timeline</h2>
            <div className="space-y-3">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 
                    ${i < statusIdx ? 'bg-green-500 text-white' : i === statusIdx ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                    {i < statusIdx ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm ${i === statusIdx ? 'font-semibold text-blue-700' : i < statusIdx ? 'text-gray-500 line-through' : 'text-gray-400'}`}>
                    {step.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Attachment" className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
    </Navbar>
  );
}
