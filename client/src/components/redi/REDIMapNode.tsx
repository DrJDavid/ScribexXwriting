import React from 'react';
import { motion } from 'framer-motion';
import { PencilLine, ListChecks, Lock, Star, CheckCircle, CircleDot, Code, Brain, Zap } from 'lucide-react';

export type NodeStatus = 'locked' | 'available' | 'completed' | 'current';
export type SkillType = 'mechanics' | 'sequencing' | 'voice';
export type ExerciseType = 'multiple-choice' | 'writing';

export interface REDIMapNodeProps {
  id: string;
  title: string;
  level: number;
  status: NodeStatus;
  skillType: SkillType;
  position: { x: number; y: number };
  mastery?: number;
  type?: ExerciseType;
  onPress: (id: string) => void;
}

const REDIMapNode: React.FC<REDIMapNodeProps> = ({
  id,
  title,
  level,
  status,
  skillType,
  position,
  mastery,
  type = 'multiple-choice', // Default to multiple-choice if type not specified
  onPress,
}) => {
  // Get skill type specific properties
  const getSkillStyleProps = (skill: SkillType) => {
    switch (skill) {
      case 'mechanics':
        return {
          icon: <Code size={14} />,
          color: 'text-synthwave-accent',
          glow: 'shadow-neon-green',
          textShadow: 'text-shadow-neon-green',
          borderColor: 'border-synthwave-accent',
          hoverGlow: 'hover:shadow-neon-green',
        };
      case 'sequencing':
        return {
          icon: <Brain size={14} />,
          color: 'text-synthwave-pink',
          glow: 'shadow-neon-pink',
          textShadow: 'text-shadow-neon-pink',
          borderColor: 'border-synthwave-pink',
          hoverGlow: 'hover:shadow-neon-pink',
        };
      case 'voice':
        return {
          icon: <Zap size={14} />,
          color: 'text-synthwave-cyan',
          glow: 'shadow-neon-blue',
          textShadow: 'text-shadow-neon-blue',
          borderColor: 'border-synthwave-cyan',
          hoverGlow: 'hover:shadow-neon-blue',
        };
    }
  };

  // Status-based styling with enhanced synthwave aesthetics
  const getNodeStyles = () => {
    const skillProps = getSkillStyleProps(skillType);
    
    switch (status) {
      case 'completed':
        return {
          background: 'bg-synthwave-primary bg-opacity-90',
          border: `border-2 ${skillProps.borderColor}`,
          text: 'text-white',
          effect: skillProps.glow,
          animation: 'animate-pulse-slow',
          icon: <CheckCircle size={16} className={skillProps.color} />,
          innerGlow: `${skillProps.color}`,
          interaction: 'cursor-pointer z-20',
          textEffect: skillProps.textShadow
        };
      case 'current':
        return {
          background: 'bg-synthwave-surface bg-opacity-90',
          border: `border-2 ${skillProps.borderColor}`,
          text: 'text-white',
          effect: skillProps.glow,
          animation: 'animate-pulse-slow',
          icon: <CircleDot size={16} className={skillProps.color} />,
          innerGlow: `${skillProps.color}`,
          interaction: 'cursor-pointer z-20',
          textEffect: skillProps.textShadow
        };
      case 'available':
        return {
          background: 'bg-synthwave-surface bg-opacity-80',
          border: `border-2 border-white/50 hover:${skillProps.borderColor}`,
          text: 'text-white',
          effect: `hover:${skillProps.glow}`,
          animation: '',
          icon: <Star size={16} className="text-white group-hover:text-yellow-300" />,
          innerGlow: 'text-white group-hover:text-yellow-300',
          interaction: 'cursor-pointer z-20',
          textEffect: `group-hover:${skillProps.textShadow}`
        };
      case 'locked':
      default:
        return {
          background: 'bg-gray-900/60 backdrop-blur-sm',
          border: 'border-2 border-gray-700/50',
          text: 'text-gray-500',
          effect: '',
          animation: '',
          icon: <Lock size={16} className="text-gray-500" />,
          innerGlow: '',
          interaction: 'opacity-60 cursor-not-allowed',
          textEffect: ''
        };
    }
  };

  // Type-based icon and shape
  const getTypeProps = () => {
    if (type === 'writing') {
      return {
        icon: <PencilLine className="mb-1 animate-float-slow" size={18} />,
        nodeShape: 'rounded-lg', // Square with rounded corners for writing
        label: 'Writing'
      };
    } else {
      return {
        icon: <ListChecks className="mb-1" size={18} />,
        nodeShape: 'rounded-full', // Circle for multiple choice
        label: 'Multiple Choice'
      };
    }
  };
  
  const typeProps = getTypeProps();
  const styles = getNodeStyles();
  const skillStyles = getSkillStyleProps(skillType);
  
  const handlePress = () => {
    if (status !== 'locked') {
      onPress(id);
    }
  };

  return (
    <div 
      className="absolute" 
      style={{ top: position.y, left: position.x }}
      data-testid="node-container"
    >
      <div className="flex flex-col items-center">
        {/* Main node */}
        <motion.div
          whileHover={status !== 'locked' ? { scale: 1.08, y: -3 } : {}}
          whileTap={status !== 'locked' ? { scale: 0.95, y: 0 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          onClick={handlePress}
          className={`group w-16 h-16 ${typeProps.nodeShape} ${styles.background} ${styles.border} ${styles.effect} ${styles.animation} ${styles.interaction} 
            flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300`}
        >
          {/* Glowing outer ring effect for current and completed nodes */}
          {(status === 'completed' || status === 'current') && (
            <div className={`absolute inset-0 ${typeProps.nodeShape} ${skillStyles.glow} opacity-20 scale-110 blur-sm`}></div>
          )}
          
          {/* Status indicator in top-right */}
          <div className="absolute top-1 right-1">
            {styles.icon}
          </div>
          
          {/* VHS static effect */}
          <div className="absolute inset-0 redi-vhs-static opacity-10"></div>
          
          {/* Inner content */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {type === 'writing' ? (
              // Writing exercise content
              <>
                <PencilLine className={`${styles.innerGlow} ${styles.textEffect} mb-1`} size={18} />
                <div className={`text-xs ${styles.text} ${styles.textEffect} text-center font-orbitron`}>
                  Writing
                </div>
              </>
            ) : (
              // Multiple choice content
              <>
                <div className={`text-xs ${styles.text} ${styles.textEffect} text-center font-orbitron font-bold`}>
                  LVL {level}
                </div>
                {status === 'completed' && mastery && (
                  <div className={`text-[10px] ${skillStyles.color} ${skillStyles.textShadow}`}>
                    {mastery}% MASTERY
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Animated scanline effect */}
          <div className="absolute inset-0 redi-scanlines opacity-20"></div>
        </motion.div>
        
        {/* Title and status text below the node */}
        <div className={`mt-2 px-1 py-0.5 text-xs ${styles.text} text-center max-w-24 truncate backdrop-blur-sm rounded-sm bg-synthwave-background/20`}>{title}</div>
        <div className={`px-1.5 py-0.5 text-[9px] font-bold ${status === 'locked' ? 'text-gray-600' : skillStyles.color} ${status !== 'locked' ? skillStyles.textShadow : ''} uppercase tracking-wider bg-synthwave-background/40 backdrop-blur-sm rounded-sm mt-1`}>
          {status === 'completed' && 'COMPLETED'}
          {status === 'current' && 'CURRENT'}
          {status === 'available' && 'AVAILABLE'}
          {status === 'locked' && 'LOCKED'}
        </div>
      </div>
    </div>
  );
};

export default REDIMapNode;
