import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './AquaPiAI.png';

// Card component for a clean, modular design
const FeatureCard = ({ to, title, description, icon }: { to: string, title: string, description: string, icon: string }) => (
    <Link
        to={to}
        className="relative group bg-white/60 border border-green-200/50 rounded-2xl p-6 text-center hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden backdrop-blur-sm"
    >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    </Link>
);

export default function Welcome() {
  return (
    <div className="relative min-h-screen bg-[#7F1727] text-gray-800 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[#f0f9f8] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute top-0 left-0 -z-10 h-1/2 w-full bg-gradient-to-b from-green-200/30 to-transparent"></div>

      <div className="text-center animate-fade-in-up">
        <img src={Logo} alt="AquaPi AI Logo" className="w-auto h-24 mx-auto mb-4" />
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-400 to-teal-300 mb-2">
          Welcome to AquaPi AI
        </h1>
        <p className="text-lg text-[#177F6F] mb-12">
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
      </div>

      <div className="absolute bottom-4 right-4 text-xs text-[#177F6F]">
        Version 25.8.18
      </div>
    </div>
  );
}