import React from 'react';
import UserAvatar from '../common/UserAvatar';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

type MainLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightButton?: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBackClick,
  rightButton
}) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  
  const isREDI = theme === 'redi';

  // Theme-specific classes
  const gradientClass = isREDI ? 'redi-gradient scanlines' : 'owl-gradient leaf-pattern';
  const headerGradientClass = isREDI ? 'redi-header-gradient' : 'owl-header-gradient';
  const fontClass = isREDI ? 'font-orbitron' : 'font-montserrat';

  return (
    <div className={`min-h-screen flex flex-col relative ${gradientClass}`}>
      {/* Header */}
      <header className={`${headerGradientClass} px-4 py-3 shadow-md relative z-10`}>
        <div className="flex justify-between items-center">
          {showBackButton ? (
            <button 
              onClick={onBackClick} 
              className="text-white flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </button>
          ) : (
            <div>
              <h1 className={`text-white text-xl font-bold ${fontClass}`}>{title}</h1>
              {subtitle && <p className="text-gray-200 text-xs">{subtitle}</p>}
            </div>
          )}
          
          {rightButton ? (
            rightButton
          ) : (
            <div className="flex items-center">
              <div className="mr-3 text-right">
                <p className="text-white text-sm">{currentUser?.displayName || 'User'}</p>
                <p className="text-gray-200 text-xs">
                  {isREDI ? 'Level 8' : 'Writer Level 5'}
                </p>
              </div>
              <UserAvatar theme={theme} />
            </div>
          )}
        </div>
        
        {/* Title if showing back button */}
        {showBackButton && (
          <div className="text-center mt-1">
            <h2 className={`text-white text-lg ${fontClass}`}>{title}</h2>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <div className="p-4 flex flex-col flex-grow">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
