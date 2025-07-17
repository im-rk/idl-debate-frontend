import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full px-6 py-8 text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-2">Page Not Found</h2>
          <p className="text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-300">
              <span className="text-red-400">Requested URL:</span> {location.pathname}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Home size={20} />
            <span>Go to Home</span>
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>Common pages you might be looking for:</p>
          <div className="mt-2 space-y-1">
            <button 
              onClick={() => navigate('/home')}
              className="block w-full text-left text-blue-400 hover:text-blue-300 transition-colors"
            >
              → Home
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="block w-full text-left text-blue-400 hover:text-blue-300 transition-colors"
            >
              → Dashboard
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="block w-full text-left text-blue-400 hover:text-blue-300 transition-colors"
            >
              → Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;