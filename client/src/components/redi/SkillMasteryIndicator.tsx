import React from 'react';
import { SkillType } from './REDIMapNode';

interface SkillMasteryIndicatorProps {
  skill: SkillType;
  percentage: number;
  isActive?: boolean;
}

const SkillMasteryIndicator: React.FC<SkillMasteryIndicatorProps> = ({
  skill,
  percentage,
  isActive = false,
}) => {
  const getSkillLabel = () => {
    switch (skill) {
      case 'mechanics':
        return 'Mechanics';
      case 'sequencing':
        return 'Sequencing';
      case 'voice':
        return 'Voice';
      default:
        return skill;
    }
  };

  return (
    <div className={`bg-[#1e1e1e] rounded-lg p-2 ${isActive ? 'border border-[#39ff14]' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white">{getSkillLabel()}</span>
        <span className="text-xs text-[#39ff14]">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full redi-accent-gradient" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SkillMasteryIndicator;
