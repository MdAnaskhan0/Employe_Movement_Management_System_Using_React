import React from 'react';
import Login from './Login';

const Home = () => {
  return (
    <div className="min-h-[80vh] bg-white flex">
      {/* Left Content - Text + Illustration */}
      <div className="hidden lg:flex w-1/2 bg-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to Our Platform</h1>
        </div>
        
        <div className="flex justify-center">
          <img 
            src="https://illustrations.popsy.co/amber/digital-nomad.svg" 
            alt="Collaboration illustration" 
            className="w-2/4 object-contain"
          />
        </div>
      </div>

      {/* Right Content - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>
          <Login />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Request access
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;