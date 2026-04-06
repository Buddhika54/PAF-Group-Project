//import { Outlet, Link, useLocation } from 'react-router-dom';
//import { Home, Calendar, Wrench, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Facilities', path: '/resources', icon: Home },
        { name: 'Bookings', path: '/bookings', icon: Calendar },
        { name: 'Maintenance', path: '/tickets', icon: Wrench },
        { name: 'Notifications', path: '/notifications', icon: Bell }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-white shadow-md border-r border-gray-100 flex flex-col">
                <div className="p-6">
                    {/* changed gradient to teal */}
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-transparent bg-clip-text">
                        Smart Campus
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                                        ? 'bg-teal-50 text-teal-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-end px-8 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-200"></div>

                        <div className="flex items-center gap-3 cursor-pointer group" onClick={logout} title="Click to logout">
                            <div className="flex flex-col items-end">
                                <span className="font-semibold text-sm text-gray-700 group-hover:text-red-500 transition-colors">
                                    {user?.username || 'User'}
                                </span>

                                {/* changed role color */}
                                <span className="text-xs text-teal-500 font-medium bg-teal-50 px-2 py-0.5 rounded-full mt-0.5">
                                    {user?.role}
                                </span>
                            </div>

                            {/* changed avatar gradient */}
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-white">
                                {(user?.username || 'U')[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}