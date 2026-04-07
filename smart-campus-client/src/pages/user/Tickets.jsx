import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI } from '../../services/api';
import Navbar from "../../components/layout/Navbar";

const TABS = ['ALL','OPEN','IN_PROGRESS','RESOLVED','CLOSED'];
const priorityClr = { CRITICAL: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700',
                       MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700' };
const statusClr = { OPEN: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-purple-100 text-purple-700',
                     RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-600', REJECTED: 'bg-red-100 text-red-700' };

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketAPI.getMyTickets().then(r => {
      const ticketsData = Array.isArray(r.data) ? r.data : [];
      setTickets(ticketsData);
    }).catch(() => {
      setTickets([]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = Array.isArray(tickets) 
    ? (tab === 'ALL' ? tickets : tickets.filter(t => t.status === tab))
    : [];

  return (
    <Navbar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
            <p className="text-gray-500 mt-1">Track your reported maintenance issues</p>
          </div>
          <Link to="/tickets/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors">
            🎫 Report Issue
          </Link>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.replace(/_/g,' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityClr[t.priority]}`}>{t.priority}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClr[t.status]}`}>{t.status.replace(/_/g,' ')}</span>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{t.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{t.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span>{t.category}</span>
                  {t.resource && <span>{t.resource.name}</span>}
                  <span>{t.createdAt?.split('T')[0]}</span>
                </div>
                <Link to={`/tickets/${t.id}`} className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-100 hover:border-blue-300 rounded-xl py-2 transition-colors">
                  View Details →
                </Link>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                No {tab !== 'ALL' ? tab.replace(/_/g,' ').toLowerCase() : ''} tickets found.
              </div>
            )}
          </div>
        )}
      </div>
    </Navbar>
  );
}
