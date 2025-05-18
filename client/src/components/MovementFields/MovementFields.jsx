import React, { useState, useContext } from 'react';
import places from '../../assets/Json/Places.json';
import partyNames from '../../assets/Json/partyname.json';
import { AuthContext } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';

function MovementFields() {
    const { user } = useContext(AuthContext);
    const { userID } = useParams();

    if (!user) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center">
                <p className="text-gray-700 text-xl">You need to be logged in to see this page.</p>
            </div>
        );
    }

    const [formData, setFormData] = useState({
        punchTime: '',
        visitingStatus: '',
        place: '',
        partyName: '',
        purpose: '',
        remark: '',
    });

    const [placeSuggestions, setPlaceSuggestions] = useState([]);
    const [partyNameSuggestions, setPartyNameSuggestions] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === 'place') {
            if (value.length > 0) {
                const filtered = places.filter((p) =>
                    p.toLowerCase().includes(value.toLowerCase())
                );
                setPlaceSuggestions(filtered.slice(0, 5));
            } else {
                setPlaceSuggestions([]);
            }
        }

        if (name === 'partyName') {
            if (value.length > 0) {
                const filtered = partyNames.filter((p) =>
                    p.toLowerCase().includes(value.toLowerCase())
                );
                setPartyNameSuggestions(filtered.slice(0, 5));
            } else {
                setPartyNameSuggestions([]);
            }
        }
    };

    const handlePlaceSelect = (value) => {
        setFormData((prev) => ({ ...prev, place: value }));
        setPlaceSuggestions([]);
    };

    const handlePartyNameSelect = (value) => {
        setFormData((prev) => ({ ...prev, partyName: value }));
        setPartyNameSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const movementData = {
            userID: user.userID,
            username: user.username,
            punchTime: formData.punchTime,
            visitingStatus: formData.visitingStatus,
            placeName: formData.place,
            partyName: formData.partyName,
            purpose: formData.purpose,
            remark: formData.remark,
        };

        try {
            const response = await fetch('http://localhost:5137/movementdata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movementData),
            });

            if (!response.ok) {
                throw new Error('Failed to save movement data');
            }

            alert('Movement data saved successfully!');
            setFormData({
                punchTime: '',
                visitingStatus: '',
                place: '',
                partyName: '',
                purpose: '',
                remark: '',
            });
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error saving the data. Please try again.');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-md space-y-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-1">Movement Entry Form</h2>

                {/* Grid container: 3 columns on md+, 1 column on small */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Punch Time */}
                    <div>
                        <label htmlFor="punchTime" className="block text-sm font-medium text-gray-700 mb-1">Punch Time</label>
                        <select
                            id="punchTime"
                            name="punchTime"
                            value={formData.punchTime}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            <option value="" disabled>Select Status</option>
                            <option value="Punch In">Punch In</option>
                            <option value="Punch Out">Punch Out</option>
                        </select>
                    </div>

                    {/* Visiting Status */}
                    <div>
                        <label htmlFor="visitingStatus" className="block text-sm font-medium text-gray-700 mb-1">Visiting Status</label>
                        <select
                            id="visitingStatus"
                            name="visitingStatus"
                            value={formData.visitingStatus}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            <option value="" disabled>Select Status</option>
                            <option value="Office in Sclera">Office in Sclera</option>
                            <option value="Office in HQ">Office in HQ</option>
                            <option value="Field">Field</option>
                        </select>
                    </div>

                    {/* Place */}
                    <div className="relative">
                        <label htmlFor="place" className="block text-sm font-medium text-gray-700 mb-1">Place</label>
                        <input
                            id="place"
                            type="text"
                            name="place"
                            value={formData.place}
                            onChange={handleChange}
                            autoComplete="off"
                            placeholder="Start typing place..."
                            className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        {placeSuggestions.length > 0 && (
                            <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-36 overflow-y-auto shadow-md text-gray-900 text-sm">
                                {placeSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handlePlaceSelect(suggestion)}
                                        className="px-3 py-1 cursor-pointer hover:bg-blue-100 transition"
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Next row of 3 fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Party Name */}
                    <div className="relative">
                        <label htmlFor="partyName" className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
                        <input
                            id="partyName"
                            type="text"
                            name="partyName"
                            value={formData.partyName}
                            onChange={handleChange}
                            autoComplete="off"
                            placeholder="Start typing party name..."
                            className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        {partyNameSuggestions.length > 0 && (
                            <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-36 overflow-y-auto shadow-md text-gray-900 text-sm">
                                {partyNameSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handlePartyNameSelect(suggestion)}
                                        className="px-3 py-1 cursor-pointer hover:bg-blue-100 transition"
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Purpose */}
                    <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                        <input
                            id="purpose"
                            type="text"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleChange}
                            placeholder="Enter purpose"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Remark */}
                    <div>
                        <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                        <textarea
                            id="remark"
                            name="remark"
                            value={formData.remark}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Additional remarks..."
                            className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition duration-200"
                >
                    Submit
                </button>
            </form>

        </>
    );
}

export default MovementFields;
