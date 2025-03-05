import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import REDIMapNode, { SkillType, ExerciseType } from '@/components/redi/REDIMapNode';
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
  
  // Filter for skill type and exercise type
  const [activeSkillFilter, setActiveSkillFilter] = useState<SkillType | 'all'>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<ExerciseType | 'all'>('all');
  
  // Get nodes with proper status based on progress
  const nodes = getExerciseNodes(progress?.skillMastery || { mechanics: 0, sequencing: 0, voice: 0 });
  
  // Filter nodes by both skill type and exercise type
  const filteredNodes = nodes.filter(node => {
    // Filter by skill type
    const skillFilterPassed = activeSkillFilter === 'all' || node.skillType === activeSkillFilter;
    
    // Filter by exercise type
    const typeFilterPassed = activeTypeFilter === 'all' || node.type === activeTypeFilter;
    
    // Node must pass both filters
    return skillFilterPassed && typeFilterPassed;
  });

  return (
    <MainLayout 
      title="REDI" 
      subtitle="Reflective Exercise on Direct Instruction"
    >
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-orbitron text-white text-lg">Learning Path</h2>
          <div className="flex flex-col space-y-2">
            {/* Skill Type Filter */}
            <div className="flex space-x-2">
              <span className="text-white text-xs mr-1">Skills:</span>
              <button 
                className={`${activeSkillFilter === 'all' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeSkillFilter === 'all' ? 'text-white' : 'text-gray-400'}`}
                onClick={() => setActiveSkillFilter('all')}
              >
                All
              </button>
              <button 
                className={`${activeSkillFilter === 'mechanics' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeSkillFilter === 'mechanics' ? 'text-white' : 'text-gray-400'}`}
                onClick={() => setActiveSkillFilter('mechanics')}
              >
                Mechanics
              </button>
              <button 
                className={`${activeSkillFilter === 'sequencing' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeSkillFilter === 'sequencing' ? 'text-white' : 'text-gray-400'}`}
                onClick={() => setActiveSkillFilter('sequencing')}
              >
                Sequencing
              </button>
              <button 
                className={`${activeSkillFilter === 'voice' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeSkillFilter === 'voice' ? 'text-white' : 'text-gray-400'}`}
                onClick={() => setActiveSkillFilter('voice')}
              >
                Voice
              </button>
            </div>
            
            {/* Exercise Type Filter */}
            <div className="flex space-x-2">
              <span className="text-white text-xs mr-1">Type:</span>
              <button 
                className={`${activeTypeFilter === 'all' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeTypeFilter === 'all' ? 'text-white' : 'text-gray-400'}`}
                onClick={() => setActiveTypeFilter('all')}
              >
                All
              </button>
              <button 
                className={`${activeTypeFilter === 'multiple-choice' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeTypeFilter === 'multiple-choice' ? 'text-white' : 'text-gray-400'}`}
                onClick={() => setActiveTypeFilter('multiple-choice')}
              >
                Multiple Choice
              </button>
              <button 
                className={`${activeTypeFilter === 'writing' ? 'bg-[#1e1e1e]' : ''} px-3 py-1 rounded-full text-xs ${activeTypeFilter === 'writing' ? 'text-white' : 'text-gray-400'}`}
                onClick={() => setActiveTypeFilter('writing')}
              >
                Writing
              </button>
            </div>
          </div>
        </div>
        
        {/* Skill Mastery Indicators */}
        <div className="grid grid-cols-3 gap-2 mb-4">
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
                type={node.type}
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
