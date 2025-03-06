import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, ChevronRight } from 'lucide-react';

export type LocationStatus = 'locked' | 'unlocked';

interface OWLMapLocationProps {
  id: string;
  name: string;
  description?: string;
  icon: React.ReactNode;
  status: LocationStatus;
  position: { x: number; y: number };
  onPress: (id: string) => void;
  onHover?: (id: string | null) => void;
}

const OWLMapLocation: React.FC<OWLMapLocationProps> = ({
  id,
  name,
  description,
  icon,
  status,
  position,
  onPress,
  onHover,
}) => {
  const isUnlocked = status === 'unlocked';
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Generate a unique random animation delay for natural movement
  const animationDelay = Math.random() * 2;
  
  // Status-based styling with botanical futurism aesthetic
  const styles = isUnlocked 
    ? {
        container: 'group',
        background: 'bg-gradient-to-br from-emerald-700/90 to-teal-900/90 backdrop-filter backdrop-blur-md',
        border: 'border-2 border-emerald-500/70',
        text: 'text-emerald-50',
        nameText: 'text-emerald-100 font-botanical font-medium',
        effect: 'shadow-glow-emerald',
        interaction: 'cursor-pointer',
        iconContainer: 'bg-gradient-to-br from-emerald-600 to-teal-800 rounded-xl shadow-inner p-1',
        hoverEffect: 'group-hover:border-amber-300/70 group-hover:shadow-glow-gold',
        hoverRing: 'opacity-0 group-hover:opacity-70',
        pulseEffect: 'animate-pulse-slow',
        labelBackground: 'bg-gradient-to-r from-emerald-900/90 to-teal-900/90 backdrop-blur-md',
        labelBorder: 'border-b border-emerald-500/30',
      }
    : {
        container: 'filter grayscale',
        background: 'bg-gray-800/80 backdrop-filter backdrop-blur-md',
        border: 'border-2 border-gray-700/50',
        text: 'text-gray-400',
        nameText: 'text-gray-400 font-medium',
        effect: '',
        interaction: 'opacity-70 cursor-not-allowed',
        iconContainer: 'bg-gray-700 rounded-xl',
        hoverEffect: '',
        hoverRing: 'opacity-0',
        pulseEffect: '',
        labelBackground: 'bg-gray-900/80 backdrop-blur-md',
        labelBorder: 'border-b border-gray-700/30',
      };
  
  const handlePress = () => {
    if (isUnlocked) {
      setIsAnimating(true);
      // Delay navigation to allow animation to play
      setTimeout(() => {
        onPress(id);
      }, 600);
    }
  };
  
  const handleMouseEnter = () => {
    if (onHover) onHover(id);
  };
  
  const handleMouseLeave = () => {
    if (onHover) onHover(null);
  };

  return (
    <div 
      className={`absolute transition-all duration-500 ${styles.container}`}
      style={{ top: position.y, left: position.x }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col items-center relative">
        {/* Animated hover ring for unlocked locations */}
        {isUnlocked && (
          <div className={`absolute inset-[-5px] rounded-full border-2 border-amber-300/30 
            ${styles.hoverRing} transition-opacity duration-300`}>
          </div>
        )}
        
        {/* Main location button */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ 
            y: [0, -6, 0],
            scale: isAnimating ? [1, 0.9, 0.7] : 1, 
            opacity: isAnimating ? [1, 0.8, 0] : 1,
          }}
          transition={{ 
            y: { 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: animationDelay,
            },
            scale: { duration: 0.5 },
            opacity: { duration: 0.5 },
          }}
          whileHover={isUnlocked ? { scale: 1.1, y: -8 } : {}}
          whileTap={isUnlocked ? { scale: 0.95, y: -2 } : {}}
          onClick={handlePress}
          className={`w-24 h-24 rounded-2xl p-2 ${styles.background} ${styles.border} ${styles.effect} ${styles.interaction} 
            ${styles.hoverEffect} flex flex-col items-center justify-center transition-all duration-300 transform relative overflow-hidden`}
        >
          {/* Interior glow */}
          {isUnlocked && (
            <div className="absolute inset-0 bg-gradient-radial from-emerald-400/10 via-transparent to-transparent"></div>
          )}
          
          {/* Border highlight effects */}
          <div className="absolute top-0 left-0 w-10 h-[1px] bg-white/20"></div>
          <div className="absolute top-0 left-0 w-[1px] h-10 bg-white/20"></div>
          <div className="absolute bottom-0 right-0 w-10 h-[1px] bg-white/20"></div>
          <div className="absolute bottom-0 right-0 w-[1px] h-10 bg-white/20"></div>
          
          {/* Patterned background for visual richness */}
          <div className="absolute inset-0 bg-botanical-pattern opacity-10"></div>
          
          {/* Icon container */}
          <div className={`relative z-10 mb-1 p-2 rounded-xl ${styles.iconContainer}`}>
            <div className="relative">
              {icon}
              
              {/* Sparkle effect for unlocked locations */}
              {isUnlocked && (
                <motion.div 
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles size={14} className="text-amber-300" />
                </motion.div>
              )}
              
              {/* Lock icon for locked locations */}
              {!isUnlocked && (
                <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1">
                  <Lock size={12} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          {/* Location name */}
          <span className={`text-xs ${styles.nameText} text-center leading-tight max-w-[80px]`}>
            {name}
          </span>
          
          {/* Visit button for unlocked locations */}
          {isUnlocked && (
            <div className="mt-1 flex items-center bg-emerald-800/40 rounded-full px-2 py-0.5 text-[10px] text-emerald-300 group-hover:bg-amber-900/50 group-hover:text-amber-200 transition-colors duration-300">
              <span>Visit</span>
              <ChevronRight size={10} className="ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          )}
        </motion.div>
        
        {/* Optional description tooltip */}
        {description && (
          <div className={`mt-2 px-2 py-1 text-[10px] ${styles.text} text-center max-w-[120px] 
            rounded-md ${styles.labelBackground} ${styles.labelBorder} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default OWLMapLocation;
