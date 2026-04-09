import { useState, useEffect, useRef } from 'react';
import { notificationAPI, systemNotificationAPI } from '../../api/axiosInstance';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'system'
    const dropdownRef = useRef(null);

    const fetchAll = async () => {
        try {
            const [notifRes, countRes, sysRes] = await Promise.all([
                notificationAPI.getMyNotifications(),
                notificationAPI.getUnreadCount(),
                systemNotificationAPI.getAll(),
            ]);
            setNotifications(notifRes.data);
            setUnreadCount(countRes.data.count);
            setSystemNotifications(sysRes.data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const fetchUnreadCountOnly = async () => {
        try {
            const res = await notificationAPI.getUnreadCount();
            setUnreadCount(res.data.count);
        } catch (error) { }
    };

    useEffect(() => {
        fetchAll();
        const interval = setInterval(() => {
            if (!isOpen) {
                fetchUnreadCountOnly();
            } else {
                fetchAll();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) { console.error("Failed to mark read:", error); }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) { console.error("Failed to mark all read:", error); }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const d = new Date(timeString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = (type) => {
        if (!type) return '📢';
        if (type.includes('APPROVED')) return '✅';
        if (type.includes('REJECTED') || type.includes('CANCELLED')) return '❌';
        if (type.includes('TICKET')) return '🎫';
        if (type.includes('RESOURCE')) return '🏛️';
        if (type.includes('BOOKING_CREATED')) return '📋';
        return '🔔';
    };

    const importantCount = systemNotifications.filter(s => s.isImportant).length;
    const totalBadge = unreadCount + importantCount;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-200"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {totalBadge > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                        {totalBadge > 9 ? '9+' : totalBadge}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            Notifications
                            {totalBadge > 0 && (
                                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full">{totalBadge} new</span>
                            )}
                        </h3>
                        {unreadCount > 0 && activeTab === 'personal' && (
                            <button onClick={handleMarkAllRead} className="text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors">
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === 'personal' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            My Alerts {unreadCount > 0 && <span className="ml-1 bg-rose-100 text-rose-700 text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === 'system' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Broadcasts {importantCount > 0 && <span className="ml-1 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">🚨 {importantCount}</span>}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto">
                        {/* Personal Notifications Tab */}
                        {activeTab === 'personal' && (
                            notifications.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center space-y-3">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-sm">You are all caught up!</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {notifications.map(notif => (
                                        <li key={notif.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group relative ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                                        >
                                            {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r-full"></div>}
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 mt-1 bg-white w-8 h-8 rounded-full flex items-center justify-center text-sm border border-gray-100 shadow-sm">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</p>
                                                    <p className={`text-xs mt-1 line-clamp-2 ${!notif.isRead ? 'text-gray-700' : 'text-gray-500'}`}>{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">{formatTime(notif.createdAt)}</p>
                                                </div>
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                                                        className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-full hover:bg-teal-100 text-teal-600 transition-all"
                                                        title="Mark as read"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )
                        )}

                        {/* System Notifications Tab */}
                        {activeTab === 'system' && (
                            systemNotifications.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center space-y-3">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl">📢</div>
                                    <p className="text-gray-500 text-sm">No broadcasts yet.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {systemNotifications.map(sn => (
                                        sn.isImportant ? (
                                            // IMPORTANT notifications — prominent highlight
                                            <li key={sn.id} className="relative p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500">
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0 mt-1 bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-sm animate-pulse">
                                                        🚨
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wide">
                                                                Important
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-amber-900">{sn.title}</p>
                                                        <p className="text-xs mt-1 text-amber-800 line-clamp-3">{sn.message}</p>
                                                        <p className="text-[10px] text-amber-600 mt-2 font-medium">{formatTime(sn.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ) : (
                                            // Standard broadcast notifications
                                            <li key={sn.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0 mt-1 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-blue-100">
                                                        📢
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800">{sn.title}</p>
                                                        <p className="text-xs mt-1 text-gray-500 line-clamp-3">{sn.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">{formatTime(sn.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
