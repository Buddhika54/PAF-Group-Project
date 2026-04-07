import { useState } from 'react';
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
  <div className="p-6 text-white bg-gray-950 h-screen">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    <p>Dashboard is loading successfully 🎉</p>
    

<Link to="/admin/resources" className="text-blue-500 hover:underline">
  View Resources
</Link>
  </div>
);

}
