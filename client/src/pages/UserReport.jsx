import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserReport = () => {
    const { user } = useContext(AuthContext);
    const { userID } = useParams();
    const navigate = useNavigate();

    const [movementData, setMovementData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [placeFilter, setPlaceFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMovementData();
    }, [user, userID]);

    const fetchMovementData = async () => {
        try {
            const response = await fetch(`http://localhost:5137/movementdata/${userID}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setMovementData(data);
            setFilteredData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        const dateObj = new Date(dateTimeString);
        const date = dateObj.toLocaleDateString();
        const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { date, time };
    };

    useEffect(() => {
        let data = [...movementData];

        if (searchTerm) {
            data = data.filter((item) =>
                Object.values(item).some((val) =>
                    val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (statusFilter) {
            data = data.filter((item) => item.visitingStatus === statusFilter);
        }

        if (placeFilter) {
            data = data.filter((item) => item.placeName === placeFilter);
        }

        if (dateFrom) {
            data = data.filter((item) => new Date(item.dateTime) >= new Date(dateFrom));
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // include the full day
            data = data.filter((item) => new Date(item.dateTime) <= toDate);
        }

        setFilteredData(data);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, placeFilter, dateFrom, dateTo, movementData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData.map(item => {
            const { date, time } = formatDateTime(item.dateTime);
            return {
                Date: date,
                Time: time,
                Punch: item.punchTime,
                Status: item.visitingStatus,
                Place: item.placeName || '-',
                Party: item.partyName || '-',
                Purpose: item.purpose || '-',
                Remark: item.remark || '-'
            };
        }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Movement Report');
        XLSX.writeFile(workbook, 'movement_report.xlsx');
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ['Date', 'Time', 'Punch', 'Status', 'Place', 'Party', 'Purpose', 'Remark'];
        const tableRows = filteredData.map(item => {
            const { date, time } = formatDateTime(item.dateTime);
            return [
                date,
                time,
                item.punchTime,
                item.visitingStatus,
                item.placeName || '-',
                item.partyName || '-',
                item.purpose || '-',
                item.remark || '-'
            ];
        });
        doc.autoTable({ head: [tableColumn], body: tableRows, styles: { fontSize: 8 } });
        doc.save('movement_report.pdf');
    };

    if (!user) return null;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="min-h-[75vh] p-4 md:p-8">
            <div className='flex flex-row items-center justify-between mb-4'>
                <h1 className="text-base md:text-2xl font-bold text-gray-800">
                    Movement Report: <span className='capitalize'>{user?.username}</span>
                </h1>
                <Link to={`/user-information/${userID}`} className="text-blue-600 font-base hover:underline text-sm md:text-base">
                    Back to Profile
                </Link>
            </div>

            <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-3 py-2">
                    <option value="">All Statuses</option>
                    {[...new Set(movementData.map(item => item.visitingStatus))].map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                <select value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)} className="border px-3 py-2">
                    <option value="">All Places</option>
                    {[...new Set(movementData.map(item => item.placeName))].map(place => (
                        <option key={place} value={place}>{place}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                />
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                />
                <button
                    onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('');
                        setPlaceFilter('');
                        setDateFrom('');
                        setDateTo('');
                    }}
                    className="px-4 py-2 bg-gray-200 rounded"
                >
                    Clear Filters
                </button>
            </div>

            <div className="overflow-x-auto shadow rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-2 px-4">Date</th>
                            <th className="py-2 px-4">Time</th>
                            <th className="py-2 px-4">Punch</th>
                            <th className="py-2 px-4">Status</th>
                            <th className="py-2 px-4">Place</th>
                            <th className="py-2 px-4">Party</th>
                            <th className="py-2 px-4">Purpose</th>
                            <th className="py-2 px-4">Remark</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 divide-y">
                        {paginatedData.map(item => {
                            const { date, time } = formatDateTime(item.dateTime);
                            return (
                                <tr key={item.movementID}>
                                    <td className="py-2 px-4">{date}</td>
                                    <td className="py-2 px-4">{time}</td>
                                    <td className="py-2 px-4">{item.punchTime}</td>
                                    <td className="py-2 px-4">{item.visitingStatus}</td>
                                    <td className="py-2 px-4">{item.placeName || '-'}</td>
                                    <td className="py-2 px-4">{item.partyName || '-'}</td>
                                    <td className="py-2 px-4">{item.purpose || '-'}</td>
                                    <td className="py-2 px-4">{item.remark || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0">
                <div className="space-x-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="px-3 py-1 bg-gray-300 rounded"
                        disabled={currentPage === 1}
                    >Previous</button>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className="px-3 py-1 bg-gray-300 rounded"
                        disabled={currentPage === totalPages}
                    >Next</button>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={handleDownloadExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >Download Excel</button>
                    <button
                        onClick={handleDownloadPDF}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >Download PDF</button>
                </div>
            </div>
        </div>
    );
};

export default UserReport;
