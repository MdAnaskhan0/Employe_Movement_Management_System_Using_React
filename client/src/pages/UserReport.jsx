import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Link } from 'react-router-dom';

const UserReport = () => {
    const { user } = useContext(AuthContext);
    const { userID } = useParams();
    const [movementData, setMovementData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        if (user) {
            fetchMovementData();
        }
    }, [user]);

    const fetchMovementData = async () => {
        try {
            const response = await fetch(`http://localhost:5137/movementdata/${userID}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setMovementData(data);
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

    const totalPages = Math.ceil(movementData.length / rowsPerPage);
    const paginatedData = movementData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleDownloadExcel = () => {
        const dataToExport = movementData.map(item => {
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
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "MovementReport");
        XLSX.writeFile(wb, "movement_report.xlsx");
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Date", "Time", "Punch", "Status", "Place", "Party", "Purpose", "Remark"];
        const tableRows = movementData.map(item => {
            const { date, time } = formatDateTime(item.dateTime);
            return [
                date,
                time,
                item.punchTime,
                item.visitingStatus,
                item.placeName || '-',
                item.partyName || '-',
                item.purpose || '-',
                item.remark || '-',
            ];
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 8 },
        });
        doc.save("movement_report.pdf");
    };

    if (!user) {
        return <div className="min-h-[75vh] flex items-center justify-center"><p className="text-xl">You need to be logged in to see this page.</p></div>;
    }

    if (loading) {
        return <div className="min-h-[75vh] flex items-center justify-center"><p className="text-xl">Loading...</p></div>;
    }

    if (error) {
        return <div className="min-h-[75vh] flex items-center justify-center"><p className="text-red-500 text-xl">Error: {error}</p></div>;
    }

    if (movementData.length === 0) {
        return <div className="min-h-[75vh] flex items-center justify-center"><p className="text-xl">No movement data found.</p></div>;
    }

    return (
        <div className="min-h-[75vh] p-4 md:p-8">
            <div className='flex flex-row items-center justify-between mb-4'>
                <h1 className="text-base md:text-2xl font-bold text-gray-800">Movement Report: <span className='capitalize'>{user.username}</span></h1>
                <Link to={`/user-information/${user.userID}`} className="text-blue-600 font-base hover:underline text-sm md:text-base">Back to Profile</Link>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left">Date</th>
                            <th className="py-3 px-4 text-left">Time</th>
                            <th className="py-3 px-4 text-left">Punch</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Place</th>
                            <th className="py-3 px-4 text-left">Party</th>
                            <th className="py-3 px-4 text-left">Purpose</th>
                            <th className="py-3 px-4 text-left">Remark</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {paginatedData.map((item) => {
                            const { date, time } = formatDateTime(item.dateTime);
                            return (
                                <tr key={item.movementID} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">{date}</td>
                                    <td className="py-3 px-4">{time}</td>
                                    <td className="py-3 px-4">{item.punchTime}</td>
                                    <td className="py-3 px-4">{item.visitingStatus}</td>
                                    <td className="py-3 px-4">{item.placeName || '-'}</td>
                                    <td className="py-3 px-4">{item.partyName || '-'}</td>
                                    <td className="py-3 px-4">{item.purpose || '-'}</td>
                                    <td className="py-3 px-4">{item.remark || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <button
                            className="px-4 py-2 bg-gray-200 rounded mr-2 disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                    </div>
                </div>

                {/* Download Buttons */}
                <div className="mt-6 flex gap-4">
                    <button onClick={handleDownloadExcel} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Download Excel
                    </button>
                    <button onClick={handleDownloadPDF} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Mobile View stays the same */}
            <div className="md:hidden space-y-4">
                {paginatedData.map((item) => {
                    const { date, time } = formatDateTime(item.dateTime);
                    return (
                        <div key={item.movementID} className="bg-white p-4 rounded-lg shadow">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div><p className="text-sm text-gray-500">Date</p><p>{date}</p></div>
                                <div><p className="text-sm text-gray-500">Time</p><p>{time}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div><p className="text-sm text-gray-500">Punch</p><p>{item.punchTime}</p></div>
                                <div><p className="text-sm text-gray-500">Status</p><p>{item.visitingStatus}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div><p className="text-sm text-gray-500">Place</p><p>{item.placeName || '-'}</p></div>
                                <div><p className="text-sm text-gray-500">Party</p><p>{item.partyName || '-'}</p></div>
                            </div>
                            <div className="mb-2"><p className="text-sm text-gray-500">Purpose</p><p>{item.purpose || '-'}</p></div>
                            <div><p className="text-sm text-gray-500">Remark</p><p>{item.remark || '-'}</p></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserReport;
