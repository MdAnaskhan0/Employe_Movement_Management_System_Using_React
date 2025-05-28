import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { FiClock, FiMapPin, FiBriefcase, FiFileText, FiEdit2, FiSend } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlaceNames from '../../../assets/Json/Places.json';

const UploadReportUser = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    userID: '',
    username: '',
    punchTime: '',
    punchingTime: '',
    visitingStatus: '',
    placeName: '',
    partyName: '',
    purpose: '',
    remark: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitingStatuses, setVisitingStatuses] = useState([]);
  const [partyNames, setPartyNames] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userID: user.userID,
        username: user.username
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitRes, partyRes] = await Promise.all([
          axios.get(`${baseUrl}/visitingstatus`),
          axios.get(`${baseUrl}/partynames`),
        ]);

        setVisitingStatuses(visitRes.data);
        setPartyNames(partyRes.data.map(p => p.partyname)); // Extract only names
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load dropdown data', {
          position: "top-right",
          className: 'bg-rose-100 text-rose-800'
        });
      }
    };

    fetchData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'placeName') {
      const matches = PlaceNames.filter(place =>
        place.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPlaces(matches);
    }

    if (name === 'partyName') {
      const matches = partyNames.filter(party =>
        party.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredParties(matches);
    }
  };

  const handleSelectSuggestion = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'placeName') setFilteredPlaces([]);
    if (name === 'partyName') setFilteredParties([]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${baseUrl}/add_movement`, formData);

      if (res.status === 201) {
        toast.success('Movement recorded successfully!', {
          position: "top-right",
          className: 'bg-emerald-100 text-emerald-800'
        });
        setFormData(prev => ({
          ...prev,
          punchTime: '',
          punchingTime: '',
          visitingStatus: '',
          placeName: '',
          partyName: '',
          purpose: '',
          remark: '',
        }));
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Submission failed', {
        position: "top-right",
        className: 'bg-rose-100 text-rose-800'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-gray-500">Loading user data...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-5 px-6">
            <h2 className="text-lg md:text-2xl font-semibold text-white flex items-center space-x-3">
              <FiClock className="text-white" />
              <span>Movement Status Report</span>
            </h2>
            <p className="text-sm text-teal-100 mt-1">Record your daily movements and visits</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Punch Status */}
              <div className="space-y-1">
                <label htmlFor="punchTime" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiClock className="mr-2 text-emerald-600" />
                  Punch Status
                </label>
                <select
                  id="punchTime"
                  name="punchTime"
                  value={formData.punchTime}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                >
                  <option value="">Select Status</option>
                  <option value="Punch In">Punch In</option>
                  <option value="Punch Out">Punch Out</option>
                </select>
              </div>

              {/* Punching Time */}
              <div className="space-y-1">
                <label htmlFor="punchingTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Punching Time
                </label>
                <input
                  type="time"
                  id="punchingTime"
                  name="punchingTime"
                  value={formData.punchingTime}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>

              {/* Visiting Status */}
              <div className="space-y-1">
                <label htmlFor="visitingStatus" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiMapPin className="mr-2 text-emerald-600" />
                  Visiting Status
                </label>
                <select
                  id="visitingStatus"
                  name="visitingStatus"
                  value={formData.visitingStatus}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                >
                  <option value="">Select Status</option>
                  {visitingStatuses.map(status => (
                    <option key={status.visitingstatusID} value={status.visitingstatusname}>
                      {status.visitingstatusname}
                    </option>
                  ))}
                </select>
              </div>

              {/* Place Name with Suggestions */}
              <div className="relative">
                <label htmlFor="placeName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiMapPin className="mr-2 text-emerald-600" />
                  Place Name
                </label>
                <input
                  id="placeName"
                  name="placeName"
                  value={formData.placeName}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className="mt-1 block w-full pl-3 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
                {filteredPlaces.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-lg max-h-40 overflow-y-auto shadow-lg">
                    {filteredPlaces.map((place, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 hover:bg-emerald-100 cursor-pointer text-sm"
                        onClick={() => handleSelectSuggestion('placeName', place)}
                      >
                        {place}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Party Name with Suggestions */}
              <div className="relative">
                <label htmlFor="partyName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiBriefcase className="mr-2 text-emerald-600" />
                  Party Name
                </label>
                <input
                  id="partyName"
                  name="partyName"
                  value={formData.partyName}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className="mt-1 block w-full pl-3 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
                {filteredParties.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-lg max-h-40 overflow-y-auto shadow-lg">
                    {filteredParties.map((party, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 hover:bg-emerald-100 cursor-pointer text-sm"
                        onClick={() => handleSelectSuggestion('partyName', party)}
                      >
                        {party}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Purpose */}
              <div className="space-y-1">
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiFileText className="mr-2 text-emerald-600" />
                  Purpose
                </label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-1">
              <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiEdit2 className="mr-2 text-emerald-600" />
                Remarks
              </label>
              <textarea
                id="remark"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                rows="4"
                placeholder="Additional notes..."
              ></textarea>
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                <FiSend className="mr-2" />
                {isSubmitting ? 'Processing...' : 'Submit Report'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>

      <ToastContainer />
    </div>
  );
};

export default UploadReportUser;
