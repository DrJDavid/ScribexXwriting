import React from 'react';
import { motion } from 'framer-motion';

export type LocationStatus = 'locked' | 'unlocked';

interface OWLMapLocationProps {
  id: string;
  name: string;
  description?: string;
  icon: React.ReactNode;
  status: LocationStatus;
  position: { x: number; y: number };
  onPress: (id: string) => void;
}

const OWLMapLocation: React.FC<OWLMapLocationProps> = ({
  id,
  name,
  description,
  icon,
  status,
  position,
  onPress,
}) => {
  const isUnlocked = status === 'unlocked';
  
  // Status-based styling
  const styles = isUnlocked 
    ? {
        background: 'bg-[#3cb371]',
        border: 'border-2 border-[#ffd700]',
        text: 'text-white',
        effect: 'glow-forest',
        interaction: 'cursor-pointer'
      }
    : {
        background: 'bg-gray-600',
        border: 'border-2 border-gray-500',
        text: 'text-gray-300',
        effect: '',
        interaction: 'opacity-70'
      };
  
  const handlePress = () => {
    if (isUnlocked) {
      onPress(id);
    }
  };

  return (
    <div 
      className="absolute" 
      style={{ top: position.y, left: position.x }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={isUnlocked ? { scale: 1.05 } : {}}
          whileTap={isUnlocked ? { scale: 0.95 } : {}}
          onClick={handlePress}
          className={`w-20 h-20 rounded-xl ${styles.background} ${styles.border} ${styles.effect} ${styles.interaction} flex items-center justify-center shadow-md`}
        >
          <div className="text-center">
            {icon}
          </div>
        </motion.div>
        <div className={`mt-1 text-xs ${styles.text} font-montserrat`}>
          {name} {!isUnlocked && <span className="text-[10px]">(Locked)</span>}
        </div>
        {description && isUnlocked && (
          <div className="text-[10px] text-gray-200 text-center max-w-[120px]">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default OWLMapLocation;
