import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Award, Trophy, Medal, Star, BookOpen, FileText, Zap, Crown, 
  TrendingUp, Activity, LineChart, BarChart
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layouts/MainLayout';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getAllAchievements, Achievement } from '@/data/achievements';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
         BarChart as RechartsBarChart, Bar, Legend, CartesianGrid } from 'recharts';
import { ProgressHistoryEntry, SkillMastery } from '@shared/schema';
import { format, subDays } from 'date-fns';

// Helper function to create particles
const createParticles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
  }));
};

// Helper function to generate progress history data
const generateProgressHistoryData = (currentProgress?: any) => {
  const today = new Date();
  const progressHistory: any[] = [];
  
  // If we have actual progress history data, use it
  if (currentProgress?.progressHistory && Array.isArray(currentProgress.progressHistory) && 
      currentProgress.progressHistory.length > 0) {
    return currentProgress.progressHistory;
  }
  
  // Otherwise, generate default progress data starting from today and going backward
  // This ensures a new user always starts with their current date
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i * 7); // Weekly data points
    const dateStr = format(date, 'M/d');
    
    // Make current progress the final data point
    if (i === 0 && currentProgress) {
      const totalMastery = 
        ((currentProgress.rediSkillMastery?.mechanics || 0) + 
         (currentProgress.rediSkillMastery?.sequencing || 0) + 
         (currentProgress.rediSkillMastery?.voice || 0) +
         (currentProgress.owlSkillMastery?.mechanics || 0) + 
         (currentProgress.owlSkillMastery?.sequencing || 0) + 
         (currentProgress.owlSkillMastery?.voice || 0)) / 6;
      
      progressHistory.push({
        date: dateStr,
        redi: Math.round((currentProgress.rediSkillMastery?.mechanics || 0) + 
               (currentProgress.rediSkillMastery?.sequencing || 0) + 
               (currentProgress.rediSkillMastery?.voice || 0)),
        owl: Math.round((currentProgress.owlSkillMastery?.mechanics || 0) + 
              (currentProgress.owlSkillMastery?.sequencing || 0) + 
              (currentProgress.owlSkillMastery?.voice || 0)),
        total: Math.round(totalMastery * 2),
        mechanics: currentProgress.rediSkillMastery?.mechanics || 0,
        sequencing: currentProgress.rediSkillMastery?.sequencing || 0,
        voice: currentProgress.rediSkillMastery?.voice || 0,
        owlMechanics: currentProgress.owlSkillMastery?.mechanics || 0,
        owlSequencing: currentProgress.owlSkillMastery?.sequencing || 0,
        owlVoice: currentProgress.owlSkillMastery?.voice || 0
      });
    } else {
      // Generate simulated past data with a reasonable progression curve
      // The longer ago, the lower the values
      const progressFactor = i === 0 ? 1 : (6 - i) / 6;
      const initialValue = 5; // Start with this minimum value
      
      // For a brand new user, show minimal progression
      if (!currentProgress) {
        progressHistory.push({
          date: dateStr,
          redi: Math.round((initialValue + 10 * progressFactor)),
          owl: Math.round((initialValue + 5 * progressFactor)),
          total: Math.round((initialValue * 2 + 15 * progressFactor)),
          mechanics: Math.round(initialValue * progressFactor),
          sequencing: Math.round(initialValue * progressFactor),
          voice: Math.round(initialValue * progressFactor),
          owlMechanics: Math.round(initialValue * progressFactor),
          owlSequencing: Math.round(initialValue * progressFactor),
          owlVoice: Math.round(initialValue * progressFactor)
        });
      } else {
        // Calculate reasonable progression leading up to current values
        const rediMechanics = Math.round((currentProgress.rediSkillMastery?.mechanics || 0) * progressFactor);
        const rediSequencing = Math.round((currentProgress.rediSkillMastery?.sequencing || 0) * progressFactor);
        const rediVoice = Math.round((currentProgress.rediSkillMastery?.voice || 0) * progressFactor);
        const owlMechanics = Math.round((currentProgress.owlSkillMastery?.mechanics || 0) * progressFactor);
        const owlSequencing = Math.round((currentProgress.owlSkillMastery?.sequencing || 0) * progressFactor);
        const owlVoice = Math.round((currentProgress.owlSkillMastery?.voice || 0) * progressFactor);
        
        progressHistory.push({
          date: dateStr,
          redi: rediMechanics + rediSequencing + rediVoice,
          owl: owlMechanics + owlSequencing + owlVoice,
          total: rediMechanics + rediSequencing + rediVoice + owlMechanics + owlSequencing + owlVoice,
          mechanics: rediMechanics,
          sequencing: rediSequencing,
          voice: rediVoice,
          owlMechanics: owlMechanics,
          owlSequencing: owlSequencing,
          owlVoice: owlVoice
        });
      }
    }
  }
  
  return progressHistory;
};

const AchievementsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<'all' | 'redi' | 'owl' | 'general'>('all');
  const { progress } = useProgress();
  const [particles] = useState(() => createParticles(15));
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  
  // Generate progress history data for charts
  const progressHistoryData = generateProgressHistoryData(progress);
  
  // Set theme based on filter
  useEffect(() => {
    if (activeFilter === 'redi') {
      setTheme('redi');
    } else if (activeFilter === 'owl') {
      setTheme('owl');
    }
  }, [activeFilter, setTheme]);
  
  const achievements = getAllAchievements();
  
  // Filter achievements based on active filter
  const filteredAchievements = activeFilter === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeFilter);
  
  // Sort achievements: unlocked first, then by title
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    const aUnlocked = progress?.achievements?.includes(a.id) || false;
    const bUnlocked = progress?.achievements?.includes(b.id) || false;
    
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return a.title.localeCompare(b.title);
  });
  
  // Get appropriate icon element for achievement
  const getAchievementIcon = (achievement: Achievement) => {
    switch (achievement.icon) {
      case 'trophy': return <Trophy className="h-6 w-6" />;
      case 'medal': return <Medal className="h-6 w-6" />;
      case 'star': return <Star className="h-6 w-6" />;
      case 'book': return <BookOpen className="h-6 w-6" />;
      case 'file': return <FileText className="h-6 w-6" />;
      case 'zap': return <Zap className="h-6 w-6" />;
      case 'crown': return <Crown className="h-6 w-6" />;
      default: return <Award className="h-6 w-6" />;
    }
  };
  
  // Get category color classes
  const getCategoryColorClasses = (category: 'redi' | 'owl' | 'general', isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        bg: 'bg-gray-800/50',
        border: 'border-gray-700',
        text: 'text-gray-500',
        iconBg: 'bg-gray-700',
        iconColor: 'text-gray-400'
      };
    }
    
    switch (category) {
      case 'redi':
        return {
          bg: 'bg-gradient-to-br from-violet-900/70 to-blue-900/70',
          border: 'border-violet-700/50',
          text: 'text-violet-200',
          iconBg: 'bg-violet-700',
          iconColor: 'text-violet-100'
        };
      case 'owl':
        return {
          bg: 'bg-gradient-to-br from-green-900/70 to-teal-900/70',
          border: 'border-green-700/50',
          text: 'text-green-200',
          iconBg: 'bg-green-700',
          iconColor: 'text-green-100'
        };
      case 'general':
        return {
          bg: 'bg-gradient-to-br from-amber-900/70 to-orange-900/70',
          border: 'border-amber-700/50',
          text: 'text-amber-200',
          iconBg: 'bg-amber-700',
          iconColor: 'text-amber-100'
        };
    }
  };
  
  return (
    <MainLayout
      title="Achievements"
      subtitle="Track your writing accomplishments"
    >
      {/* Synthwave background for REDI theme */}
      {theme === 'redi' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e] via-[#1e1e3f] to-[#1a0b2e] -z-10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxwYXRoIGQ9Ik0gODAgMCBMIDAgMCAwIDgwIiBmaWxsPSJub25lIiBzdHJva2U9IiM2MzIwZWUxMCIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiPjwvcmVjdD4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiB0cmFuc2Zvcm09InJvdGF0ZSg5MCAwIDApIj48L3JlY3Q+Cjwvc3ZnPg==')] opacity-20 -z-10"></div>
          
          {/* Synthwave sun */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-20 -z-10">
            <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-t from-[#ff8c42] via-[#ff3864] to-[#ff476f] opacity-20 blur-2xl"></div>
          </div>
          
          {/* Animated grid lines */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a0b2e] -z-10"></div>
          
          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-[#39ff14] opacity-70 z-10"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              animate={{
                y: ['0%', '20%', '0%'],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + particle.speed,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge 
          className={`cursor-pointer px-4 py-2 text-md ${
            activeFilter === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary hover:bg-secondary/80'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </Badge>
        <Badge 
          className={`cursor-pointer px-4 py-2 text-md ${
            activeFilter === 'redi' 
              ? 'bg-violet-700 text-violet-100' 
              : 'bg-violet-900/50 text-violet-300 hover:bg-violet-800'
          }`}
          onClick={() => setActiveFilter('redi')}
        >
          REDI
        </Badge>
        <Badge 
          className={`cursor-pointer px-4 py-2 text-md ${
            activeFilter === 'owl' 
              ? 'bg-green-700 text-green-100' 
              : 'bg-green-900/50 text-green-300 hover:bg-green-800'
          }`}
          onClick={() => setActiveFilter('owl')}
        >
          OWL
        </Badge>
        <Badge 
          className={`cursor-pointer px-4 py-2 text-md ${
            activeFilter === 'general' 
              ? 'bg-amber-700 text-amber-100' 
              : 'bg-amber-900/50 text-amber-300 hover:bg-amber-800'
          }`}
          onClick={() => setActiveFilter('general')}
        >
          General
        </Badge>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className={`${
          theme === 'redi' 
            ? 'bg-gradient-to-br from-violet-900/30 to-blue-900/30 border-violet-700/30' 
            : 'bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-700/30'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className={`p-1.5 rounded-full ${
                theme === 'redi' ? 'bg-violet-700' : 'bg-green-700'
              }`}>
                <Trophy className="h-4 w-4" />
              </div>
              Total Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {progress?.achievements?.length || 0} / {achievements.length}
            </p>
          </CardContent>
        </Card>
        
        <Card className={`${
          theme === 'redi' 
            ? 'bg-gradient-to-br from-violet-900/30 to-blue-900/30 border-violet-700/30' 
            : 'bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-700/30'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className={`p-1.5 rounded-full ${
                theme === 'redi' ? 'bg-violet-700' : 'bg-green-700'
              }`}>
                <FileText className="h-4 w-4" />
              </div>
              REDI Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {progress?.achievements?.filter(id => 
                achievements.find(a => a.id === id)?.category === 'redi'
              ).length || 0} / {achievements.filter(a => a.category === 'redi').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className={`${
          theme === 'redi' 
            ? 'bg-gradient-to-br from-violet-900/30 to-blue-900/30 border-violet-700/30' 
            : 'bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-700/30'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className={`p-1.5 rounded-full ${
                theme === 'redi' ? 'bg-violet-700' : 'bg-green-700'
              }`}>
                <BookOpen className="h-4 w-4" />
              </div>
              OWL Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {progress?.achievements?.filter(id => 
                achievements.find(a => a.id === id)?.category === 'owl'
              ).length || 0} / {achievements.filter(a => a.category === 'owl').length}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Progress Tracker */}
      <Card className={`mb-8 ${
        theme === 'redi' 
          ? 'bg-gradient-to-br from-violet-950/70 to-blue-950/70 border-violet-700/30' 
          : 'bg-gradient-to-br from-green-950/70 to-teal-950/70 border-green-700/30'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Tracker
          </CardTitle>
          <CardDescription>
            Track your skill development and achievements over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="redi">REDI Skills</TabsTrigger>
              <TabsTrigger value="owl">OWL Skills</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Learning Progression</span>
                </h3>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={progressHistoryData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRedi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOwl" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 15, 30, 0.8)', 
                          borderColor: '#444',
                          color: '#fff',
                          backdropFilter: 'blur(4px)'
                        }} 
                      />
                      <Area type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total" />
                      <Area type="monotone" dataKey="redi" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#colorRedi)" name="REDI" />
                      <Area type="monotone" dataKey="owl" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOwl)" name="OWL" />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-violet-500" />
                    <span>REDI Skills</span>
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={[
                          { name: 'Mechanics', value: progress?.rediSkillMastery?.mechanics || 0 },
                          { name: 'Sequencing', value: progress?.rediSkillMastery?.sequencing || 0 },
                          { name: 'Voice', value: progress?.rediSkillMastery?.voice || 0 },
                        ]}
                        margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#999" />
                        <YAxis stroke="#999" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#9333ea" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-green-500" />
                    <span>OWL Skills</span>
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={[
                          { name: 'Mechanics', value: progress?.owlSkillMastery?.mechanics || 0 },
                          { name: 'Sequencing', value: progress?.owlSkillMastery?.sequencing || 0 },
                          { name: 'Voice', value: progress?.owlSkillMastery?.voice || 0 },
                        ]}
                        margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#999" />
                        <YAxis stroke="#999" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="redi" className="space-y-4">
              <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-violet-500" />
                  <span>REDI Skill Development</span>
                </h3>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={progressHistoryData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorMechanics" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSequencing" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVoice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 15, 30, 0.8)', 
                          borderColor: '#444',
                          color: '#fff'
                        }} 
                      />
                      <Area type="monotone" dataKey="mechanics" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#colorMechanics)" name="Mechanics" />
                      <Area type="monotone" dataKey="sequencing" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSequencing)" name="Sequencing" />
                      <Area type="monotone" dataKey="voice" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorVoice)" name="Voice" />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4">
                <h3 className="text-lg font-semibold mb-2">Current REDI Level: {progress?.rediLevel || 1}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Mechanics</p>
                    <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-violet-600 rounded-full"
                        style={{ width: `${progress?.rediSkillMastery?.mechanics || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{progress?.rediSkillMastery?.mechanics || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Sequencing</p>
                    <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${progress?.rediSkillMastery?.sequencing || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{progress?.rediSkillMastery?.sequencing || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Voice</p>
                    <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-pink-600 rounded-full"
                        style={{ width: `${progress?.rediSkillMastery?.voice || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{progress?.rediSkillMastery?.voice || 0}%</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="owl" className="space-y-4">
              <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-green-500" />
                  <span>OWL Skill Development</span>
                </h3>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={progressHistoryData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorOwlMechanics" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOwlSequencing" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOwlVoice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 15, 30, 0.8)', 
                          borderColor: '#444',
                          color: '#fff'
                        }} 
                      />
                      <Area type="monotone" dataKey="owlMechanics" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOwlMechanics)" name="Mechanics" />
                      <Area type="monotone" dataKey="owlSequencing" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorOwlSequencing)" name="Sequencing" />
                      <Area type="monotone" dataKey="owlVoice" stroke="#84cc16" strokeWidth={2} fillOpacity={1} fill="url(#colorOwlVoice)" name="Voice" />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4">
                <h3 className="text-lg font-semibold mb-2">Current OWL Level: {progress?.owlLevel || 1}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Mechanics</p>
                    <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${progress?.owlSkillMastery?.mechanics || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{progress?.owlSkillMastery?.mechanics || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Sequencing</p>
                    <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-sky-600 rounded-full"
                        style={{ width: `${progress?.owlSkillMastery?.sequencing || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{progress?.owlSkillMastery?.sequencing || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Voice</p>
                    <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-lime-600 rounded-full"
                        style={{ width: `${progress?.owlSkillMastery?.voice || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{progress?.owlSkillMastery?.voice || 0}%</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAchievements.map((achievement) => {
          const isUnlocked = progress?.achievements?.includes(achievement.id) || false;
          const colors = getCategoryColorClasses(achievement.category, isUnlocked);
          
          return (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              onClick={() => setActiveAchievement(achievement)}
              className="cursor-pointer"
            >
              <Card className={`${colors.bg} border ${colors.border} backdrop-blur-sm transition-all duration-300 overflow-hidden relative`}>
                {isUnlocked && (
                  <div className="absolute -top-5 -right-5 w-20 h-20 bg-yellow-500/10 rounded-full blur-xl"></div>
                )}
                
                <CardHeader className="pb-2 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full ${colors.iconBg} ${colors.iconColor} flex items-center justify-center shadow-inner`}>
                        {getAchievementIcon(achievement)}
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${colors.text}`}>
                          {achievement.title}
                        </CardTitle>
                        <CardDescription className={isUnlocked ? '' : 'text-gray-500'}>
                          {achievement.category.toUpperCase()}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {isUnlocked && (
                      <Badge className="bg-yellow-600/80 text-yellow-100">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className={`text-sm ${isUnlocked ? colors.text : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Display if no achievements match filter */}
      {sortedAchievements.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-400">No achievements found for this filter.</p>
        </div>
      )}
      
      {/* Achievement Details Modal */}
      {/* Could be added in future */}
    </MainLayout>
  );
};

export default AchievementsPage;