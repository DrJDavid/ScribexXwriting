import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import REDIMapNode, { SkillType } from '@/components/redi/REDIMapNode';
import SkillMasteryIndicator from '@/components/redi/SkillMasteryIndicator';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getExerciseNodes } from '@/data/exercises';

const REDIMap: React.FC = () => {
  const { setTheme } = useTheme();
  const [, navigate] = useLocation();
  const { progress, isLoading } = useProgress();
  
  // Make sure REDI theme is active
  useEffect(() => {
    setTheme('redi');
  }, [setTheme]);
  
  // Handle node click
  const handleNodePress = (exerciseId: string) => {
    navigate(`/redi/exercise/${exerciseId}`);
  };
  
  // Filter for skill type
  const [activeFilter, setActiveFilter] = React.useState<SkillType | 'all'>('all');
  
  // Get nodes with proper status based on progress
  const nodes = getExerciseNodes(progress?.skillMastery || { mechanics: 0, sequencing: 0, voice: 0 });
  
  // Filter nodes by skill type
  const filteredNodes = activeFilter === 'all' 
    ? nodes 
    : nodes.filter(node => node.skillType === activeFilter);

  return (
    <MainLayout 
      title="REDI" 
      subtitle="Reflective Exercise on Direct Instruction"
    >
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-orbitron text-white text-lg">Learning Path</h2>
          <div className="flex space-x-2">
            <button 
              className={`${activeFilter === 'all' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeFilter === 'all' ? 'text-white' : 'text-gray-400'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`${activeFilter === 'mechanics' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeFilter === 'mechanics' ? 'text-white' : 'text-gray-400'}`}
              onClick={() => setActiveFilter('mechanics')}
            >
              Mechanics
            </button>
            <button 
              className={`${activeFilter === 'sequencing' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeFilter === 'sequencing' ? 'text-white' : 'text-gray-400'}`}
              onClick={() => setActiveFilter('sequencing')}
            >
              Sequencing
            </button>
            <button 
              className={`${activeFilter === 'voice' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeFilter === 'voice' ? 'text-white' : 'text-gray-400'}`}
              onClick={() => setActiveFilter('voice')}
            >
              Voice
            </button>
          </div>
        </div>
        
        {/* Skill Mastery Indicators */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <SkillMasteryIndicator 
            skill="mechanics" 
            percentage={progress?.skillMastery.mechanics || 0} 
            isActive={activeFilter === 'mechanics' || activeFilter === 'all'}
          />
          <SkillMasteryIndicator 
            skill="sequencing" 
            percentage={progress?.skillMastery.sequencing || 0} 
            isActive={activeFilter === 'sequencing' || activeFilter === 'all'}
          />
          <SkillMasteryIndicator 
            skill="voice" 
            percentage={progress?.skillMastery.voice || 0} 
            isActive={activeFilter === 'voice' || activeFilter === 'all'}
          />
        </div>
        
        {/* REDI Map Grid */}
        <div className="relative bg-[#1e1e1e] rounded-xl p-4 min-h-[400px]">
          {/* Grid background */}
          <div className="absolute inset-0 redi-grid-bg"></div>
          
          {/* Map nodes */}
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
                onPress={handleNodePress}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default REDIMap;
