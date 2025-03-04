// Theme utility functions

import { Theme } from '@/context/ThemeContext';

// Get color scheme for current theme
export const getThemeColors = (theme: Theme) => {
  if (theme === 'redi') {
    return {
      primary: '#6320ee',
      secondary: '#1c77c3',
      accent: '#39ff14',
      background: '#121212',
      surface: '#1e1e1e',
      error: '#ff3864',
      gradient: {
        primary: 'linear-gradient(90deg, #6320ee 0%, #1c77c3 100%)',
        accent: 'linear-gradient(90deg, #39ff14 0%, #00ffdd 100%)',
      }
    };
  } else {
    return {
      primary: '#3cb371',
      secondary: '#588157',
      accent: '#ffd700',
      background: '#1a2f23',
      surface: '#2d4438',
      error: '#ff5a5f',
      gradient: {
        primary: 'linear-gradient(90deg, #3cb371 0%, #588157 100%)',
        accent: 'linear-gradient(90deg, #72efdd 0%, #64dfdf 100%)',
      }
    };
  }
};

// Get font family for current theme
export const getThemeFonts = (theme: Theme) => {
  if (theme === 'redi') {
    return {
      heading: "'Orbitron', sans-serif",
      body: "'Inter', sans-serif",
      accent: "'Share Tech Mono', monospace",
    };
  } else {
    return {
      heading: "'Montserrat', sans-serif",
      body: "'Inter', sans-serif",
      accent: "'Quicksand', sans-serif",
    };
  }
};

// Get CSS class prefix for current theme
export const getThemePrefix = (theme: Theme) => {
  return theme === 'redi' ? 'redi' : 'owl';
};

// Get dynamic classes for components based on theme
export const getDynamicClasses = (theme: Theme, componentType: string) => {
  const prefix = getThemePrefix(theme);
  
  switch (componentType) {
    case 'button':
      return {
        primary: theme === 'redi' 
          ? 'bg-[#6320ee] hover:bg-[#5618d9] text-white' 
          : 'bg-[#3cb371] hover:bg-[#35a065] text-white',
        secondary: theme === 'redi' 
          ? 'bg-transparent border border-[#39ff14] text-white hover:bg-[#39ff14]/10' 
          : 'bg-transparent border border-[#ffd700] text-white hover:bg-[#ffd700]/10',
        accent: theme === 'redi' 
          ? 'bg-[#39ff14] hover:bg-[#33e612] text-black' 
          : 'bg-[#ffd700] hover:bg-[#e6c200] text-black',
      };
    case 'card':
      return {
        base: theme === 'redi' 
          ? 'bg-[#1e1e1e] border-[#39ff14]' 
          : 'bg-[#2d4438] border-[#ffd700]',
      };
    default:
      return {};
  }
};
