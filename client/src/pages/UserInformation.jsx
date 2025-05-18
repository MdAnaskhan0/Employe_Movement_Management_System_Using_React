
import React, { useContext, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserInformation = () => {
  const { user } = useContext(AuthContext);
  const { userID } = useParams();

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <p className="text-gray-700 text-xl">You need to be logged in to see this page.</p>
      </div>
    );
  }

  console.log('URL userID:', userID);
  console.log('Context userID:', user.userID);

  if (String(userID) !== String(user.userID)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <p className="text-red-600 text-xl">Access denied: User ID does not match.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[75vh] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-4xl p-8 md:p-12 rounded-2xl shadow-2xl space-y-10">

        {/* User Info Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

          {/* User Image */}
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl">
            <img src="https://www.w3schools.com/w3images/avatar1.png" alt="Avatar" className='w-32 h-32 rounded-full' />
          </div>

          {/* User Details */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">User Information</h1>
            <div className="mt-4 space-y-2">
              <p className="text-base text-gray-600">
                User Name: <span className="font-semibold text-gray-800">{user.username}</span>
              </p>
              <p className="text-base text-gray-600">
                Email: <span className="font-semibold text-gray-800">{user.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
          <Link to={`/movementstatusfield/${user.userID}`} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition duration-300 w-full sm:w-auto text-center">
            Movement Status
          </Link>
          <Link to={`/movementreport/${user.userID}`} className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-full border border-blue-600 transition duration-300 w-full sm:w-auto text-center">
            Movement Report
          </Link>

        </div>

      </div>
    </div>
  );
};

export default UserInformation;
