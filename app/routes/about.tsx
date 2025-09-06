import React, { useState, useEffect } from 'react';

// Feedback Modal
const FeedbackModal = ({ onClose }: { onClose: () => void }) => {
    const [isMobile, setIsMobile] = useState(false);
    const email = 'contactus@capitalcityaquatics.com';
    const subject = 'AquaPi AI Feedback';

    useEffect(() => {
        setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));
    }, []);

    const href = isMobile
      ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all animate-fade-in-down"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact & Feedback</h2>
                <p className="text-gray-600 mb-4">
                    AquaPi AI is proudly brought to you by{' '}
                    <a href="https://www.capitalcityaquatics.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-green-700 hover:underline inline-flex items-center justify-center">
                        <span>Capital City Aquatics</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                    </a>
                </p>
                <p className="text-gray-600 mb-4">
                    Click the button below to send us your feedback, bug reports, or questions.
                </p>
                <p className="text-gray-600 mb-4">
                    Alternatively, you can{' '}
                    <a href="https://github.com/TheRealFalseReality/TheRealFalseReality.github.io/issues" target="_blank" rel="noopener noreferrer" className="font-bold text-green-700 hover:underline">
                        create an issue on GitHub
                    </a>.
                </p>
                <div className="bg-gray-100 p-2 rounded-lg mb-6 border border-gray-200">
                     <p className="text-sm text-gray-500 mb-1">Our email address is:</p>
                    <span className="text-lg font-semibold text-green-700 break-all">
                        {email}
                    </span>
                </div>
                <a
                    href={href}
                    target={isMobile ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="inline-block w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90 transition shadow-lg transform hover:scale-105"
                >
                    {isMobile ? 'Open Email App' : 'Open Gmail'}
                </a>
            </div>
        </div>
    );
};

export default function About() {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-[var(--text-dark)] flex flex-col p-4 overflow-hidden water-bg">
        <main className="flex-grow flex flex-col items-center justify-center">
            <div className="text-center animate-fade-in-up py-4 sm:py-8">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--text-dark)] mb-2">
                    About Fish.AI
                </h1>
                <p className="text-lg text-gray-500 mb-12">
                    Your intelligent assistant for aquatic compatibility.
                </p>

                {/* Feedback button with new background */}
                <div className="mt-12 flex justify-center items-center space-x-4">
                    <button
                        onClick={() => setIsFeedbackModalOpen(true)}
                        className="bg-white text-gray-700 hover:text-black font-semibold py-2 px-5 border border-[var(--border-color)] rounded-full hover:bg-gray-50 transition duration-300 shadow"
                    >
                        Have feedback or questions? Contact us.
                    </button>
                    <a
                        href="https://github.com/TheRealFalseReality/TheRealFalseReality.github.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-gray-700 hover:text-black font-semibold py-2 px-5 border border-[var(--border-color)] rounded-full hover:bg-gray-50 transition duration-300 shadow"
                    >
                        View on Github
                    </a>
                </div>
            </div>
        </main>

      {/* Footer with version number, positioned safely */}
      <footer className="w-full flex-shrink-0 pt-2 sm:pt-4 flex justify-end">
          <span className="bg-white/50 text-xs text-[var(--text-light)] px-2 py-1 rounded-full">Version 25.9.1</span>
      </footer>

      {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}
    </div>
  );
}