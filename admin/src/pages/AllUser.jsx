import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaEdit, FaTrash, FaSave, FaTimesCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const AllUser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5137/users');
        setUsers(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  const handleEdit = (user) => {
    setEditingId(user.userID);
    setEditData({
      username: user.username,
      email: user.email,
      e_id: user.E_ID,
      name: user.Name,
      designation: user.Designation,
      department: user.Department,
      company_name: user.Company_name,
      phone: user.Phone
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (userId) => {
    try {
      const response = await axios.put(`/users/${userId}`, editData);
      
      // Update local state
      setUsers(users.map(user => 
        user.userID === userId ? { ...user, ...editData } : user
      ));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/users/${userId}`);
      
      // Update local state
      setUsers(users.filter(user => user.userID !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-red-500">{error}</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        <header className="flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-800 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>

          <h1 className="text-xl font-semibold text-gray-800">All Users</h1>
        </header>

        <main className="flex-grow overflow-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.userID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userID}</td>
                      
                      {/* Username */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="username"
                            value={editData.username}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{user.username}</div>
                        )}
                      </td>
                      
                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.userID ? (
                          <input
                            type="email"
                            name="email"
                            value={editData.email}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{user.email}</div>
                        )}
                      </td>
                      
                      {/* E-ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="e_id"
                            value={editData.e_id}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{user.E_ID}</div>
                        )}
                      </td>
                      
                      {/* Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{user.Name}</div>
                        )}
                      </td>
                      
                      {/* Designation */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="designation"
                            value={editData.designation}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{user.Designation}</div>
                        )}
                      </td>
                      
                      {/* Department */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="department"
                            value={editData.department}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{user.Department}</div>
                        )}
                      </td>
                      
                      {/* Company */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="company_name"
                            value={editData.company_name}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{user.Company_name}</div>
                        )}
                      </td>
                      
                      {/* Phone */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="phone"
                            value={editData.phone}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{user.Phone}</div>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === user.userID ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(user.userID)}
                              className="text-green-600 hover:text-green-900"
                              title="Save"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel"
                            >
                              <FaTimesCircle />
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(user.userID)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllUser;