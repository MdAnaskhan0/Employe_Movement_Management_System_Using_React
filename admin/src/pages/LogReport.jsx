import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUniversity,
  FaSearch,
  FaFileExport,
  FaFilter,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserTie,
  FaClock,
  FaStickyNote,
  FaBuilding
} from 'react-icons/fa';
import {
  MdDateRange,
  MdOutlineDataSaverOn,
  MdOutlineDataUsage,
  MdLocationOn,
  MdBusiness,
  MdAccessTime
} from 'react-icons/md';
import {
  FiFilter,
  FiUser,
  FiRefreshCw
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { format, parseISO } from 'date-fns';

const LogReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState([]);
  const [userLogData, setUserLogData] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const pageCount = Math.ceil(filteredLogs.length / rowsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  // Get current logs for pagination
  const currentLogs = filteredLogs.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersResponse, logsResponse] = await Promise.all([
          axios.get('http://192.168.111.140:5137/users'),
          axios.get('http://192.168.111.140:5137/movement_edit_logs')
        ]);

        setUsers(usersResponse.data.data || []);
        setUserLogData(logsResponse.data || []);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error(`Failed to fetch data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!selectedUser) {
      toast.warning("Please select a user");
      return;
    }
    if (!fromDate || !toDate) {
      toast.warning("Please select both date range");
      return;
    }

    try {
      setIsSearching(true);
      // Filter by userID (number) and date range
      const filtered = userLogData.filter((log) => {
        if (log.userID !== Number(selectedUser)) return false;

        const logDate = new Date(log.editTime);
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // include entire 'toDate' day

        return logDate >= from && logDate <= to;
      });

      setFilteredLogs(filtered);
      setCurrentPage(0);

      if (filtered.length === 0) {
        toast.info("No logs found for the selected filters");
      } else {
        toast.success(`Found ${filtered.length} logs`);
      }
    } catch (error) {
      toast.error("Error filtering logs");
      console.error("Filter error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSelectedUser('');
    setFromDate('');
    setToDate('');
    setFilteredLogs([]);
    setCurrentPage(0);
  };


  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
    toast.info("Logged out successfully");
  };

  const renderFormattedData = (data) => {
    try {
      const parsedData = JSON.parse(data);
      return (
        <div className="space-y-2">
          {Object.entries(parsedData).map(([key, value]) => (
            <div key={key} className="flex items-start">
              <span className="font-medium text-gray-700 w-32 flex-shrink-0 capitalize">{key}:</span>
              <span className="text-gray-900 break-words">{value || '-'}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <div className="text-gray-500 italic">Invalid data format</div>;
    }
  };

  const renderDetailCard = (data, isOriginal = false) => {
    try {
      const parsedData = JSON.parse(data);
      return (
        <div className={`p-4 rounded-lg ${isOriginal ? 'bg-gray-50' : 'bg-blue-50'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <MdBusiness className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Movement ID</h4>
                <p className="font-medium">{parsedData.movementID || '-'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FaUserTie className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">User</h4>
                <p className="font-medium">{parsedData.username || parsedData.userID || '-'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <MdAccessTime className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Date & Time</h4>
                <p className="font-medium">
                  {parsedData.dateTime ? format(parseISO(parsedData.dateTime), 'PPpp') : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Place</h4>
                <p className="font-medium">{parsedData.placeName || '-'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <MdLocationOn className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Status</h4>
                <p className="font-medium">{parsedData.visitingStatus || '-'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FaBuilding className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Party</h4>
                <p className="font-medium">{parsedData.partyName || '-'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FaClock className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Punch Time</h4>
                <p className="font-medium">
                  {parsedData.punchTime || '-'} {parsedData.punchingTime
                    ? ` (${(() => {
                      // If punchingTime is a string like "15:00:00"
                      const timeStr = typeof parsedData.punchingTime === 'string'
                        ? parsedData.punchingTime
                        : parsedData.punchingTime.toTimeString().slice(0, 8); // fallback if Date object

                      const [h, m] = timeStr.split(':');
                      let hour = parseInt(h, 10);
                      const minute = m || '00';
                      let ampm = 'AM';

                      if (hour === 0) {
                        hour = 12;
                        ampm = 'AM';
                      } else if (hour === 12) {
                        ampm = 'PM';
                      } else if (hour > 12) {
                        hour -= 12;
                        ampm = 'PM';
                      }

                      return `${hour}:${minute} ${ampm}`;
                    })()})`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FaStickyNote className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Purpose</h4>
                <p className="font-medium">{parsedData.purpose || '-'}</p>
              </div>
            </div>

            {parsedData.remark && (
              <div className="md:col-span-2 flex items-start space-x-2">
                <FaStickyNote className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">Remark</h4>
                  <p className="font-medium">{parsedData.remark}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } catch {
      return (
        <div className={`p-4 rounded-lg ${isOriginal ? 'bg-gray-50' : 'bg-blue-50'}`}>
          <pre className="text-xs overflow-auto">{data}</pre>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 w-full">
        <header className="flex items-center justify-between bg-white shadow-sm p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 focus:outline-none md:hidden hover:text-gray-800"
          >
            {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
          <div className="flex items-center">
            <FaUniversity className="text-blue-600 mr-2 text-xl" />
            <h1 className="text-xl font-semibold text-gray-800">User Activity Logs</h1>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-auto">
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <FaFilter className="mr-2 text-blue-600" /> Filter Criteria
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleReset}
                  className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <FiRefreshCw className="mr-1" /> Reset
                </button>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || isSearching}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                  <FaSearch className="mr-1" />
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* User Dropdown */}
              <div className="space-y-1">
                <label
                  htmlFor="user"
                  className="block text-sm font-medium text-gray-700 flex items-center"
                >
                  <FaUser className="mr-2 text-blue-500" /> User
                </label>
                <select
                  id="user"
                  name="user"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.userID} value={user.userID} className="capitalize">
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Date */}
              <div className="space-y-1">
                <label
                  htmlFor="fromDate"
                  className="block text-sm font-medium text-gray-700 flex items-center"
                >
                  <FaCalendarAlt className="mr-2 text-blue-500" /> From Date
                </label>
                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* To Date */}
              <div className="space-y-1">
                <label
                  htmlFor="toDate"
                  className="block text-sm font-medium text-gray-700 flex items-center"
                >
                  <FaCalendarAlt className="mr-2 text-blue-500" /> To Date
                </label>
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                  min={fromDate}
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <MdOutlineDataUsage className="mr-2 text-blue-600" />
                Activity Logs
                {filteredLogs.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredLogs.length} records found)
                  </span>
                )}
              </h2>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label htmlFor="rowsPerPage" className="mr-2 text-sm text-gray-600">
                    Rows:
                  </label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={filteredLogs.length === 0}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>

                <button
                  className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 text-sm"
                  disabled={filteredLogs.length === 0}
                >
                  <FaFileExport className="mr-1" /> Export
                </button>
              </div>
            </div>

            {isSearching ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {userLogData.length > 0 ? (
                  <p>No logs match your search criteria. Try adjusting your filters.</p>
                ) : (
                  <p>No log data available. Please check your connection.</p>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Edit Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Original Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentLogs.map((log, index) => {
                        const user = users.find(u => u.userID === log.userID);
                        return (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="font-medium text-gray-900">{index + 1}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {user ? user.username : 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(parseISO(log.editTime), 'PPpp')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                              {renderDetailCard(log.originalData, true)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                              {renderDetailCard(log.updatedData)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{currentPage * rowsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min((currentPage + 1) * rowsPerPage, filteredLogs.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredLogs.length}</span> results
                      </p>
                    </div>
                    <ReactPaginate
                      previousLabel={'Previous'}
                      nextLabel={'Next'}
                      breakLabel={'...'}
                      pageCount={pageCount}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={handlePageClick}
                      containerClassName={'flex items-center space-x-1'}
                      pageClassName={'px-3 py-1 rounded-md'}
                      pageLinkClassName={'text-sm'}
                      activeClassName={'bg-blue-600 text-white'}
                      previousClassName={'px-3 py-1 rounded-md border'}
                      nextClassName={'px-3 py-1 rounded-md border'}
                      disabledClassName={'opacity-50 cursor-not-allowed'}
                      forcePage={currentPage}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </div>
  );
};

export default LogReport;