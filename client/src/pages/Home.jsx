import React from 'react';
import Login from './Login';
import HomeVideo from '../assets/video/Home.mp4';
import { FaUserShield, FaLock, FaEnvelope, FaSignInAlt } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col lg:flex-row items-center justify-center p-4">
      {/* Toast notifications container */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Left Content - Text + Video (shown on all screens) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-12 mb-8 lg:mb-0">
        <div className="w-full max-w-full">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 text-center lg:text-left">
            Welcome to <span className="text-indigo-600">Fashion Group Ltd.</span>Employee Portal
          </h1>
          <p className="text-gray-400 mb-8 text-center lg:text-left">
            Monitor and optimize workforce movement with our dedicated tracking platform.
          </p>
          
          <div className="bg-white p-2 rounded-xl shadow-xl">
            <video 
              src={HomeVideo} 
              autoPlay 
              loop 
              muted 
              className="w-full h-auto rounded-lg object-cover shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Right Content - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 transition-all duration-300 hover:shadow-indigo-100 hover:shadow-lg">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
              <FaSignInAlt className="text-indigo-600 text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Sign in to your account</h2>
          </div>
          
          <Login />
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Request access
              </a>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              By continuing, you agree to our <a href="#" className="text-indigo-600">Terms</a> and <a href="#" className="text-indigo-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;