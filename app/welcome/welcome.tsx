import { Link } from 'react-router-dom';
import Logo from './logo-light.svg';

export default function Welcome() {
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
            Launch AI Helper
        </Link>
      </div>

      <Link
        to="/compat"
        className="absolute bottom-4 left-4 bg-gray-700 text-white font-semibold px-4 py-2 text-sm rounded-full shadow-lg hover:bg-gray-600 transition transform hover:scale-105"
      >
        Admin: Compatibility Guide
      </Link>

      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        Version 25.8.11
      </div>
    </div>
  );
}
