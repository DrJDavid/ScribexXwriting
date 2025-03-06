import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Box, PenTool, Binary, Code, GitBranch, Cpu } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import REDIMapNode, { SkillType, ExerciseType } from '@/components/redi/REDIMapNode';
import SkillMasteryIndicator from '@/components/redi/SkillMasteryIndicator';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getExerciseNodes } from '@/data/exercises';

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

const REDIMap: React.FC = () => {
  const { setTheme } = useTheme();
  const [, navigate] = useLocation();
  const { progress, isLoading } = useProgress();
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Make sure REDI theme is active
  useEffect(() => {
    setTheme('redi');
  }, [setTheme]);
  
  // Handle node click with glitch effect
  const handleNodePress = (exerciseId: string) => {
    // Add a glitch effect to the body before navigation
    document.body.classList.add('animate-glitch-once');
    setTimeout(() => {
      document.body.classList.remove('animate-glitch-once');
      navigate(`/redi/exercise/${exerciseId}`);
    }, 300);
  };
  
  // Filter for skill type and exercise type
  const [activeSkillFilter, setActiveSkillFilter] = useState<SkillType | 'all'>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<ExerciseType | 'all'>('all');
  
  // Get nodes with proper status based on progress
  const nodes = getExerciseNodes(progress?.skillMastery || { mechanics: 0, sequencing: 0, voice: 0 });
  
  // Create decorative particles
  const [particles] = useState(() => createParticles(15));

  // Filter nodes by both skill type and exercise type
  const filteredNodes = nodes.filter(node => {
    // Filter by skill type
    const skillFilterPassed = activeSkillFilter === 'all' || node.skillType === activeSkillFilter;
    
    // Filter by exercise type
    const typeFilterPassed = activeTypeFilter === 'all' || node.type === activeTypeFilter;
    
    // Node must pass both filters
    return skillFilterPassed && typeFilterPassed;
  });
  
  // Calculate total number of completed nodes
  const completedNodesCount = nodes.filter(node => node.status === 'completed').length;
  const totalNodesCount = nodes.length;
  const progressPercentage = Math.round((completedNodesCount / totalNodesCount) * 100);

  return (
    <MainLayout 
      title="REDI" 
      subtitle="Reflective Exercise on Direct Instruction"
    >
      <div className="mb-6 relative">
        {/* Synthwave sun and horizon - decorative background */}
        <div className="absolute top-0 left-0 w-full h-16 bg-synthwave-horizon overflow-hidden rounded-t-xl opacity-80 z-0">
          <div className="redi-sun"></div>
          <div className="absolute inset-0 z-10 opacity-30 bg-gradient-to-b from-transparent to-synthwave-background"></div>
        </div>
        
        {/* Main container with z-index to appear above background */}
        <div className="relative z-10 pt-20">
          {/* Header with neon text effect */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-6"
          >
            <div>
              <h2 className="font-orbitron text-2xl font-bold mb-1 flex items-center gap-2 text-shadow-neon-purple">
                <Zap className="h-6 w-6 text-synthwave-purple animate-pulse-slow" />
                <span className="redi-neon-text bg-size-200% animate-gradient-slow">Learning Path</span>
              </h2>
              <p className="text-gray-300 text-sm">
                Progress: {completedNodesCount}/{totalNodesCount} nodes completed ({progressPercentage}%)
              </p>
            </div>
            
            <motion.div 
              className="flex flex-col space-y-3 backdrop-blur-sm bg-synthwave-surface/40 rounded-xl p-3 border border-synthwave-accent/30"
              whileHover={{ boxShadow: '0 0 15px rgba(57, 255, 20, 0.3)' }}
            >
              <div className="flex flex-col space-y-2">
                {/* Skill Type Filter */}
                <div className="flex space-x-2 items-center">
                  <span className="text-synthwave-accent text-shadow-neon-green text-xs font-bold mr-1 uppercase tracking-wider flex items-center">
                    <Code className="h-3 w-3 mr-1" /> Skills:
                  </span>
                  <div className="flex space-x-1">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${activeSkillFilter === 'all' ? 'bg-synthwave-primary border-synthwave-accent text-white shadow-neon-green' : 'bg-synthwave-surface/80 border-white/20 text-gray-400'} px-3 py-1 text-xs rounded-md border transition-all duration-300`}
                      onClick={() => setActiveSkillFilter('all')}
                    >
                      All
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${activeSkillFilter === 'mechanics' ? 'bg-synthwave-primary border-synthwave-accent text-white shadow-neon-green' : 'bg-synthwave-surface/80 border-white/20 text-gray-400'} px-3 py-1 text-xs rounded-md border transition-all duration-300`}
                      onClick={() => setActiveSkillFilter('mechanics')}
                    >
                      Mechanics
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${activeSkillFilter === 'sequencing' ? 'bg-synthwave-primary border-synthwave-accent text-white shadow-neon-green' : 'bg-synthwave-surface/80 border-white/20 text-gray-400'} px-3 py-1 text-xs rounded-md border transition-all duration-300`}
                      onClick={() => setActiveSkillFilter('sequencing')}
                    >
                      Sequencing
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${activeSkillFilter === 'voice' ? 'bg-synthwave-primary border-synthwave-accent text-white shadow-neon-green' : 'bg-synthwave-surface/80 border-white/20 text-gray-400'} px-3 py-1 text-xs rounded-md border transition-all duration-300`}
                      onClick={() => setActiveSkillFilter('voice')}
                    >
                      Voice
                    </motion.button>
                  </div>
                </div>
                
                {/* Exercise Type Filter */}
                <div className="flex space-x-2 items-center">
                  <span className="text-synthwave-pink text-shadow-neon-pink text-xs font-bold mr-1 uppercase tracking-wider flex items-center">
                    <GitBranch className="h-3 w-3 mr-1" /> Type:
                  </span>
                  <div className="flex space-x-1">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${activeTypeFilter === 'all' ? 'bg-synthwave-primary border-synthwave-pink text-white shadow-neon-pink' : 'bg-synthwave-surface/80 border-white/20 text-gray-400'} px-3 py-1 text-xs rounded-md border transition-all duration-300`}
                      onClick={() => setActiveTypeFilter('all')}
                    >
                      All
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${activeTypeFilter === 'multiple-choice' ? 'bg-synthwave-primary border-synthwave-pink text-white shadow-neon-pink' : 'bg-synthwave-surface/80 border-white/20 text-gray-400'} px-3 py-1 text-xs rounded-md border transition-all duration-300`}
                      onClick={() => setActiveTypeFilter('multiple-choice')}
                    >
                      <Box className="h-3 w-3 inline mr-1" />
                      Multiple Choice
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${activeTypeFilter === 'writing' ? 'bg-synthwave-primary border-synthwave-pink text-white shadow-neon-pink' : 'bg-synthwave-surface/80 border-white/20 text-gray-400'} px-3 py-1 text-xs rounded-md border transition-all duration-300`}
                      onClick={() => setActiveTypeFilter('writing')}
                    >
                      <PenTool className="h-3 w-3 inline mr-1" />
                      Writing
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Skill Mastery Indicators with enhanced visuals */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mb-6"
          >
            <SkillMasteryIndicator 
              skill="mechanics" 
              percentage={progress?.skillMastery.mechanics || 0} 
              isActive={activeSkillFilter === 'mechanics' || activeSkillFilter === 'all'}
            />
            <SkillMasteryIndicator 
              skill="sequencing" 
              percentage={progress?.skillMastery.sequencing || 0} 
              isActive={activeSkillFilter === 'sequencing' || activeSkillFilter === 'all'}
            />
            <SkillMasteryIndicator 
              skill="voice" 
              percentage={progress?.skillMastery.voice || 0} 
              isActive={activeSkillFilter === 'voice' || activeSkillFilter === 'all'}
            />
          </motion.div>
          
          {/* REDI Map Grid with perspective effect */}
          <motion.div 
            ref={mapRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative overflow-hidden bg-synthwave-background rounded-xl p-6 min-h-[500px] border border-synthwave-accent/50 shadow-neon-green"
          >
            {/* VHS static effect overlay */}
            <div className="redi-vhs-static"></div>
            
            {/* Scanlines effect */}
            <div className="absolute inset-0 redi-scanlines"></div>
            
            {/* Perspective grid background */}
            <div className="absolute inset-0 bg-synthwave-grid bg-[size:60px_60px] animate-grid-move opacity-70"></div>
            
            {/* Horizon effect at the bottom */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-synthwave-pink/30 to-transparent"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-6 right-6 text-synthwave-cyan text-shadow-neon-blue animate-pulse-slow">
              <Cpu size={24} />
            </div>
            <div className="absolute bottom-6 left-6 text-synthwave-accent text-shadow-neon-green animate-pulse-slow">
              <Binary size={24} />
            </div>
            
            {/* Floating particles */}
            <div className="redi-particles">
              {particles.map((particle) => (
                <div
                  key={particle.id}
                  className="redi-particle"
                  style={{
                    top: `${particle.y}%`,
                    left: `${particle.x}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    animationDuration: `${3 + particle.speed}s`,
                    animationDelay: `${particle.delay}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Map nodes with position */}
            <div className="relative z-10">
              {filteredNodes.map((node) => (
                <REDIMapNode
                  key={node.id}
                  id={node.id}
                  title={node.title}
                  level={node.level}
                  status={node.status}
                  skillType={node.skillType}
                  position={node.position}
                  mastery={node.mastery}
                  type={node.type}
                  onPress={handleNodePress}
                />
              ))}
            </div>
          </motion.div>
          
          {/* Terminal-style help text */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-4 redi-terminal-text text-xs"
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-synthwave-accent" />
              <span>Select a node to begin an exercise. Complete exercises to unlock new paths and increase your skill mastery.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default REDIMap;
