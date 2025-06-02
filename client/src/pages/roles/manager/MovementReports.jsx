import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiX, FiCalendar, FiUser } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import { format, isAfter, isBefore, parseISO, isValid } from 'date-fns';

const MovementReports = () => {
    const [users, setUsers] = useState([]);
    const [movementReports, setMovementReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    // Format date to 12-hour AM/PM format
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = parseISO(dateString);
            return isNaN(date) ? dateString : format(date, 'MM/dd/yyyy hh:mm a');
        } catch {
            return dateString;
        }
    };

    // Format just the date part
    const formatDateOnly = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = parseISO(dateString);
            return isNaN(date) ? dateString : format(date, 'MM/dd/yyyy');
        } catch {
            return dateString;
        }
    };

    // Format just the time part in 12-hour format
    const formatTimeOnly = (input) => {
        if (!input) return '-';

        let date;
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(input)) {
            date = new Date(`2000-01-01T${input}`);
        } else {
            date = new Date(input);
        }

        return isValid(date) ? format(date, 'hh:mm aa') : '-';
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${baseUrl}/users`);
                setUsers(res.data.data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load users');
            }
        };
        fetchUsers();
    }, []);

    const isDateInRange = (reportDate, startDate, endDate) => {
        try {
            const reportDateObj = parseISO(reportDate);
            const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
            const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;

            if (!startDateObj && !endDateObj) return true;

            if (startDateObj && endDateObj) {
                return isAfter(reportDateObj, startDateObj) && isBefore(reportDateObj, endDateObj);
            } else if (startDateObj) {
                return isAfter(reportDateObj, startDateObj);
            } else if (endDateObj) {
                return isBefore(reportDateObj, endDateObj);
            }
            return true;
        } catch (error) {
            console.error('Error comparing dates:', error);
            return false;
        }
    };

    const handleSearch = async () => {
        if (!selectedUser) {
            toast.warning('Please select a user');
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/get_movement/${selectedUser}`);
            console.log('API Response:', res.data);

            const allReports = Array.isArray(res.data) ? res.data : [];
            const filtered = allReports.filter((report) => {
                return isDateInRange(report.dateTime, fromDate, toDate);
            });

            setMovementReports(allReports);
            setFilteredReports(filtered);
            setCurrentPage(0);

            if (filtered.length === 0) {
                toast.info('No records found for the selected criteria');
            } else {
                // toast.success(`${filtered.length} records found`);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch movement reports');
            setMovementReports([]);
            setFilteredReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedUser('');
        setFromDate('');
        setToDate('');
        setMovementReports([]);
        setFilteredReports([]);
        setCurrentPage(0);
        // toast.info('Filters cleared');
    };

    // Pagination logic
    const pageCount = Math.ceil(filteredReports.length / rowsPerPage);
    const offset = currentPage * rowsPerPage;
    const currentReports = filteredReports.slice(offset, offset + rowsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <ToastContainer position="top-right" autoClose={3000} />

            <h1 className="text-2xl font-bold mb-6 text-gray-800">Movement Reports</h1>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-400" />
                        </div>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select a user</option>
                            {users.map((user) => (
                                <option className="capitalize" key={user.userID} value={user.userID}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="text-gray-400" />
                        </div>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="From date"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="text-gray-400" />
                        </div>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="To date"
                            min={fromDate}
                        />
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Searching...' : (
                                <>
                                    <FiSearch className="mr-2" />
                                    Search
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleClear}
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FiX className="mr-2" />
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-medium text-gray-800">
                        Results: {filteredReports.length} records found
                    </h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(0);
                            }}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                            {[5, 10, 20, 50, 100].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punching Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentReports.length > 0 ? (
                                currentReports.map((report) => (
                                    <tr key={report.id || Math.random()} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{report.username || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateOnly(report.dateTime)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatTimeOnly(report.punchingTime)}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.punchTime === 'Punch In'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {report.punchTime || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.visitingStatus || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.placeName || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.partyName || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.purpose || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.remark || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                        {isLoading ? 'Loading...' : 'No records found. Try a different search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pageCount > 1 && (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{offset + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(offset + rowsPerPage, filteredReports.length)}</span> of{' '}
                                    <span className="font-medium">{filteredReports.length}</span> results
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
                                containerClassName="inline-flex -space-x-px"
                                pageClassName="px-3 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                                previousClassName="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                nextClassName="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                activeClassName="z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                breakClassName="px-3 py-2 border border-gray-300 bg-white text-gray-700"
                                forcePage={currentPage}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovementReports;