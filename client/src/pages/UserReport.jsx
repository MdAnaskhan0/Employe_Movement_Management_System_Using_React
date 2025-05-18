import React from 'react'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const UserReport = () => {
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
  return (
    <>
      <p>User Report: {user.username}</p>
    </>
  )
}

export default UserReport