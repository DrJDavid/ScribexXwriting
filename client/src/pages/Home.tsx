import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/context/ThemeContext';
import { Loader, Sparkles, BookOpen, Leaf, PenTool, FileText, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();

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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col space-y-6">
        {/* Welcome section with theme toggler */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl overflow-hidden shadow-lg ${
            theme === 'redi' 
              ? 'bg-gradient-to-br from-violet-900/90 to-indigo-950/90 border border-violet-700/50' 
              : 'bg-gradient-to-br from-emerald-900/90 to-teal-950/90 border border-emerald-700/50'
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
            className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg ${
              theme === 'redi'
                ? 'bg-gradient-to-br from-violet-900/80 to-indigo-950/80 border border-violet-700/50 hover:border-violet-600/80'
                : 'bg-gradient-to-br from-violet-900/80 to-indigo-950/80 border border-violet-700/50 hover:border-violet-600/80'
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
            className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg ${
              theme === 'redi'
                ? 'bg-gradient-to-br from-emerald-900/80 to-teal-950/80 border border-emerald-700/50 hover:border-emerald-600/80'
                : 'bg-gradient-to-br from-emerald-900/80 to-teal-950/80 border border-emerald-700/50 hover:border-emerald-600/80'
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

        {/* Shortcuts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Submissions shortcut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => navigate('/writing/submissions')}
            className={`group cursor-pointer rounded-xl overflow-hidden shadow-md ${
              theme === 'redi'
                ? 'bg-gradient-to-br from-indigo-900/80 to-indigo-950/80 border border-indigo-700/50'
                : 'bg-gradient-to-br from-teal-900/80 to-teal-950/80 border border-teal-700/50'
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

          {/* Profile shortcut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => navigate('/profile')}
            className={`group cursor-pointer rounded-xl overflow-hidden shadow-md ${
              theme === 'redi'
                ? 'bg-gradient-to-br from-indigo-900/80 to-indigo-950/80 border border-indigo-700/50'
                : 'bg-gradient-to-br from-teal-900/80 to-teal-950/80 border border-teal-700/50'
            }`}
          >
            <div className="p-4 flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${
                theme === 'redi' 
                  ? 'bg-indigo-800/80' 
                  : 'bg-teal-800/80'
              }`}>
                <LayoutDashboard className={`h-5 w-5 ${
                  theme === 'redi' ? 'text-indigo-100' : 'text-teal-100'
                }`} />
              </div>
              <div className="flex-grow">
                <h3 className={`text-base font-medium group-hover:translate-x-1 transition-transform ${
                  theme === 'redi' ? 'text-indigo-50' : 'text-teal-50'
                }`}>
                  Profile
                </h3>
                <p className={`text-xs ${
                  theme === 'redi' ? 'text-indigo-200/70' : 'text-teal-200/70'
                }`}>
                  Update your account settings
                </p>
              </div>
            </div>
          </motion.div>

          {/* Free write shortcut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            onClick={() => navigate('/owl/quest/free-write')}
            className={`group cursor-pointer rounded-xl overflow-hidden shadow-md ${
              theme === 'redi'
                ? 'bg-gradient-to-br from-indigo-900/80 to-indigo-950/80 border border-indigo-700/50'
                : 'bg-gradient-to-br from-teal-900/80 to-teal-950/80 border border-teal-700/50'
            }`}
          >
            <div className="p-4 flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${
                theme === 'redi' 
                  ? 'bg-indigo-800/80' 
                  : 'bg-teal-800/80'
              }`}>
                <BookOpen className={`h-5 w-5 ${
                  theme === 'redi' ? 'text-indigo-100' : 'text-teal-100'
                }`} />
              </div>
              <div className="flex-grow">
                <h3 className={`text-base font-medium group-hover:translate-x-1 transition-transform ${
                  theme === 'redi' ? 'text-indigo-50' : 'text-teal-50'
                }`}>
                  Free Write
                </h3>
                <p className={`text-xs ${
                  theme === 'redi' ? 'text-indigo-200/70' : 'text-teal-200/70'
                }`}>
                  Start a new open-ended writing
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}