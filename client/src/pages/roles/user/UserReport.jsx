import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { FiDownload, FiSearch, FiCalendar, FiClock } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { FiEdit, FiSave, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { Skeleton } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LogoutButton from '../../../components/LogoutButton';

const UserReport = () => {
    const { user } = useAuth();
    const [movementData, setMovementData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: null,
        endDate: null
    });
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.userID) return;
            setIsLoading(true);
            try {
                const movementRes = await axios.get(`${baseUrl}/get_movement/${user.userID}`);
                const movement = movementRes.data;
                const dataArray = Array.isArray(movement) ? movement : [movement];
                setMovementData(dataArray);
                setFilteredData(dataArray);
            } catch (movementErr) {
                console.error('Error fetching movement data:', movementErr);
                setMovementData([]);
                setFilteredData([]);
                toast.error('Failed to load movement data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        let result = movementData;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.placeName && item.placeName.toLowerCase().includes(term)) ||
                (item.partyName && item.partyName.toLowerCase().includes(term)) ||
                (item.purpose && item.purpose.toLowerCase().includes(term)) ||
                (item.punchTime && item.punchTime.toLowerCase().includes(term))
            );
        }

        if (statusFilter) {
            result = result.filter(item => item.punchTime?.includes(statusFilter));
        }

        if (dateFilter.startDate || dateFilter.endDate) {
            result = result.filter(item => {
                const itemDate = new Date(item.dateTime);
                const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
                const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

                if (start && end) {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return itemDate >= start && itemDate <= end;
                } else if (start) {
                    start.setHours(0, 0, 0, 0);
                    return itemDate >= start;
                } else if (end) {
                    end.setHours(23, 59, 59, 999);
                    return itemDate <= end;
                }
                return true;
            });
        }

        setFilteredData(result);
        setCurrentPage(1);
    }, [searchTerm, dateFilter, movementData, statusFilter]);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const handleEditClick = (movement) => {
        setEditRowId(movement.movementID);
        setEditFormData({
            ...movement,
            punchingTime: movement.punchingTime || '',
            purpose: movement.purpose || '',
            remark: movement.remark || '',
            punchTime: movement.punchTime || '',
            visitingStatus: movement.visitingStatus || '',
            placeName: movement.placeName || '',
            partyName: movement.partyName || '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async () => {
        try {
            const original = movementData.find(m => m.movementID === editRowId);

            await axios.put(`${baseUrl}/update_movement/${editRowId}`, editFormData);

            await axios.post(`${baseUrl}/movement_edit_logs`, {
                userID: user.userID,
                movementID: editRowId,
                originalData: original,
                updatedData: editFormData,
                editTime: new Date().toISOString()
            });

            setMovementData((prevData) =>
                prevData.map((item) =>
                    item.movementID === editRowId ? { ...item, ...editFormData } : item
                )
            );

            setEditRowId(null);
            toast.success('Movement record updated successfully!');
        } catch (err) {
            console.error('Error updating movement record:', err);
            toast.error('Failed to update record. Please try again.');
        }
    };

    const handleCancelClick = () => {
        setEditRowId(null);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageSizeOptions = [
        { value: 5, label: '5 rows' },
        { value: 10, label: '10 rows' },
        { value: 20, label: '20 rows' },
        { value: 50, label: '50 rows' },
        { value: 100, label: '100 rows' },
        { value: 200, label: '200 rows' },
        { value: 500, label: '500 rows' },
        { value: 1000, label: '1000 rows' }
    ];

    const downloadCSV = () => {
        if (filteredData.length === 0) {
            toast.info('No data available to download');
            return;
        }

        const headers = [
            'Date',
            'Status',
            'Punch Time',
            'Visit Status',
            'Place',
            'Party',
            'Purpose',
            'Remarks'
        ].join(',');

        const rows = filteredData.map(row => {
            return [
                new Date(row.dateTime).toLocaleDateString('en-US'),
                row.punchTime || 'N/A',
                row.punchingTime || 'N/A',
                row.visitingStatus,
                row.placeName,
                row.partyName,
                row.purpose || '-',
                row.remark || '-'
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `movement_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearDateFilters = () => {
        setDateFilter({ startDate: null, endDate: null });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center mb-4">
                    <FiClock size={20} className="mr-2" />
                    <h2 className="text-xl font-semibold">Movement History</h2>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {[...Array(8)].map((_, i) => (
                                    <th key={i} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <Skeleton variant="text" width={80} height={15} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(8)].map((_, j) => (
                                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                                            <Skeleton variant="text" width="80%" height={20} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-end px-4">
                <LogoutButton />
            </div>

            <div className="container mx-auto px-4 py-6">
                <ToastContainer position="top-right" autoClose={3000} />
                <div className="flex items-center mb-4">
                    <FiClock size={20} className="mr-2" />
                    <h2 className="text-xl font-semibold">Movement History</h2>
                </div>

                {movementData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        No movement data available for this user.
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Search by place, party, purpose..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Punch Status</option>
                                <option value="Punch In">Punch In</option>
                                <option value="Punch Out">Punch Out</option>
                            </select>

                            <div className="flex flex-col md:flex-row items-start md:items-center space-x-2">
                                <FiCalendar className="text-gray-400" />
                                <span className="text-sm text-gray-500">From:</span>
                                <DatePicker
                                    selected={dateFilter.startDate}
                                    onChange={(date) => setDateFilter({ ...dateFilter, startDate: date })}
                                    selectsStart
                                    startDate={dateFilter.startDate}
                                    endDate={dateFilter.endDate}
                                    placeholderText="Start date"
                                    dateFormat="dd MMM yyyy"
                                    isClearable
                                    className="px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <span className="text-sm text-gray-500">To:</span>
                                <DatePicker
                                    selected={dateFilter.endDate}
                                    onChange={(date) => setDateFilter({ ...dateFilter, endDate: date })}
                                    selectsEnd
                                    startDate={dateFilter.startDate}
                                    endDate={dateFilter.endDate}
                                    minDate={dateFilter.startDate}
                                    placeholderText="End date"
                                    dateFormat="dd MMM yyyy"
                                    isClearable
                                    className="px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {(dateFilter.startDate || dateFilter.endDate) && (
                                    <button
                                        onClick={clearDateFilters}
                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={downloadCSV}
                                disabled={filteredData.length === 0}
                                className={`flex items-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm ${filteredData.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                <FiDownload className="mr-2" />
                                Download CSV ({filteredData.length} records)
                            </button>
                        </div>

                        {filteredData.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                No movement data found matching your criteria.
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Punch Time
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Punch Status
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Visit Status
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
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Remarks
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentRows.map((mv) => (
                                                    <tr key={mv.movementID}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(mv.dateTime).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    type="time"
                                                                    name="punchingTime"
                                                                    value={editFormData.punchingTime}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                />
                                                            ) : (
                                                                mv.punchingTime
                                                                    ? new Date(`1970-01-01T${mv.punchingTime}`).toLocaleTimeString('en-US', {
                                                                        hour: 'numeric',
                                                                        minute: 'numeric',
                                                                        hour12: true,
                                                                    })
                                                                    : 'N/A'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {editRowId === mv.movementID ? (
                                                                <select
                                                                    name="punchTime"
                                                                    value={editFormData.punchTime}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="Punch In">Punch In</option>
                                                                    <option value="Punch Out">Punch Out</option>
                                                                </select>
                                                            ) : (
                                                                mv.punchTime || 'N/A'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    name="visitingStatus"
                                                                    type="text"
                                                                    value={editFormData.visitingStatus}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                />
                                                            ) : (
                                                                mv.visitingStatus
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    name="placeName"
                                                                    type="text"
                                                                    value={editFormData.placeName}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                />
                                                            ) : (
                                                                mv.placeName
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    name="partyName"
                                                                    type="text"
                                                                    value={editFormData.partyName}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                />
                                                            ) : (
                                                                mv.partyName
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    type="text"
                                                                    name="purpose"
                                                                    value={editFormData.purpose}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                />
                                                            ) : (
                                                                mv.purpose || '-'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    type="text"
                                                                    name="remark"
                                                                    value={editFormData.remark}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                />
                                                            ) : (
                                                                mv.remark || '-'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {(() => {
                                                                if (!mv.dateTime) return null;

                                                                const submittedTime = new Date(mv.dateTime);
                                                                const now = new Date();
                                                                const diffMinutes = (now - submittedTime) / 1000 / 60;

                                                                if (diffMinutes <= 10) {
                                                                    return editRowId === mv.movementID ? (
                                                                        <div className="flex space-x-1">
                                                                            <button
                                                                                onClick={handleSaveClick}
                                                                                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs flex items-center"
                                                                            >
                                                                                <FiSave className="mr-1" size={12} /> Save
                                                                            </button>
                                                                            <button
                                                                                onClick={handleCancelClick}
                                                                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleEditClick(mv)}
                                                                            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center"
                                                                        >
                                                                            <FiEdit className="mr-1" size={12} /> Edit
                                                                        </button>
                                                                    );
                                                                } else {
                                                                    return <span className="text-gray-500 font-semibold">Done</span>;
                                                                }
                                                            })()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 bg-white rounded-lg shadow">
                                    <div className="w-full md:w-auto mb-4 md:mb-0">
                                        <Select
                                            options={pageSizeOptions}
                                            onChange={(e) => setRowsPerPage(e.value)}
                                            value={pageSizeOptions.find(opt => opt.value === rowsPerPage)}
                                            placeholder="Rows per page"
                                            className="w-32"
                                            classNamePrefix="select"
                                            menuPlacement="auto"
                                        />
                                    </div>
                                    <div className="text-sm text-gray-700 mb-4 md:mb-0">
                                        Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredData.length)} of {filteredData.length} entries
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => paginate(1)}
                                            disabled={currentPage === 1}
                                            className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronsLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronLeft size={16} />
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
                                                    className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-2 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronRight size={16} />
                                        </button>
                                        <button
                                            onClick={() => paginate(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`px-2 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronsRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default UserReport;