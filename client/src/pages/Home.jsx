import React from 'react';
import hero_image from '../assets/Home_hero.jpg';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center px-6 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl w-full">

        {/* Left Content - Text + Buttons */}
        <div className="w-full md:w-1/2 px-4 md:px-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 leading-snug">
            Welcome to <span className="text-red-600">Fashion Group Ltd.</span>
          </h1>
          <p className="mt-4 text-gray-600 text-base leading-relaxed">
            Empower your organization with a streamlined employee movement management system.
            Monitor, track, and manage your workforce efficiently using our intuitive platform.
          </p>
          <div className="mt-6 flex gap-4">
            <Link to="/login">
              <button className="bg-green-700 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-white hover:bg-green-700 text-red-600 border border-red-600 font-semibold py-2 px-6 hover:text-white hover:border-green-700 rounded-full transition duration-300">
                Sign Up
              </button>
            </Link>
          </div>
        </div>

        {/* Right Content - Image */}
        <div className="w-full md:w-1/2 mt-10 md:mt-0 px-4 md:px-8 flex justify-center">
          <img
            src={hero_image}
            alt="Employee"
            className="w-full max-w-md rounded-xl shadow-md"
          />
        </div>

      </div>
    </div>
  );
};

export default Home;
