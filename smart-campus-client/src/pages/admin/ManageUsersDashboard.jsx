import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from "../../components/layout/Navbar";

const API_BASE_URL = 'http://localhost:8080/api/admin/users';

const ManageUsersDashboard = () => {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const size = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // CREATE USER
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'TECHNICIAN'
  });

  // EDIT USER (ROLE REMOVED ONLY HERE)
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    username: '',
    email: ''
  });

  // FETCH USERS
  const fetchUsers = async (page = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (roleFilter !== 'ALL') params.append('role', roleFilter);

      const response = await fetch(`${API_BASE_URL}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers(0);
  }, [token, searchTerm, roleFilter]);

  // CREATE USER
  const handleCreateUser = async (e) => {
    e.preventDefault();

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    });

    if (response.ok) {
      alert('User created successfully');
      setShowCreateModal(false);
      fetchUsers(currentPage);
    } else {
      alert('Create failed');
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name || '',
      username: user.username || '',
      email: user.email || ''
    });
    setShowEditModal(true);
  };

  // UPDATE USER
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API_BASE_URL}/${editingUser.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editUserForm)
    });

    if (response.ok) {
      alert('User updated successfully');
      setShowEditModal(false);
      fetchUsers(currentPage);
    } else {
      alert('Update failed');
    }
  };

  // DELETE USER
  const deleteUser = async (userId, email) => {
    if (!window.confirm(`Delete ${email}?`)) return;

    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.ok) {
      fetchUsers(currentPage);
    } else {
      alert('Delete failed');
    }
  };

  return (
    <Navbar>
    <div className="p-6 max-w-7xl mx-auto">

      

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 mt-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600 mt-1">
            Create and manage ADMIN & TECHNICIAN accounts
          </p>
        </div>
        

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          + Create User
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6 bg-white p-5 rounded-2xl shadow border">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 border rounded-xl"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 border rounded-xl"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TECHNICIAN">TECHNICIAN</option>
        </select>

        <button
          onClick={() => fetchUsers(0)}
          className="px-6 py-3 border rounded-xl hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Username</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.username}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.role}</td>

                    <td className="p-4 text-center space-x-3">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 font-medium"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteUser(user.id, user.email)}
                        className="text-red-600 font-medium"
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

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => fetchUsers(i)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === i
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl w-[420px]">
            <h2 className="text-xl font-bold mb-4">Create User</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">

              <input
                className="w-full border p-3 rounded-xl"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                required
              />

              <input
                className="w-full border p-3 rounded-xl"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                required
              />

              <input
                className="w-full border p-3 rounded-xl"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />

              <input
                type="password"
                className="w-full border p-3 rounded-xl"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
              />

              <select
                className="w-full border p-3 rounded-xl"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="TECHNICIAN">TECHNICIAN</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border p-3 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-3 rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL (ROLE REMOVED ONLY HERE) */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl w-[420px]">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>

            <form onSubmit={handleUpdateUser} className="space-y-4">

              <input
                className="w-full border p-3 rounded-xl"
                value={editUserForm.name}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, name: e.target.value })
                }
                required
              />

              <input
                className="w-full border p-3 rounded-xl"
                value={editUserForm.username}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, username: e.target.value })
                }
                required
              />

              <input
                className="w-full border p-3 rounded-xl"
                value={editUserForm.email}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, email: e.target.value })
                }
                required
              />

              {/* ROLE REMOVED FROM EDIT ONLY */}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border p-3 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-3 rounded-xl"
                >
                  Update
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
    </Navbar>
  );
};

export default ManageUsersDashboard;