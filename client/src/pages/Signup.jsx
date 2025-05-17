import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
    const navigate = useNavigate();
    const [value, setValue] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { name, value: inputValue } = e.target;
        setValue((prevValue) => ({
            ...prevValue,
            [name]: inputValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password, confirmPassword } = value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const res = await axios.post('http://localhost:5137/users', {
                username,
                email,
                password,
            });

            console.log(res.data);
            if (res.data.status === 'ok') {
                alert('User created successfully');
                navigate('/');
            }
        } catch (err) {
            console.error('Axios error:', err);
            alert(err.response?.data?.message || 'Error creating user');
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={value.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={value.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={value.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={value.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}
