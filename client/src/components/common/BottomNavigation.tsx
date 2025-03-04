import React from 'react';
import { useLocation, Link } from 'wouter';
import { useTheme } from '@/context/ThemeContext';

const BottomNavigation: React.FC = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  // Check if the current route is active
  const isActive = (path: string) => {
    if (path === '/redi' && (location === '/' || location.startsWith('/redi'))) {
      return true;
    }
    if (path === '/owl' && location.startsWith('/owl')) {
      return true;
    }
    return location === path;
  };
  
  // Theme-specific colors
  const activeColor = theme === 'redi' ? 'text-[#6320ee]' : 'text-[#3cb371]';
  const inactiveColor = 'text-gray-500';
  
  // Handle REDI navigation (switches theme)
  const handleREDIClick = () => {
    setTheme('redi');
  };
  
  // Handle OWL navigation (switches theme)
  const handleOWLClick = () => {
    setTheme('owl');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-20">
      <div className="flex justify-around items-center">
        <Link href="/redi">
          <a 
            className="flex flex-col items-center px-3 py-1 rounded-lg"
            onClick={handleREDIClick}
          >
            <svg 
              className={`w-6 h-6 ${isActive('/redi') ? activeColor : inactiveColor}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
            <span className="text-xs text-gray-600 mt-1">REDI</span>
          </a>
        </Link>
        
        <Link href="/owl">
          <a 
            className="flex flex-col items-center px-3 py-1 rounded-lg"
            onClick={handleOWLClick}
          >
            <svg 
              className={`w-6 h-6 ${isActive('/owl') ? activeColor : inactiveColor}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
            <span className="text-xs text-gray-600 mt-1">OWL</span>
          </a>
        </Link>
        
        <Link href="/tools">
          <a className="flex flex-col items-center px-3 py-1 rounded-lg">
            <svg 
              className={`w-6 h-6 ${isActive('/tools') ? activeColor : inactiveColor}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              ></path>
            </svg>
            <span className="text-xs text-gray-600 mt-1">Tools</span>
          </a>
        </Link>
        
        <Link href="/achievements">
          <a className="flex flex-col items-center px-3 py-1 rounded-lg">
            <svg 
              className={`w-6 h-6 ${isActive('/achievements') ? activeColor : inactiveColor}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              ></path>
            </svg>
            <span className="text-xs text-gray-600 mt-1">Awards</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className="flex flex-col items-center px-3 py-1 rounded-lg">
            <svg 
              className={`w-6 h-6 ${isActive('/profile') ? activeColor : inactiveColor}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            <span className="text-xs text-gray-600 mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
