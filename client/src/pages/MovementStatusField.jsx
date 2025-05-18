import React from 'react'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import MovementFields from '../components/MovementFields/MovementFields'

const MovementStatusField = () => {
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
            <div className='bg-white min-h-[75vh] flex flex-col md:flex-row items-center justify-center px-4'>
                <p className='text-gray-700 font-medium md:font-bold text-sm md:text-base p-4 text-center'>Hello <span className='text-green-700 capitalize'>{user.username}</span> 👋 <br /> Please fill in the form and submit your movement data.</p>
                <MovementFields />
            </div>
        </>
    )
}

export default MovementStatusField