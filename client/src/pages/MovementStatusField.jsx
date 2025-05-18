import React from 'react'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import MovementFields from '../components/MovementFields/MovementFields'
import { Link } from 'react-router-dom'

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
            <div>
                <div className='bg-white min-h-[75vh] flex flex-col md:flex-row items-center justify-center px-4'>
                    <div className='w-full md:w-1/3 p-4 md:p-8 bg-white rounded-xl shadow-md space-y-10 '>
                        <div className='flex flex-col md:flex-row items-center justify-center'>
                            <img src="https://www.w3schools.com/w3images/avatar1.png" alt="Avatar" className='w-35 h-auto rounded-full' />
                            <p className='text-gray-700 font-medium md:font-semibold text-sm md:text-base p-4 text-center'>Hello <span className='text-green-700 capitalize'>{user.username}</span> 👋</p>
                        </div>
                        <div className='text-center'>
                            <Link to={`/user-information/${user.userID}`} className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 w-full sm:w-auto text-center'>
                                Back to Profile
                            </Link>
                        </div>
                    </div>
                    <MovementFields />
                </div>
            </div>
        </>
    )
}

export default MovementStatusField