import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
  Link,
} from "react-router";
import { useState, useEffect } from "react";

import type { Route } from "./+types/root";
import "./app.css";
import Logo from "./AquaPiAI.png";

// --- SVG Icons for Navigation ---
const HomeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CalculatorIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 14h.01M9 11h.01M12 11h.01M15 11h.01M5.85 18.15a2.49 2.49 0 002.49 2.49h7.32a2.49 2.49 0 002.49-2.49V5.85a2.49 2.49 0 00-2.49-2.49H8.34a2.49 2.49 0 00-2.49 2.49z" /></svg>;
const ChatbotIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const AboutIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const VolumeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 0a5 5 0 10-7.07 7.072 5 5 0 007.07-7.072z" /></svg>;
const BeakerIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.363-.844a2 2 0 01-1.524-1.99L14 4a2 2 0 00-2-2h-4a2 2 0 00-2 2v6.047a2 2 0 01-1.524 1.99l-2.363.844a2 2 0 00-1.022.547l-1.393 1.393a2 2 0 00-.547 1.022l-.844 2.363a2 2 0 00.547 2.53l1.393 1.393a2 2 0 001.022.547l2.363.844a2 2 0 011.524 1.99V20a2 2 0 002 2h4a2 2 0 002-2v-2.047a2 2 0 011.524-1.99l2.363-.844a2 2 0 001.022-.547l1.393-1.393a2 2 0 00.547-1.022l.844-2.363a2 2 0 00-.547-2.53l-1.393-1.393z" /></svg>;
const CollapseLeftIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>;
const CollapseRightIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>;
const SunIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" },
];

const SidebarContent = ({ isCollapsed, onLinkClick, theme, toggleTheme }: { isCollapsed: boolean, onLinkClick: () => void, theme: string, toggleTheme: () => void }) => {
  const navLinkClasses = "flex items-center px-4 py-3 text-[var(--text-dark)] rounded-lg hover:bg-[var(--accent-highlight)] transition-colors duration-200";
  const activeNavLinkClasses = "bg-white font-semibold";

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-center h-20 border-b transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
        <Link to="/" onClick={onLinkClick}>
          <img src={Logo} alt="AquaPi AI Logo" className={`w-auto transition-all duration-300 ${isCollapsed ? 'h-8' : 'h-12'}`} />
        </Link>
      </div>
      <nav className={`mt-4 flex-grow px-2 space-y-2`}>
        <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onLinkClick} end>
          <HomeIcon />
          {!isCollapsed && <span className="ml-3">Home</span>}
        </NavLink>
        <NavLink to="/compat-ai" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onLinkClick}>
          <CalculatorIcon />
          {!isCollapsed && <span className="ml-3">AI Calculator</span>}
        </NavLink>
        <NavLink to="/tank-volume" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onLinkClick}>
          <VolumeIcon />
          {!isCollapsed && <span className="ml-3">Tank Volume</span>}
        </NavLink>
        <NavLink to="/calculators" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onLinkClick}>
          <BeakerIcon />
          {!isCollapsed && <span className="ml-3">Calculators</span>}
        </NavLink>
        <NavLink to="/chatbot" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onLinkClick}>
          <ChatbotIcon />
          {!isCollapsed && <span className="ml-3">Chatbot</span>}
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onLinkClick}>
          <AboutIcon />
          {!isCollapsed && <span className="ml-3">About</span>}
        </NavLink>
      </nav>
      <div className="p-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center px-4 py-3 text-[var(--text-dark)] rounded-lg hover:bg-[var(--accent-highlight)] transition-colors duration-200"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          {!isCollapsed && <span className="ml-3">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>
      </div>
    </div>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const faviconPath = `${import.meta.env.BASE_URL}favicon.ico`;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  
  // Initialize state with a default value, NOT localStorage
  const [theme, setTheme] = useState('light');

  // This effect runs only on the client, after the initial render
  useEffect(() => {
    // Get the saved theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []); // The empty dependency array ensures this runs only once on mount

  // This effect runs whenever the theme state changes
  useEffect(() => {
    // Apply the theme to the document and save it to localStorage
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const toggleDesktopSidebar = () => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" href={faviconPath} />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5701077439648731"
          crossorigin="anonymous"> 
        </script>
      </head>
      <body>
        <div className="flex h-screen">
          {/* Sidebar for larger screens */}
          <aside className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'w-20' : 'w-64'}`} style={{ backgroundColor: 'var(--sidebar-bg)'}}>
            <div className="flex flex-col w-full relative">
              <SidebarContent isCollapsed={isDesktopSidebarCollapsed} onLinkClick={() => {}} theme={theme} toggleTheme={toggleTheme} />
              <button
                onClick={toggleDesktopSidebar}
                className="absolute -right-3 top-20 p-1.5 bg-white rounded-full shadow-md border border-[var(--border-color)] text-[var(--text-dark)] hover:bg-gray-100"
                title={isDesktopSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isDesktopSidebarCollapsed ? <CollapseRightIcon /> : <CollapseLeftIcon />}
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            {/* Mobile header */}
            <header className="md:hidden flex items-center justify-between px-4 py-2 border-b" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
                <button onClick={() => setIsMobileSidebarOpen(true)} className="text-[var(--text-dark)]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div className="flex-1 flex justify-center">
                  <Link to="/">
                    <img src={Logo} alt="AquaPi AI Logo" className="w-auto h-8" />
                  </Link>
                </div>
                <div className="w-6"></div> {/* Spacer to balance the hamburger icon */}
            </header>

            {/* Mobile sidebar */}
            <div className={`md:hidden fixed inset-0 z-40 transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black opacity-50 overlay-transition" onClick={closeMobileSidebar}></div>
                <aside className={`relative w-64 h-full sidebar-transition ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: 'var(--sidebar-bg)'}}>
                  <SidebarContent isCollapsed={false} onLinkClick={closeMobileSidebar} theme={theme} toggleTheme={toggleTheme} />
                </aside>
            </div>
            
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              {children}
            </main>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto text-gray-800">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}