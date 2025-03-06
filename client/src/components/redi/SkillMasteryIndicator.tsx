import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, RefreshCw, Zap } from 'lucide-react';
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
  // Get skill type specific properties
  const getSkillProperties = () => {
    switch (skill) {
      case 'mechanics':
        return {
          label: 'Mechanics',
          icon: <Cpu size={16} className="mr-1" />,
          color: 'text-synthwave-accent',
          shadow: 'text-shadow-neon-green',
          progressBg: 'from-synthwave-accent to-synthwave-cyan',
          borderColor: 'border-synthwave-accent',
          shadowColor: 'shadow-neon-green'
        };
      case 'sequencing':
        return {
          label: 'Sequencing',
          icon: <RefreshCw size={16} className="mr-1" />,
          color: 'text-synthwave-pink',
          shadow: 'text-shadow-neon-pink',
          progressBg: 'from-synthwave-pink to-synthwave-purple',
          borderColor: 'border-synthwave-pink',
          shadowColor: 'shadow-neon-pink'
        };
      case 'voice':
        return {
          label: 'Voice',
          icon: <Zap size={16} className="mr-1" />,
          color: 'text-synthwave-cyan',
          shadow: 'text-shadow-neon-blue',
          progressBg: 'from-synthwave-cyan to-synthwave-primary',
          borderColor: 'border-synthwave-cyan',
          shadowColor: 'shadow-neon-blue'
        };
      default:
        return {
          label: skill,
          icon: <Cpu size={16} className="mr-1" />,
          color: 'text-white',
          shadow: '',
          progressBg: 'from-gray-400 to-gray-500',
          borderColor: 'border-gray-500',
          shadowColor: ''
        };
    }
  };
  
  const skillProps = getSkillProperties();
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden backdrop-blur-sm bg-synthwave-surface/80 rounded-lg p-3 
        ${isActive ? `border ${skillProps.borderColor} ${skillProps.shadowColor}` : 'border border-synthwave-surface/40'} 
        transition-all duration-300`}
    >
      {/* Background glowing corners */}
      {isActive && (
        <>
          <div className="absolute top-0 left-0 w-8 h-8 rounded-full blur-md opacity-30 bg-gradient-to-br from-synthwave-primary to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full blur-md opacity-30 bg-gradient-to-tl from-synthwave-accent to-transparent"></div>
        </>
      )}
      
      {/* VHS static effect */}
      <div className="absolute inset-0 redi-vhs-static opacity-10"></div>
      
      {/* Main content */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className={`text-sm font-orbitron font-bold ${skillProps.color} ${skillProps.shadow} uppercase tracking-wider flex items-center`}>
              {skillProps.icon}
              {skillProps.label}
            </span>
          </div>
          <div className={`text-sm font-mono ${skillProps.color} ${skillProps.shadow} font-bold`}>
            {percentage}%
            <span className="animate-pulse-slow inline-block ml-1">⌁</span>
          </div>
        </div>
        
        {/* Outer progress bar container with scanline effect */}
        <div className="h-2.5 bg-synthwave-background/70 rounded-full overflow-hidden relative shadow-inner border border-synthwave-surface/60">
          {/* Progress bar with gradient and animation */}
          <div 
            className={`h-full bg-gradient-to-r ${skillProps.progressBg} relative overflow-hidden transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          >
            {/* Shimmering effect inside progress bar */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]"></div>
          </div>
          
          {/* Scanline effect for progress bar */}
          <div className="absolute inset-0 redi-scanlines opacity-20"></div>
        </div>
        
        {/* Mini level indicator text */}
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-gray-400 font-mono">
            LVL {Math.floor(percentage / 10)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillMasteryIndicator;
