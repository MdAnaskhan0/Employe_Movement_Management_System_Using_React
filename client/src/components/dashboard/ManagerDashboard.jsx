import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaExchangeAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const [users, setUsers] = useState([]);
  const [movements, setMovements] = useState([]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/users`);
        const resMovementReports = await axios.get(`${baseUrl}/get_all_movement`);
        setUsers(response.data.data);
        setMovements(resMovementReports.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchData();
  }, [baseUrl]);

  const cards = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <FaUsers size={20} />,
      color: 'bg-blue-500',
      action: () => navigate('/admin/users')
    },
    {
      title: 'Movement Reports',
      value: movements.length,
      icon: <FaExchangeAlt size={20} />,
      color: 'bg-green-500',
      action: () => navigate('/movement-reports')
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={card.action}
            className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition duration-300 border border-gray-100 group"
          >
            <div className='flex items-center justify-between'>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
              <div className='flex items-center'>
                <p className='text-sm text-gray-500'>View details</p>
                <IoIosArrowForward className="ml-1 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <h3 className="font-semibold text-gray-800">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerDashboard;