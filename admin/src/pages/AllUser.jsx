import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10); // Default to 10 rows per page
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/users`);
        setUsers(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

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

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleRowsPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

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

      await axios.put(`${baseUrl}/users/${userId}`, payload);

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
      await axios.delete(`${baseUrl}/users/${userId}`);
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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <header className="flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-800 focus:outline-none md:hidden"
          >
            {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Information of All Users</h1>
        </header>

        <main className="flex-grow overflow-auto p-4 md:p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <div className="relative max-w-md">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search by username, email, ID, name..."
                  className="w-full py-2 pl-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
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

            <div className="flex items-center">
              <label htmlFor="rowsPerPage" className="mr-2 text-sm text-gray-600">Users per page:</label>
              <select
                id="rowsPerPage"
                value={usersPerPage}
                onChange={handleRowsPerPageChange}
                className="py-2 pl-2 pr-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-auto mt-4">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-800">
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'>No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">E-ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'>Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Designation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user, index) => (
                    <tr key={user.userID}>
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                        {index + 1 + (currentPage - 1) * usersPerPage}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {editingId === user.userID ? (
                          <input name="username" value={editData.username} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-sm" />
                        ) : user.username}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input name="e_id" value={editData.e_id} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-sm" />
                        ) : user.E_ID}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {editingId === user.userID ? (
                          <input name="name" value={editData.name} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-sm" />
                        ) : user.Name}
                      </td>
                      <td className='px-4 py-4 text-sm text-gray-900 capitalize'>
                        {user.Role}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input name="company_name" value={editData.company_name} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-sm" />
                        ) : user.Company_name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input name="department" value={editData.department} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-sm" />
                        ) : user.Department}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input name="designation" value={editData.designation} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-sm" />
                        ) : user.Designation}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {editingId === user.userID ? (
                          <input name="email" type="email" value={editData.email} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-sm" />
                        ) : user.email}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {editingId === user.userID ? (
                          <input name="phone" value={editData.phone} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-sm" />
                        ) : user.Phone}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/dashboard/userprofile/${user.userID}`)}
                            className="flex items-center justify-center px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-900  text-xs cursor-pointer transition duration-300"
                          >
                            <FaUser className="mr-1" /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} entries
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                <FaChevronLeft />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageClick(i + 1)}
                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-800 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllUser;