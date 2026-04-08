import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_USER = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'Browse Resources', path: '/resources', icon: '🏛️' },
  { label: 'My Bookings', path: '/my-bookings', icon: '📅' },
  { label: 'My Tickets', path: '/tickets', icon: '🎫' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
];

const NAV_ADMIN = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
  { label: 'Manage Resources', path: '/admin/resources', icon: '🏛️' },
  { label: 'Manage Bookings', path: '/admin/bookings', icon: '📅' },
  { label: 'Manage Tickets', path: '/admin/tickets', icon: '🎫' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
];

export default function Navbar({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // TEMP mock user since auth is removed
  const user = {
    name: 'Test User',
    role: location.pathname.startsWith('/admin') ? 'ADMIN' : 'USER',
    picture: null,
  };

  const isAdmin = user.role === 'ADMIN';
  const unread = 0;

  const navLinks = isAdmin ? NAV_ADMIN : NAV_USER;
  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const handleLogout = () => {
    console.log('Temporary logout');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } transition-all duration-300 bg-teal-800 flex flex-col flex-shrink-0`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">SLIIT</span>
          </div>
          {sidebarOpen && (
            <span className="text-white font-bold text-lg whitespace-nowrap">
              Dashboard
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-white hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-lg flex-shrink-0">{link.icon}</span>
                {sidebarOpen && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-200 hover:bg-red-900/40 hover:text-red-300 transition-colors"
          >
            <span className="text-lg">🚪</span>
            {sidebarOpen && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-50">
                  <p className="text-sm text-gray-600">No new notifications</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {initials}
                </div>
              )}

              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700 leading-none">
                  {user?.name}
                </p>
                <p className="text-xs text-teal-600 font-medium mt-0.5">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}