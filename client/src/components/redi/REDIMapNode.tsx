import React from 'react';
import { motion } from 'framer-motion';
import { PencilLine, ListChecks } from 'lucide-react';

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
  // Status-based styling
  const getNodeStyles = () => {
    switch (status) {
      case 'completed':
        return {
          background: 'bg-[#6320ee]',
          border: 'border-2 border-[#39ff14]',
          text: 'text-white',
          effect: 'glow-neon',
          interaction: 'cursor-pointer'
        };
      case 'available':
        return {
          background: 'bg-[#6320ee]',
          border: 'border-2 border-white',
          text: 'text-white',
          effect: '',
          interaction: 'cursor-pointer'
        };
      case 'current':
        return {
          background: 'bg-[#6320ee]',
          border: 'border-2 border-white',
          text: 'text-white',
          effect: 'animate-pulse-glow',
          interaction: 'cursor-pointer'
        };
      case 'locked':
      default:
        return {
          background: 'bg-gray-700',
          border: 'border-2 border-gray-600',
          text: 'text-gray-400',
          effect: '',
          interaction: 'opacity-60'
        };
    }
  };

  // Type-based visual modifications
  const isWritingExercise = type === 'writing';
  
  // Different shape for writing exercises
  const nodeShape = isWritingExercise 
    ? 'rounded-lg' // Square with rounded corners for writing
    : 'rounded-full'; // Circle for multiple choice
    
  const styles = getNodeStyles();
  
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
        <motion.div
          whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
          whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
          onClick={handlePress}
          className={`w-16 h-16 ${nodeShape} ${styles.background} ${styles.border} ${styles.effect} ${styles.interaction} flex flex-col items-center justify-center shadow-lg`}
        >
          {isWritingExercise ? (
            // Writing exercise content
            <>
              <PencilLine className={`${styles.text} mb-1`} size={16} />
              <div className={`text-xs ${styles.text} text-center font-orbitron`}>
                Writing
              </div>
            </>
          ) : (
            // Multiple choice content
            <>
              <div className={`text-xs ${styles.text} text-center font-orbitron`}>
                Level {level}
                {status === 'completed' && mastery && (
                  <div className="text-[10px] text-[#39ff14]">{mastery}%</div>
                )}
              </div>
            </>
          )}
        </motion.div>
        <div className={`mt-1 text-xs ${styles.text} text-center max-w-24 truncate`}>{title}</div>
        <div className="text-[10px] text-[#39ff14]">
          {status === 'completed' && 'COMPLETED'}
          {status === 'current' && 'CURRENT'}
          {status === 'available' && 'AVAILABLE'}
          {status === 'locked' && <span className="text-gray-500">LOCKED</span>}
        </div>
      </div>
    </div>
  );
};

export default REDIMapNode;
