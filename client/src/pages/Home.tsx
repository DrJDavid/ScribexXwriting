import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/context/ThemeContext';
import { Loader, Sparkles, Leaf, PenTool, FileText, LayoutDashboard, Trophy } from 'lucide-react';
import { DailyWritingStreak } from '@/components/home/DailyWritingStreak';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Redirect users based on their role
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'teacher':
          navigate('/teacher');
          break;
        case 'parent':
          navigate('/parent');
          break;
        // Student remains on home page
        default:
          // No redirect needed
          break;
      }
    }
  }, [user, navigate]);
  
  // Fetch user progress for streak data
  const { data: progressData } = useQuery<{
    currentStreak?: number;
    longestStreak?: number;
    dailyChallengeCompleted?: boolean;
    lastWritingDate?: string;
  }>({
    queryKey: ['/api/progress'],
    enabled: !!user
  });

  // Apply theme-specific background effects
  useEffect(() => {
    // Add the theme-specific class to the body when the component mounts
    document.body.className = theme === 'redi' 
      ? 'bg-gradient-to-b from-violet-950 to-indigo-950' 
      : 'bg-gradient-to-b from-teal-950 to-emerald-950';
    
    // Clean up when component unmounts
    return () => {
      document.body.className = '';
    };
  }, [theme]);

  // Show loading while fetching user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleThemeToggle = (newTheme: 'redi' | 'owl') => {
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen pt-4 pb-16 px-4 relative">
      {/* Theme-specific decorative elements */}
      {theme === 'redi' && (
        <>
          <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-indigo-950/30 pointer-events-none z-0"></div>
          <div className="fixed top-20 left-10 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}
      
      {theme === 'owl' && (
        <>
          <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-teal-950/30 pointer-events-none z-0"></div>
          <div className="fixed top-20 right-10 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-10 left-10 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col space-y-6">
          {/* Welcome section with theme toggler */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm ${
              theme === 'redi' 
                ? 'bg-gradient-to-br from-violet-900/80 to-indigo-950/80 border border-violet-700/50' 
                : 'bg-gradient-to-br from-emerald-900/80 to-teal-950/80 border border-emerald-700/50'
            }`}
          >
            <div className="p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <h1 className={`text-3xl font-bold mb-2 ${
                    theme === 'redi' ? 'text-violet-50' : 'text-emerald-50 font-botanical'
                  }`}>
                    Welcome, {user?.displayName || user?.username || 'Writer'}
                  </h1>
                  <p className={`opacity-80 ${
                    theme === 'redi' ? 'text-violet-200' : 'text-emerald-200'
                  }`}>
                    Continue your writing journey or try something new today
                  </p>
                </div>
                
                {/* Theme Toggle */}
                <div className={`rounded-xl overflow-hidden p-1 flex ${
                  theme === 'redi' 
                    ? 'bg-violet-900/50 border border-violet-700/30' 
                    : 'bg-emerald-900/50 border border-emerald-700/30'
                }`}>
                  <Button 
                    variant="ghost"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      theme === 'redi' 
                        ? 'bg-violet-800 text-violet-50 shadow-md' 
                        : 'bg-transparent text-emerald-300 hover:text-emerald-100'
                    }`}
                    onClick={() => handleThemeToggle('redi')}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">Synthwave</span>
                  </Button>
                  <Button 
                    variant="ghost"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      theme === 'owl' 
                        ? 'bg-emerald-800 text-emerald-50 shadow-md' 
                        : 'bg-transparent text-violet-300 hover:text-violet-100'
                    }`}
                    onClick={() => handleThemeToggle('owl')}
                  >
                    <Leaf className="h-4 w-4" />
                    <span className="text-sm font-medium">Botanical</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* REDI System Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => navigate('/redi')}
              className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm ${
                theme === 'redi'
                  ? 'bg-gradient-to-br from-violet-900/80 to-indigo-950/80 border border-violet-700/50 hover:border-violet-600/80 hover:shadow-violet-900/30 hover:shadow-xl'
                  : 'bg-gradient-to-br from-violet-900/80 to-indigo-950/80 border border-violet-700/50 hover:border-violet-600/80 hover:shadow-violet-900/30 hover:shadow-xl'
              }`}
            >
              <div className="p-8">
                <div className="flex items-start mb-4">
                  <div className={`p-3 rounded-xl mr-4 ${
                    theme === 'redi' 
                      ? 'bg-gradient-to-br from-violet-800 to-purple-900 shadow-glow-sm' 
                      : 'bg-gradient-to-br from-violet-800 to-purple-900 shadow-glow-sm'
                  }`}>
                    <PenTool className="h-8 w-8 text-violet-100" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold mb-1 group-hover:translate-x-1 transition-transform ${
                      theme === 'redi' ? 'text-violet-50' : 'text-violet-50'
                    }`}>
                      REDI System
                    </h2>
                    <p className={`${
                      theme === 'redi' ? 'text-violet-200/80' : 'text-violet-200/80'
                    }`}>
                      Structured Writing Exercises
                    </p>
                  </div>
                </div>
                <p className={`mb-6 ${
                  theme === 'redi' ? 'text-violet-200/70' : 'text-violet-200/70'
                }`}>
                  Master fundamental writing skills through focused exercises that build mechanics, sequencing, and voice
                </p>
                <div className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    className="text-violet-100 bg-violet-800/50 hover:bg-violet-700/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/redi');
                    }}
                  >
                    Start Exercises
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* OWL World Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => navigate('/owl')}
              className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm ${
                theme === 'redi'
                  ? 'bg-gradient-to-br from-emerald-900/80 to-teal-950/80 border border-emerald-700/50 hover:border-emerald-600/80 hover:shadow-emerald-900/30 hover:shadow-xl'
                  : 'bg-gradient-to-br from-emerald-900/80 to-teal-950/80 border border-emerald-700/50 hover:border-emerald-600/80 hover:shadow-emerald-900/30 hover:shadow-xl'
              }`}
            >
              <div className="p-8">
                <div className="flex items-start mb-4">
                  <div className={`p-3 rounded-xl mr-4 ${
                    theme === 'redi' 
                      ? 'bg-gradient-to-br from-emerald-800 to-teal-900 shadow-glow-sm' 
                      : 'bg-gradient-to-br from-emerald-800 to-teal-900 shadow-glow-sm'
                  }`}>
                    <Leaf className="h-8 w-8 text-emerald-100" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold mb-1 group-hover:translate-x-1 transition-transform ${
                      theme === 'redi' ? 'text-emerald-50' : 'text-emerald-50 font-botanical'
                    }`}>
                      OWL Town
                    </h2>
                    <p className={`${
                      theme === 'redi' ? 'text-emerald-200/80' : 'text-emerald-200/80'
                    }`}>
                      Creative Writing Experience
                    </p>
                  </div>
                </div>
                <p className={`mb-6 ${
                  theme === 'redi' ? 'text-emerald-200/70' : 'text-emerald-200/70'
                }`}>
                  Explore a vibrant world of writing quests, receive AI feedback, and unlock new creative locations
                </p>
                <div className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    className="text-emerald-100 bg-emerald-800/50 hover:bg-emerald-700/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/owl');
                    }}
                  >
                    Explore Town
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Daily Writing Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full"
          >
            <DailyWritingStreak 
              currentStreak={progressData?.currentStreak || 0}
              longestStreak={progressData?.longestStreak || 0}
              isChallengeCompleted={progressData?.dailyChallengeCompleted || false}
              lastWritingDate={progressData?.lastWritingDate ? new Date(progressData.lastWritingDate).toISOString() : null}
            />
          </motion.div>

          {/* Shortcuts Row - Now with 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Submissions shortcut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={() => navigate('/writing/submissions')}
              className={`group cursor-pointer rounded-xl overflow-hidden shadow-md backdrop-blur-sm ${
                theme === 'redi'
                  ? 'bg-gradient-to-br from-indigo-900/80 to-indigo-950/80 border border-indigo-700/50 hover:border-indigo-500/70 hover:shadow-indigo-900/20 hover:shadow-lg'
                  : 'bg-gradient-to-br from-teal-900/80 to-teal-950/80 border border-teal-700/50 hover:border-teal-500/70 hover:shadow-teal-900/20 hover:shadow-lg'
              }`}
            >
              <div className="p-4 flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  theme === 'redi' 
                    ? 'bg-indigo-800/80' 
                    : 'bg-teal-800/80'
                }`}>
                  <FileText className={`h-5 w-5 ${
                    theme === 'redi' ? 'text-indigo-100' : 'text-teal-100'
                  }`} />
                </div>
                <div className="flex-grow">
                  <h3 className={`text-base font-medium group-hover:translate-x-1 transition-transform ${
                    theme === 'redi' ? 'text-indigo-50' : 'text-teal-50'
                  }`}>
                    My Submissions
                  </h3>
                  <p className={`text-xs ${
                    theme === 'redi' ? 'text-indigo-200/70' : 'text-teal-200/70'
                  }`}>
                    View your writing history
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Achievements shortcut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={() => navigate('/achievements')}
              className={`group cursor-pointer rounded-xl overflow-hidden shadow-md backdrop-blur-sm ${
                theme === 'redi'
                  ? 'bg-gradient-to-br from-indigo-900/80 to-indigo-950/80 border border-indigo-700/50 hover:border-indigo-500/70 hover:shadow-indigo-900/20 hover:shadow-lg'
                  : 'bg-gradient-to-br from-teal-900/80 to-teal-950/80 border border-teal-700/50 hover:border-teal-500/70 hover:shadow-teal-900/20 hover:shadow-lg'
              }`}
            >
              <div className="p-4 flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  theme === 'redi' 
                    ? 'bg-indigo-800/80' 
                    : 'bg-teal-800/80'
                }`}>
                  <Trophy className={`h-5 w-5 ${
                    theme === 'redi' ? 'text-indigo-100' : 'text-teal-100'
                  }`} />
                </div>
                <div className="flex-grow">
                  <h3 className={`text-base font-medium group-hover:translate-x-1 transition-transform ${
                    theme === 'redi' ? 'text-indigo-50' : 'text-teal-50'
                  }`}>
                    Achievements
                  </h3>
                  <p className={`text-xs ${
                    theme === 'redi' ? 'text-indigo-200/70' : 'text-teal-200/70'
                  }`}>
                    View your progress and badges
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}