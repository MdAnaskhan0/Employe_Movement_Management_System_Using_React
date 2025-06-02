import React from 'react';

const ProfileProgress = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${value === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
        style={{ width: `${value}%` }}
      ></div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Profile Complete</span>
        <span>{value}%</span>
      </div>
    </div>
  );
};

export default ProfileProgress;