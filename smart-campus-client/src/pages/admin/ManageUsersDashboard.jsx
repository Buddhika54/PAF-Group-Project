// src/pages/admin/ManageUsersDashboard.jsx
// OR src/components/admin/ManageUsersDashboard.jsx (your choice)

import React, { useState, useEffect } from 'react';

const ManageUsersDashboard = () => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL | ADMIN | TECHNICIAN
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TECHNICIAN' // default
  });

  // Fetch all users (replace with your real API call)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with your actual API endpoint
      // Example: const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      // const data = await res.json();
      
      // For now, using dummy data so you can test immediately
      const dummyUsers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@company.com',
          role: 'ADMIN',
          createdAt: '2025-12-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'Sarah Smith',
          email: 'sarah@company.com',
          role: 'TECHNICIAN',
          createdAt: '2026-01-20T14:15:00Z'
        },
        {
          id: 3,
          name: 'Michael Chen',
          email: 'michael@company.com',
          role: 'TECHNICIAN',
          createdAt: '2026-03-05T09:45:00Z'
        },
      ];
      setUsers(dummyUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users. Check console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill all fields');
      return;
    }

    try {
      // TODO: Replace with your real API call
      // Example:
      // const res = await fetch('/api/admin/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      //   body: JSON.stringify(newUser)
      // });
      
      console.log('Creating user:', newUser); // For testing
      
      // Simulate success
      const newUserObj = {
        id: Date.now(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date().toISOString()
      };
      
      setUsers(prev => [...prev, newUserObj]);
      alert(`User ${newUser.email} created successfully!`);
      
      // Reset form and close modal
      setNewUser({ name: '', email: '', password: '', role: 'TECHNICIAN' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Create user failed:', error);
      alert('Failed to create user');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600 mt-1">Create and manage ADMIN &amp; TECHNICIAN accounts</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <div className="absolute left-4 top-3.5 text-gray-400">
              🔎
            </div>
          </div>
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-64">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin Only</option>
            <option value="TECHNICIAN">Technician Only</option>
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchUsers}
          className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-xl flex items-center gap-2 text-gray-700 font-medium"
        >
          <span>↻</span>
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading users...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-600">NAME</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-600">EMAIL</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-600">ROLE</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-600">CREATED</th>
                <th className="px-6 py-5 text-center text-sm font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 font-medium">{user.name}</td>
                    <td className="px-6 py-5 text-gray-600">{user.email}</td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-600 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                        onClick={() => {
                          if (confirm(`Delete user ${user.email}?`)) {
                            setUsers(prev => prev.filter(u => u.id !== user.id));
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md mx-4 shadow-2xl">
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-2xl font-semibold mb-6">Create New User</h2>
              
              <form onSubmit={handleCreateUser}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="user@company.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-4 text-gray-700 font-medium border border-gray-300 rounded-2xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersDashboard;