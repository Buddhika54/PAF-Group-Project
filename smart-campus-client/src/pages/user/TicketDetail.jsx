import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from "../../components/layout/Navbar";
import { toast } from 'react-hot-toast';
import { ticketAPI } from '../../api/axiosInstance';

const priorityClr = { 
  CRITICAL: 'bg-red-100 text-red-700', 
  HIGH: 'bg-orange-100 text-orange-700', 
  MEDIUM: 'bg-yellow-100 text-yellow-700', 
  LOW: 'bg-green-100 text-green-700' 
};

const statusSteps = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [editComment, setEditComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [lightbox, setLightbox] = useState(null);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      console.log('Fetching ticket from backend, ID:', id);
      const response = await ticketAPI.getById(id);
      console.log('Ticket from backend:', response.data);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to view this ticket');
      } else if (error.response?.status === 404) {
        toast.error('Ticket not found');
      } else {
        toast.error('Failed to load ticket');
      }
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    try {
      console.log('Submitting comment:', comment);
      const response = await ticketAPI.addComment(id, comment);
      console.log('Comment added:', response.data);
      
      setTicket(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data]
      }));
      
      setComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const saveEdit = async (commentId) => {
    try {
      console.log('Editing comment:', commentId);
      const response = await ticketAPI.editComment(id, commentId, editContent);
      console.log('Comment edited:', response.data);
      
      setTicket(prev => ({
        ...prev,
        comments: prev.comments.map(c => c.id === commentId ? response.data : c)
      }));
      
      setEditComment(null);
      toast.success('Comment edited successfully');
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Failed to edit comment');
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      await ticketAPI.deleteComment(id, commentId);
      
      setTicket(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId)
      }));
      
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <Navbar>
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Navbar>
    );
  }

  if (!ticket) {
    return (
      <Navbar>
        <div className="max-w-5xl mx-auto text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
          <p className="text-gray-500 mb-6">The ticket you're looking for doesn't exist.</p>
          <Link to="/tickets" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium">
            ← Back to Tickets
          </Link>
        </div>
      </Navbar>
    );
  }

  const statusIdx = statusSteps.indexOf(ticket.status);

  return (
    <Navbar>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 flex-1">{ticket.title}</h1>
              <div className="flex gap-2 flex-shrink-0">
                {ticket.priority && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityClr[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                )}
                {ticket.category && (
                  <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                    {ticket.category}
                  </span>
                )}
              </div>
            </div>
            
            {ticket.resource && (
              <p className="text-sm text-blue-600 mb-3">🏛️ {ticket.resource.name}</p>
            )}
            
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ticket.description}</p>
            
            {ticket.resolutionNotes && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-sm font-semibold text-green-700 mb-1">✅ Resolution Notes</p>
                <p className="text-sm text-green-800">{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-5">Comments ({ticket.comments?.length || 0})</h2>
            
            {ticket.comments && ticket.comments.length > 0 ? (
              <div className="space-y-5">
                {ticket.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0">
                      {c.author?.name?.charAt(0) || c.author?.firstName?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {c.author?.name || c.author?.firstName || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleString() : 'Just now'}
                        </span>
                        {c.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                      </div>
                      {editComment === c.id ? (
                        <div className="flex gap-2">
                          <input 
                            value={editContent} 
                            onChange={e => setEditContent(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" 
                          />
                          <button onClick={() => saveEdit(c.id)} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg">Save</button>
                          <button onClick={() => setEditComment(null)} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg">Cancel</button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700">{c.content}</p>
                      )}
                      {editComment !== c.id && (
                        <div className="flex gap-3 mt-1">
                          <button onClick={() => { setEditComment(c.id); setEditContent(c.content); }} className="text-xs text-blue-500 hover:text-blue-700">Edit</button>
                          <button onClick={() => deleteComment(c.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            )}

            <form onSubmit={submitComment} className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0">
                {localStorage.getItem('userName')?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 flex gap-2">
                <input 
                  value={comment} 
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" 
                />
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Ticket Info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Ticket ID</p>
                <p className="font-medium text-gray-900">#{ticket.id}</p>
              </div>
              <div className="border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="font-medium text-gray-900">{ticket.status || 'OPEN'}</p>
              </div>
              <div className="border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-400 mb-1">Created</p>
                <p className="text-gray-700">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'Unknown'}</p>
              </div>
              {ticket.preferredContact && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contact</p>
                  <p className="text-gray-700">{ticket.preferredContact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Status Timeline</h2>
            <div className="space-y-3">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 
                    ${i < statusIdx ? 'bg-green-500 text-white' : 
                      i === statusIdx ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                      'bg-gray-100 text-gray-400'}`}>
                    {i < statusIdx ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm ${i === statusIdx ? 'font-semibold text-blue-700' : 
                    i < statusIdx ? 'text-gray-500 line-through' : 'text-gray-400'}`}>
                    {step.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <Link 
            to="/tickets"
            className="block text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            ← Back to All Tickets
          </Link>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Attachment" className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
    </Navbar>
  );
}