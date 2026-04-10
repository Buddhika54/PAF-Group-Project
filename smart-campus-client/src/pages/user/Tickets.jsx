import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from "../../components/layout/Navbar";
import { ticketAPI } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const TABS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const priorityClr = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700'
};
const statusClr = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  REJECTED: 'bg-red-100 text-red-700'
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to view your tickets');
      navigate('/login');
      return;
    }
    loadTickets();
  }, [isAuthenticated, token, navigate]);

  const loadTickets = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching tickets from backend...');
      const response = await ticketAPI.getMyTickets();
      console.log('Tickets from backend:', response.data);
      setTickets(Array.isArray(response.data) ? response.data : []);
      
      // Also fetch stats
      try {
        const statsResponse = await ticketAPI.getMyStats();
        console.log('Stats:', statsResponse.data);
        setStats(statsResponse.data);
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
        // Don't fail the whole page if stats fail
      }
      
    } catch (error) {
      console.error('Error fetching tickets:', error);
      if (error.message === 'No authentication token found' || 
          error.response?.status === 401 ||
          error.message === 'Please login to continue') {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You don\'t have permission to view these tickets');
      } else {
        toast.error('Failed to load tickets. Please try again.');
      }
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = Array.isArray(tickets) 
    ? (tab === 'ALL' ? tickets : tickets.filter(t => t.status === tab))
    : [];

  return (
    <Navbar>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
            <p className="text-gray-500 mt-1">Track your reported maintenance issues</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadTickets}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
            >
              🔄 Refresh
            </button>
            <Link 
              to="/tickets/new" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
            >
              🎫 Report Issue
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Open</p>
              <p className="text-2xl font-bold text-blue-600">{stats.open || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-purple-600">{stats.inProgress || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Closed</p>
              <p className="text-2xl font-bold text-gray-600">{stats.closed || 0}</p>
            </div>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {TABS.map(t => (
            <button 
              key={t} 
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500 mb-2">
              Showing {filtered.length} ticket(s)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityClr[t.priority] || 'bg-gray-100 text-gray-700'}`}>
                      {t.priority || 'MEDIUM'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClr[t.status] || 'bg-blue-100 text-blue-700'}`}>
                      {t.status?.replace(/_/g, ' ') || 'OPEN'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{t.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{t.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-50 pt-3">
                    <span>{t.category || 'OTHER'}</span>
                    {t.resource && <span className="truncate max-w-[100px]">{t.resource.name}</span>}
                    <span>{t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <Link 
                    to={`/tickets/${t.id}`} 
                    className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-100 hover:border-blue-300 rounded-xl py-2 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="text-4xl mb-3">📭</div>
                  <p>No tickets found.</p>
                  <p className="text-sm mt-2">Click "Report Issue" to create your first ticket.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Navbar>
  );
}