import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme type
export type Theme = 'redi' | 'owl';

// Context type
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default to 'redi'
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('scribexx-theme');
    return (savedTheme as Theme) || 'redi';
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('scribexx-theme', theme);
    
    // Apply theme-specific classes to the document body
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-redi', 'theme-owl');
    
    // Add new theme class
    body.classList.add(`theme-${theme}`);
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'redi' ? '#121212' : '#1a2f23'
      );
    }
  }, [theme]);

  // Theme setter function
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Context value
  const value = { theme, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
