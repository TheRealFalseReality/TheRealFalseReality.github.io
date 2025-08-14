import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './logo-light.svg';

const AdminLoginModal = ({ onClose, onLogin }: { onClose: () => void, onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'TheFalseReality' && password === 'Maskell10625') {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-white">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Welcome() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    setShowAdminLogin(false);
    navigate('/compat');
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="text-center animate-fade-in-up">
        <img src={Logo} alt="AquaPi AI Logo" className="h-24 mx-auto mb-4" />
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-2">
          Welcome to AquaPi AI
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Your intelligent assistant for aquatic compatibility.
        </p>
        <Link
            to="/compat-ai"
            className="inline-block bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105"
        >
            Launch Compatibility Helper
        </Link>
      </div>

      <button
        onClick={() => setShowAdminLogin(true)}
        className="absolute bottom-4 left-4 bg-gray-700 text-white font-semibold px-4 py-2 text-sm rounded-full shadow-lg hover:bg-gray-600 transition transform hover:scale-105"
      >
        Admin: Compatibility Guide
      </button>

      {showAdminLogin && <AdminLoginModal onClose={() => setShowAdminLogin(false)} onLogin={handleAdminLogin} />}

      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        Version 25.8.17.4
      </div>
    </div>
  );
}
