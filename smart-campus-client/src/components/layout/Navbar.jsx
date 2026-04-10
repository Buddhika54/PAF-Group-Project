import { useState, useEffect  } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { notificationAPI } from '../../api/axiosInstance';

const NAV_USER = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Browse Resources', path: '/resourceslist', icon: '🏛️' },
    { label: 'My Bookings', path: '/my-bookings', icon: '📅' },
    { label: 'My Tickets', path: '/tickets', icon: '🎫' },
];

const NAV_ADMIN = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
    { label: 'Manage Resources', path: '/admin/resources', icon: '🏛️' },
    { label: 'Manage Bookings', path: '/admin/bookings', icon: '📅' },
    { label: 'Manage Tickets', path: '/admin/tickets', icon: '🎫' },
    { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
    { label: 'Manage Users', path: '/admin/manage-users', icon: '👥' },
];

const NAV_TECHNICIAN = [
    { label: 'Dashboard', path: '/technician/dashboard', icon: '🏠' },
    { label: 'Assigned Tickets', path: '/technician/tickets', icon: '🎫' },
    { label: 'Maintenance Tasks', path: '/technician/maintenance-tasks', icon: '🔧' },
    { label: 'Resource Status', path: '/technician/resources', icon: '🏛️' },
];

export default function Navbar({ children }) {
    const { user, logout, isAdmin, isTechnician, isStudent } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [unread, setUnread] = useState(0);
    const [showNotifPanel, setShowNotifPanel] = useState(false);

    // Determine which nav links to show based on role
    let navLinks = NAV_USER;
    let roleTitle = "Student Dashboard";
    
    if (isAdmin) {
        navLinks = NAV_ADMIN;
        roleTitle = "Admin Dashboard";
    } else if (isTechnician) {
        navLinks = NAV_TECHNICIAN;
        roleTitle = "Technician Dashboard";
    } else if (isStudent) {
        roleTitle = "Student Dashboard";
    }

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await notificationAPI.getUnreadCount();
                setUnread(res.data.count);
            } catch { }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    const initials = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

    // Get role display name
    const getRoleDisplay = () => {
        if (isAdmin) return 'Administrator';
        if (isTechnician) return 'Technician';
        return 'Student';
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-teal-800 flex flex-col flex-shrink-0`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
                    <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">SLIIT</span>
                    </div>
                    {sidebarOpen && <span className="text-white font-bold text-lg whitespace-nowrap">Smart Campus</span>}
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navLinks.map(link => {
                        const active = location.pathname === link.path;
                        return (
                            <Link key={link.path} to={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${active ? 'bg-slate-900 text-white' : 'text-white hover:bg-slate-800 hover:text-white'}`}>
                                <span className="text-lg flex-shrink-0">{link.icon}</span>
                                {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User info */}
                <div className="p-3 border-t border-slate-700">
                    {sidebarOpen && (
                        <div className="mb-3 px-3 py-2 bg-slate-700/50 rounded-lg">
                            <p className="text-xs text-slate-300">Logged in as</p>
                            <p className="text-sm font-semibold text-white truncate">{user?.name || user?.email}</p>
                            <p className="text-xs text-teal-300 mt-0.5">{getRoleDisplay()}</p>
                        </div>
                    )}
                    <button onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-colors">
                        <span className="text-lg">🚪</span>
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Notification bell */}
                        <NotificationDropdown />
                        <div className="relative">
                            <button onClick={() => setShowNotifPanel(!showNotifPanel)}
                                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unread > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unread > 9 ? '9+' : unread}
                                    </span>
                                )}
                            </button>
                            {showNotifPanel && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                    <div className="p-3 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                                    </div>
                                    <div className="p-3 text-center text-gray-500 text-sm">
                                        No new notifications
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User avatar */}
                        <div className="flex items-center gap-2.5">
                            {user?.picture ? (
                                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200" />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {initials}
                                </div>
                            )}
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-700 leading-none">{user?.name || user?.email}</p>
                                <p className="text-xs text-teal-600 font-medium mt-0.5">{getRoleDisplay()}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}