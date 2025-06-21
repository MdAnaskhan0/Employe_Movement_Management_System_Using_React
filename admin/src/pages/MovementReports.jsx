import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch, FaFilter, FaCalendarAlt, FaSort, FaPrint } from 'react-icons/fa';
import { MdFirstPage, MdLastPage, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';
import { FaFileDownload } from 'react-icons/fa';

const MovementReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [movementReports, setMovementReports] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const [users, setUsers] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  console.log(selectedUser);


  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: 'dateTime',
    direction: 'desc'
  });

  const fetchMovementReports = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/movements/get_all_movement`);
      const usersResponse = await axios.get(`${baseUrl}/users`);

      // check if userStatus === active then setUsers to usersResponse.data.data
      setUsers(usersResponse.data.data);

      setMovementReports(response.data);
      setFilteredData([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch movement reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovementReports();
  }, []);

  const applyFilters = () => {
    // Don't apply filters if no user is selected
    if (!selectedUser && !statusFilter && !dateRange.start && !dateRange.end) {
      setFilteredData([]);
      setFiltersApplied(false);
      return;
    }

    // Apply filters when search button is clicked
    let result = [...movementReports];

    // Apply user filter if selected
    if (selectedUser) {
      result = result.filter(item => item.username.toLowerCase() === selectedUser.toLowerCase());
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.punchTime === statusFilter);
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      result = result.filter(item => {
        const itemDate = new Date(item.dateTime);
        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

        if (startDate && endDate) {
          const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

          // Compare only the date parts (ignoring time)
          return itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly;
        } else if (startDate) {
          const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          return itemDateOnly >= startDateOnly;
        } else if (endDate) {
          const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          return itemDateOnly <= endDateOnly;
        }
        return true;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(result);
    setFiltersApplied(true);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
    toast.info('You have been logged out');
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateTime).toLocaleDateString('en-US', options);
  };

  const formatTime12Hour = (timeString) => {
    if (!timeString) return 'N/A';

    // Create a date object with today's date and the time from the string
    const [hours, minutes, seconds] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds || 0, 10));

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    if (filtersApplied) {
      applyFilters(); // Re-apply filters when sorting changes
    }
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadge = (status) => {
    const statusClasses = {
      IN: 'bg-green-100 text-green-800',
      OUT: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Function to convert data to CSV and trigger download
  const downloadCSV = () => {
    if (filteredData.length === 0) {
      toast.warning('No data to download');
      return;
    }

    // Create CSV headers
    const headers = [
      'User',
      'Date',
      'Submitted Time',
      'Punch Time',
      'Punch Status',
      'Place',
      'Party',
      'Purpose'
    ];

    // Create CSV rows
    const rows = filteredData.map(report => [
      report.username,
      formatDateTime(report.dateTime),
      formatTime12Hour(report.punchingTime),
      report.punchTime,
      report.visitingStatus,
      report.placeName || 'N/A',
      report.partyName || 'N/A',
      report.purpose || 'Not specified'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(item => `"${item}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `movement_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('CSV download started');
  };


  const PrintFile = () => {
    if (filteredData.length === 0) {
      toast.warning('No data to print');
      return;
    }

    const userInfo = selectedUser
      ? users.find(user => user.username.toLowerCase() === selectedUser.toLowerCase())
      : null;

    const formattedRows = currentRows.map(report => `
    <tr>
      <td class="py-1">${report.username}</td>
      <td class="py-1">${formatDateTime(report.dateTime)}</td>
      <td class="py-1">${formatTime12Hour(report.punchingTime)}</td>
      <td class="py-1">${report.punchTime}</td>
      <td class="py-1"><span class="status-badge status-${report.visitingStatus}">${report.visitingStatus}</span></td>
      <td class="py-1">${report.placeName || 'N/A'}</td>
      <td class="py-1">${report.partyName || 'N/A'}</td>
      <td class="py-1">${report.purpose || 'Not specified'}</td>
    </tr>
  `).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.open();

    const currentDateTime = new Date().toLocaleString();

    printWindow.document.write(`
    <html>
      <head>
        <title>Movement Report ${userInfo ? `- ${userInfo.username}` : ''}</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 10px;
            color: #333;
            font-size: 12px;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            position: relative;
          }
          .content {
            flex: 1;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e0e0e0;
          }
          .header h1 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: #2c3e50;
          }
          .report-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
            margin-bottom: 10px;
            padding: 8px;
            background-color: #f8f9fa;
            border-radius: 3px;
            font-size: 11px;
            margin-left: 30px;
          }
          .info-pair {
            display: flex;
            justify-content: space-between;
            gap: 5px;
          }
          .info-pair div {
            flex: 1 1 45%;
            min-width: 0;
          }
          .report-info strong {
            color: #2c3e50;
            display: inline-block;
            width: 80px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
            font-size: 11px;
            margin-left: 30px;
          }
          th {
            background-color: #3498db;
            color: white;
            padding: 4px;
            text-align: left;
            font-weight: 500;
            font-size: 11px;
          }
          td {
            padding: 4px;
            border-bottom: 1px solid #e0e0e0;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .footer {
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #7f8c8d;
            border-top: 1px solid #e0e0e0;
            padding-top: 6px;
            margin-top: auto;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          @media print {
            body {
              padding: 0;
            }
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              padding-bottom: px;
              background: white;
            }
          }
          .status-badge {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 500;
          }
          .status-IN {
            background-color: #d1fae5;
            color: #065f46;
          }
          .status-OUT {
            background-color: #fee2e2;
            color: #b91c1c;
          }
          .status-PENDING {
            background-color: #fef3c7;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="content">
          <div class="header">
            <h1>Movement Report of ${userInfo ? userInfo.Name : 'User'}</h1>
          </div>

          ${userInfo ? `
          <div class="report-info">
            <div class="info-pair">
              <div><strong>Employee:</strong> ${userInfo.Name || 'N/A'}</div>
              <div><strong>ID:</strong> ${userInfo.E_ID || 'N/A'}</div>
            </div>
            <div class="info-pair">
              <div><strong>Company:</strong> ${userInfo.Company_name || 'N/A'}</div>
              <div><strong>Department:</strong> ${userInfo.Department || 'N/A'}</div>
            </div>
            <div class="info-pair">
              <div><strong>Designation:</strong> ${userInfo.Designation || 'N/A'}</div>
            </div>
          </div>
          ` : ''}

          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Submitted Date/Time</th>
                <th>Punch Time</th>
                <th>Punch Status</th>
                <th>Visit Status</th>
                <th>Place</th>
                <th>Party</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              ${formattedRows}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Generated on: ${currentDateTime}</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };



  const clearFilters = () => {
    setSelectedUser('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setFilteredData([]);
    setFiltersApplied(false);
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
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
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow p-4">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-800 focus:outline-none md:hidden mr-4"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>

            <h1 className="text-xl font-semibold text-gray-800"> Movement Reports</h1>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={downloadCSV}
              disabled={!filtersApplied || filteredData.length === 0}
              className={`flex items-center px-3 py-2 ${filtersApplied && filteredData.length > 0 ? 'bg-green-800 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded transition ease-in-out duration-300 hover:-translate-y-1 hover:scale-105`}
            >
              <FaFileDownload className="mr-2" />
              Download CSV
            </button>

            <button
              onClick={PrintFile}
              className='flex items-center px-3 py-2 rounded-md text-sm cursor-pointer bg-emerald-700 hover:bg-emerald-600 text-white'>
              <FaPrint className="mr-2" />
              Print
            </button>
          </div>
        </header>

        {/* Filters Section */}
        <div className="bg-white shadow-sm p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* User Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select User</option>
                {users
                  .filter(user => user.userStatus === 'active') // or user.status === 'active', depending on your data
                  .map(user => (
                    <option key={user.username} value={user.username} className='capitalize'>
                      {user.username}
                    </option>
                  ))}

              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Punch In">Punch In</option>
                <option value="Punch Out">Punch Out</option>
              </select>
            </div>

            {/* Date Range Filters */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            {/* Search Button */}
            <div className="flex space-x-2">
              <button
                onClick={applyFilters}
                className="w-full px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors cursor-pointer"
              >
                Search
              </button>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-grow overflow-auto p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !filtersApplied ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">Please select filters and click "Search" to view movement reports</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No movement reports found matching your criteria</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('username')}
                      >
                        <div className="flex items-center">
                          User
                          <FaSort className="ml-1 text-gray-400" />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('dateTime')}
                      >
                        <div className="flex items-center">
                          Submitted Date/Time
                          <FaSort className="ml-1 text-gray-400" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punch Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('punchTime')}
                      >
                        <div className="flex items-center">
                          Punch Status
                          <FaSort className="ml-1 text-gray-400" />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('visitingStatus')}
                      >
                        <div className="flex items-center">
                          Visit Status
                          <FaSort className="ml-1 text-gray-400" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Place
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Party
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRows.map((report) => (
                      <tr key={report.movementID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDateTime(report.dateTime)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatTime12Hour(report.punchingTime)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{(report.punchTime)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(report.visitingStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{report.placeName || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{report.partyName || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{report.purpose || 'Not specified'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastRow, filteredData.length)}</span> of{' '}
                      <span className="font-medium">{filteredData.length}</span> results
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700 mr-2">Rows per page:</span>
                      <select
                        className="border rounded-md px-2 py-1 text-sm"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        {[5, 10, 25, 50, 100].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">First</span>
                        <MdFirstPage className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <MdChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <MdChevronRight className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => paginate(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Last</span>
                        <MdLastPage className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MovementReports;