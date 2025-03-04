import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Tools: React.FC = () => {
  const { theme } = useTheme();
  
  const isREDI = theme === 'redi';
  
  // Theme-specific classes
  const cardBgClass = isREDI ? 'bg-[#1e1e1e]' : 'bg-[#2d4438]';
  const accentBgClass = isREDI 
    ? 'bg-gradient-to-r from-[#6320ee] to-[#1c77c3]' 
    : 'bg-gradient-to-r from-[#3cb371] to-[#588157]';
  const accentBorderClass = isREDI ? 'border-[#39ff14]' : 'border-[#ffd700]';
  const iconClass = isREDI ? 'text-[#39ff14]' : 'text-[#ffd700]';

  return (
    <MainLayout 
      title="Writing Tools" 
      subtitle="Resources to improve your writing"
    >
      <div className="space-y-4">
        {/* Writing Assistant */}
        <Card className={`${cardBgClass} shadow-lg border-none`}>
          <div className="p-4">
            <div className="flex items-center mb-3">
              <svg className={`w-5 h-5 mr-2 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              <h3 className="text-white text-md font-medium">Writing Assistant</h3>
            </div>
            
            <p className="text-gray-300 text-sm mb-3">
              Get help with brainstorming ideas, structuring your writing, and improving your language.
            </p>
            
            <Button className={`w-full ${accentBgClass} text-white`}>
              Open Assistant
            </Button>
          </div>
        </Card>
        
        {/* Grammar Reference */}
        <Card className={`${cardBgClass} shadow-lg border-none`}>
          <div className="p-4">
            <div className="flex items-center mb-3">
              <svg className={`w-5 h-5 mr-2 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <h3 className="text-white text-md font-medium">Grammar Reference</h3>
            </div>
            
            <p className="text-gray-300 text-sm mb-3">
              Access a comprehensive guide to grammar rules and writing mechanics.
            </p>
            
            <Button variant="outline" className={`w-full text-white border-${accentBorderClass}`}>
              View Reference
            </Button>
          </div>
        </Card>
        
        {/* Writing Templates */}
        <Card className={`${cardBgClass} shadow-lg border-none`}>
          <div className="p-4">
            <div className="flex items-center mb-3">
              <svg className={`w-5 h-5 mr-2 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
              </svg>
              <h3 className="text-white text-md font-medium">Writing Templates</h3>
            </div>
            
            <p className="text-gray-300 text-sm mb-3">
              Use pre-made templates for different writing styles and genres.
            </p>
            
            <Button variant="outline" className={`w-full text-white border-${accentBorderClass}`}>
              Browse Templates
            </Button>
          </div>
        </Card>
        
        {/* Vocabulary Builder */}
        <Card className={`${cardBgClass} shadow-lg border-none`}>
          <div className="p-4">
            <div className="flex items-center mb-3">
              <svg className={`w-5 h-5 mr-2 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              <h3 className="text-white text-md font-medium">Vocabulary Builder</h3>
            </div>
            
            <p className="text-gray-300 text-sm mb-3">
              Expand your vocabulary with interactive exercises and word lists.
            </p>
            
            <Button variant="outline" className={`w-full text-white border-${accentBorderClass}`}>
              Start Building
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Tools;
