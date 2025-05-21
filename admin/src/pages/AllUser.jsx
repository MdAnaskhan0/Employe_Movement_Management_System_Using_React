import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const AllUser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://192.168.111.140:5137/users');
        setUsers(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search text
  const filteredUsers = users.filter(user => {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.E_ID && user.E_ID.toLowerCase().includes(searchLower)) ||
      (user.Name && user.Name.toLowerCase().includes(searchLower)) ||
      (user.Department && user.Department.toLowerCase().includes(searchLower)) ||
      (user.Designation && user.Designation.toLowerCase().includes(searchLower)) ||
      (user.Company_name && user.Company_name.toLowerCase().includes(searchLower))
    );
  });

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
      const payload = {
        username: editData.username,
        email: editData.email,
        E_ID: editData.e_id,
        Name: editData.name,
        Designation: editData.designation,
        Department: editData.department,
        Company_name: editData.company_name,
        Phone: editData.phone
      };

      const response = await axios.put(`http://localhost:5137/users/${userId}`, payload);

      // Update local state
      setUsers(users.map(user =>
        user.userID === userId ? { ...user, ...payload } : user
      ));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5137/users/${userId}`);

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
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <header className="flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-800 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Information of All Users</h1>
        </header>

        <main className="flex-grow overflow-auto p-4 md:p-6 bg-gray-50">
          {/* search bar : serch by username, email, e-id, Name, department,company */}
          {/* ************************************************************************** */}

          <div className="relative max-w-md py-2">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search by username, email, ID, name..."
                className="w-full py-2 pl-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button 
                  className="absolute right-3 text-gray-400 hover:text-gray-600" 
                  onClick={() => setSearchText('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* ************************************************************************** */}

          <div className="bg-white rounded-lg shadow overflow-auto">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[180px]">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px]">E-ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Designation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[180px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.userID}>
                      {/* Username */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="username"
                            value={editData.username}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          user.username
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === user.userID ? (
                          <input
                            type="email"
                            name="email"
                            value={editData.email}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          user.email
                        )}
                      </td>

                      {/* E-ID */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="e_id"
                            value={editData.e_id}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          user.E_ID
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          user.Name
                        )}
                      </td>

                      {/* Designation */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="designation"
                            value={editData.designation}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          user.Designation
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="department"
                            value={editData.department}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          user.Department
                        )}
                      </td>

                      {/* Company */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="company_name"
                            value={editData.company_name}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          user.Company_name
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input
                            type="text"
                            name="phone"
                            value={editData.phone}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          user.Phone
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/dashboard/userprofile/${user.userID}`)}
                            className="flex items-center justify-center px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs"
                          >
                            <FaUser className="mr-1" /> View Profile
                          </button>
                        </div>
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