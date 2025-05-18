import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [value, setValue] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value: inputValue } = e.target;
    setValue((prevValue) => ({
      ...prevValue,
      [name]: inputValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5137/login', {
        username: value.username,
        password: value.password,
      });

      if (res.data.status === 'ok') {
        console.log('Login successful');
        navigate('/user-information');
      } else {
        alert(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Axios error:', err);
      alert(err.response?.data?.message || 'Error logging in');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75.5vh] md:min-h-[80vh] bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={value.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={value.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
          <div>
            <p className='text-sm text-gray-700'>Don't have an account? <Link to="/signup" className='text-blue-600 font-bold hover:underline'>Sign Up</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}
