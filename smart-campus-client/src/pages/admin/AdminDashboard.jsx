import { useState } from 'react';


export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden font-['Inter',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        {/* Top Bar */}
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            </div>
            <p className="text-gray-400 text-sm ml-4">Welcome back, Admin. Here's what's happening on campus today.</p>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Charts + Quick Actions Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            <div className="xl:col-span-2">
              <ActivityChart />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            <RecentBookings />
            <RecentUsers />
          </div>

          {/* Resource Usage */}
          <div className="mt-6">
            <ResourceUsage />
          </div>
        </main>
      </div>
    </div>
  );
}
