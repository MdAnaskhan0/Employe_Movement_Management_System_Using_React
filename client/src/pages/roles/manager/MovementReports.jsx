import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSearch, FiX, FiCalendar, FiUser, FiDownload, FiPrinter } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import { format, parseISO, isValid } from 'date-fns';
import LogOutButton from '../../../components/LogoutButton';

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
    const printRef = useRef();

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = parseISO(dateString);
            return isNaN(date) ? dateString : format(date, 'MM/dd/yyyy hh:mm a');
        } catch {
            return dateString;
        }
    };

    const formatDateOnly = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = parseISO(dateString);
            return isNaN(date) ? dateString : format(date, 'MM/dd/yyyy');
        } catch {
            return dateString;
        }
    };

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
            if (startDateObj && endDateObj) return reportDateObj >= startDateObj && reportDateObj <= endDateObj;
            if (startDateObj) return reportDateObj >= startDateObj;
            if (endDateObj) return reportDateObj <= endDateObj;
            return true;
        } catch {
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
            const res = await axios.get(`${baseUrl}/movements/${selectedUser}`);
            const allReports = Array.isArray(res.data) ? res.data : [];
            const filtered = allReports.filter((report) => isDateInRange(report.dateTime, fromDate, toDate));
            setMovementReports(allReports);
            setFilteredReports(filtered);
            setCurrentPage(0);
            if (filtered.length === 0) toast.info('No records found for the selected criteria');
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
    };

    const pageCount = Math.ceil(filteredReports.length / rowsPerPage);
    const offset = currentPage * rowsPerPage;
    const currentReports = filteredReports.slice(offset, offset + rowsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleDownloadCSV = () => {
        const headers = [
            'Username', 'Date', 'Punching Time', 'Punch Status',
            'Status', 'Place', 'Party', 'Purpose', 'Remarks'
        ];
        const rows = currentReports.map((report) => [
            report.username || '-',
            formatDateOnly(report.dateTime),
            formatTimeOnly(report.punchingTime),
            report.punchTime || '-',
            report.visitingStatus || '-',
            report.placeName || '-',
            report.partyName || '-',
            report.purpose || '-',
            report.remark || '-'
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'movement_reports.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        const selectedUserInfo = users.find(user => String(user.userID) === String(selectedUser));

        const userDetails = selectedUserInfo ? `
            <div style="margin-bottom: 16px; font-size: 12px; display: flex; flex-direction: row; align-items: center; gap: 8px;">
                <div><strong>Name:</strong> ${selectedUserInfo.username || '-'}<br/></div>
                <div><strong>Employee ID:</strong> ${selectedUserInfo.E_ID || '-'}<br/></div>
                <div><strong>Company:</strong> ${selectedUserInfo.Company_name || '-'}<br/></div>
                <div><strong>Department:</strong> ${selectedUserInfo.Department || '-'}<br/></div>
                <div><strong>Designation:</strong> ${selectedUserInfo.Designation || '-'}<br/></div>
            </div>
        ` : '<div style="margin-bottom: 16px; font-size: 12px;">User info not available.</div>';

        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '', 'height=600,width=1000');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Movement Report</title>
                    <style>
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                                font-size: 11px;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            th, td {
                                padding: 2px 4px;
                                border: 1px solid #ccc;
                                text-align: left;
                                font-size: 11px;
                            }
                            th {
                                background-color: #f0f0f0;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h2 style="margin-bottom: 8px;">Movement Report</h2>
                    ${userDetails}
                    ${printContent}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div className="min-h-screen bg-white py-6">
            <div className='flex items-center justify-end mb-4'>
                <LogOutButton />
            </div>
            <div className="container mx-auto p-4 max-w-7xl">
                <ToastContainer position="top-right" autoClose={3000} />
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Movement Reports</h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                        <div className="relative md:col-span-3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiUser className="text-gray-400" />
                            </div>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="">Select a user</option>
                                {users.filter(
                                    (user) => user.userStatus === 'active'
                                ).map((user) => (
                                    <option className="capitalize" key={user.userID} value={user.userID}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative md:col-span-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiCalendar className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>

                        <div className="relative md:col-span-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiCalendar className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                min={fromDate}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 md:col-span-5">
                            <button 
                                onClick={handleSearch} 
                                disabled={isLoading}
                                className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 min-w-[120px]"
                            >
                                {isLoading ? 'Searching...' : <><FiSearch className="mr-2" />Search</>}
                            </button>
                            <button 
                                onClick={handleClear}
                                className="flex-1 md:flex-none flex items-center px-4 py-2 border text-sm rounded-md bg-white text-gray-700 hover:bg-gray-50 min-w-[100px]"
                            >
                                <FiX className="mr-2" />Clear
                            </button>
                            <button 
                                onClick={handleDownloadCSV}
                                className="flex-1 md:flex-none flex items-center px-4 py-2 border text-sm rounded-md bg-white text-gray-700 hover:bg-gray-50 min-w-[100px]"
                            >
                                <FiDownload className="mr-2" />CSV
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="flex-1 md:flex-none flex items-center px-4 py-2 border text-sm rounded-md bg-white text-gray-700 hover:bg-gray-50 min-w-[100px]"
                            >
                                <FiPrinter className="mr-2" />Print
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={printRef}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Username', 'Date', 'Punching Time', 'Punch Status', 'Status', 'Place', 'Party', 'Purpose', 'Remarks'].map((head, idx) => (
                                        <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{head}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentReports.length > 0 ? (
                                    currentReports.map((report, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm capitalize">{report.username || '-'}</td>
                                            <td className="px-6 py-4 text-sm">{formatDateOnly(report.dateTime)}</td>
                                            <td className="px-6 py-4 text-sm">{formatTimeOnly(report.punchingTime)}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${report.punchTime === 'Punch In' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {report.punchTime || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{report.visitingStatus || '-'}</td>
                                            <td className="px-6 py-4 text-sm">{report.placeName || '-'}</td>
                                            <td className="px-6 py-4 text-sm">{report.partyName || '-'}</td>
                                            <td className="px-6 py-4 text-sm">{report.purpose || '-'}</td>
                                            <td className="px-6 py-4 text-sm">{report.remark || '-'}</td>
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
                        <div className="p-4 border-t flex justify-end">
                            <ReactPaginate
                                previousLabel={'Previous'}
                                nextLabel={'Next'}
                                breakLabel={'...'}
                                pageCount={pageCount}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={handlePageClick}
                                containerClassName="flex space-x-1"
                                pageClassName="px-3 py-1 border rounded-md text-sm"
                                previousClassName="px-3 py-1 border rounded-md text-sm"
                                nextClassName="px-3 py-1 border rounded-md text-sm"
                                activeClassName="bg-indigo-500 text-white"
                                forcePage={currentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovementReports;