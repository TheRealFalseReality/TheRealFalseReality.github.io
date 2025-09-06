import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './AquaPiAI.png';
import AdComponent from './AdComponent'; // 1. Import the component

// Card component for a clean, modular design
const FeatureCard = ({ to, title, description, icon }: { to: string, title: string, description: string, icon: string }) => (
    <Link
        to={to}
        className="relative group bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 text-center hover:bg-white transition-all duration-300 transform hover:-translate-y-1 overflow-hidden shadow-lg hover:shadow-xl"
    >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-[var(--text-dark)] mb-2">{title}</h3>
            <p className="text-[var(--text-light)] text-sm">{description}</p>
        </div>
    </Link>
);


export default function Welcome() {
  return (
    <div className="relative min-h-screen flex flex-col p-4 overflow-hidden water-bg">
      {/* Main content area */}
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center animate-fade-in-up py-4 sm:py-8">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--text-dark)] mb-2">
              Welcome to Fish.AI
            </h1>
            <p className="text-md text-gray-500 mb-4">
              powered by:
            </p>
            <img src={Logo} alt="AquaPi AI Logo" className="w-auto h-36 mx-auto mb-4" />
            <p className="text-lg text-gray-500 mb-12">
              Your intelligent assistant for aquatic compatibility.
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <FeatureCard
                    to="/compat-ai"
                    title="AI Compatibility Calculator"
                    description="Select your fish and get a detailed, AI-powered compatibility report with care guides and tank recommendations."
                    icon="🐠"
                />
                <FeatureCard
                    to="/chatbot"
                    title="AI Chatbot"
                    description="Ask questions, get water parameter analysis, and generate automation scripts with our intelligent chatbot."
                    icon="🤖"
                />
            </div>              
          <div className="mt-12 w-full max-w-4xl mx-auto">
              <AdComponent />
          </div>
        </div>
      </main>
    </div>
  );
}