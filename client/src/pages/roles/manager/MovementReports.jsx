import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';

const MovementReports = () => {

    const [users, setUsers] = React.useState([]);
    const [movementReports, setMovementReports] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState('');
    const [selectedReport, setSelectedReport] = React.useState('');
    const baseUrl = import.meta.env.VITE_API_BASE_URL;


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${baseUrl}/users`);
                console.log(res.data.data);
                setUsers(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUsers();
    }, []);


    return (
        <>
            <div>
                <div>
                    <div>
                        <h1>Movement Reports</h1>
                    </div>
                    <div>
                        <select name="" id="">
                            <option value="">Select a user</option>
                            {
                                users.map((user) => (
                                    <option className='capitalize' key={user.userID} value={user.username}>{user.username}</option>
                                ))
                            }
                        </select>


                        From: <input type="date" />
                        To: <input type="date" />
                        <button>clear</button>
                        <button>Search</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MovementReports