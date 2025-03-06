// Define achievement interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'redi' | 'owl' | 'general'; // Which part of the app this achievement belongs to
  requirements: {
    completedExercises?: number;
    completedQuests?: number;
    rediLevel?: number;
    owlLevel?: number;
    rediSkillMastery?: {
      mechanics?: number;
      sequencing?: number;
      voice?: number;
      total?: number;
    };
    owlSkillMastery?: {
      mechanics?: number;
      sequencing?: number;
      voice?: number;
      total?: number;
    };
    specificExercises?: string[];
    specificQuests?: string[];
  };
}

// List of all achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Beginner achievements
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first exercise in REDI',
    icon: '🏆',
    requirements: {
      completedExercises: 1
    }
  },
  {
    id: 'quest-beginner',
    title: 'Novice Writer',
    description: 'Complete your first writing quest in OWL',
    icon: '✍️',
    requirements: {
      completedQuests: 1
    }
  },
  {
    id: 'mechanics-apprentice',
    title: 'Mechanics Apprentice',
    description: 'Reach 25% mastery in Mechanics skills',
    icon: '🔧',
    requirements: {
      skillMastery: {
        mechanics: 25
      }
    }
  },
  {
    id: 'sequencing-apprentice',
    title: 'Sequencing Apprentice',
    description: 'Reach 25% mastery in Sequencing skills',
    icon: '📋',
    requirements: {
      skillMastery: {
        sequencing: 25
      }
    }
  },
  {
    id: 'voice-apprentice',
    title: 'Voice Apprentice',
    description: 'Reach 25% mastery in Voice skills',
    icon: '🔊',
    requirements: {
      skillMastery: {
        voice: 25
      }
    }
  },
  
  // Intermediate achievements
  {
    id: 'exercise-enthusiast',
    title: 'Exercise Enthusiast',
    description: 'Complete 10 REDI exercises',
    icon: '🎯',
    requirements: {
      completedExercises: 10
    }
  },
  {
    id: 'quest-adept',
    title: 'Adept Writer',
    description: 'Complete 5 writing quests in OWL',
    icon: '📝',
    requirements: {
      completedQuests: 5
    }
  },
  {
    id: 'mechanics-master',
    title: 'Mechanics Master',
    description: 'Reach 75% mastery in Mechanics skills',
    icon: '⚙️',
    requirements: {
      skillMastery: {
        mechanics: 75
      }
    }
  },
  {
    id: 'sequencing-master',
    title: 'Sequencing Master',
    description: 'Reach 75% mastery in Sequencing skills',
    icon: '🔗',
    requirements: {
      skillMastery: {
        sequencing: 75
      }
    }
  },
  {
    id: 'voice-master',
    title: 'Voice Master',
    description: 'Reach 75% mastery in Voice skills',
    icon: '🎭',
    requirements: {
      skillMastery: {
        voice: 75
      }
    }
  },
  
  // Advanced achievements
  {
    id: 'all-around-writer',
    title: 'All-Around Writer',
    description: 'Reach at least 50% mastery in all three skill areas',
    icon: '🌟',
    requirements: {
      skillMastery: {
        mechanics: 50,
        sequencing: 50,
        voice: 50
      }
    }
  },
  {
    id: 'exercise-master',
    title: 'Exercise Master',
    description: 'Complete all REDI exercises in at least one skill path',
    icon: '🔥',
    requirements: {
      specificExercises: ['mechanics-1', 'mechanics-2', 'mechanics-3', 'mechanics-4', 'mechanics-5']
    }
  },
  {
    id: 'town-explorer',
    title: 'Town Explorer',
    description: 'Complete at least one quest from each unlocked location',
    icon: '🧭',
    requirements: {
      specificQuests: ['town-hall-1', 'library-1', 'music-hall-1']
    }
  },
  {
    id: 'writing-virtuoso',
    title: 'Writing Virtuoso',
    description: 'Reach 90% mastery in all three skill areas',
    icon: '👑',
    requirements: {
      skillMastery: {
        mechanics: 90,
        sequencing: 90,
        voice: 90
      }
    }
  },
  {
    id: 'master-wordsmith',
    title: 'Master Wordsmith',
    description: 'Complete at least 20 exercises and 10 quests with high mastery',
    icon: '📚',
    requirements: {
      completedExercises: 20,
      completedQuests: 10,
      skillMastery: {
        total: 80
      }
    }
  }
];

// Function to get all achievements
export const getAllAchievements = (): Achievement[] => {
  return ACHIEVEMENTS;
};

// Function to get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
};

// Function to check if achievement is unlocked based on progress
export const checkAchievementUnlocked = (
  achievementId: string,
  progress: {
    rediSkillMastery: { mechanics: number; sequencing: number; voice: number };
    owlSkillMastery: { mechanics: number; sequencing: number; voice: number };
    completedExercises: string[];
    completedQuests: string[];
    rediLevel: number;
    owlLevel: number;
  }
): boolean => {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return false;
  
  const requirements = achievement.requirements;
  const { 
    completedExercises, 
    completedQuests, 
    rediSkillMastery, 
    owlSkillMastery,
    rediLevel,
    owlLevel 
  } = progress;
  
  // Check completed exercises count
  if (requirements.completedExercises && completedExercises.length < requirements.completedExercises) {
    return false;
  }
  
  // Check completed quests count
  if (requirements.completedQuests && completedQuests.length < requirements.completedQuests) {
    return false;
  }
  
  // Check REDI level
  if (requirements.rediLevel && rediLevel < requirements.rediLevel) {
    return false;
  }
  
  // Check OWL level
  if (requirements.owlLevel && owlLevel < requirements.owlLevel) {
    return false;
  }
  
  // Check REDI skill mastery
  if (requirements.rediSkillMastery) {
    if (requirements.rediSkillMastery.mechanics && 
        rediSkillMastery.mechanics < requirements.rediSkillMastery.mechanics) {
      return false;
    }
    if (requirements.rediSkillMastery.sequencing && 
        rediSkillMastery.sequencing < requirements.rediSkillMastery.sequencing) {
      return false;
    }
    if (requirements.rediSkillMastery.voice && 
        rediSkillMastery.voice < requirements.rediSkillMastery.voice) {
      return false;
    }
    if (requirements.rediSkillMastery.total) {
      const totalMastery = (rediSkillMastery.mechanics + rediSkillMastery.sequencing + rediSkillMastery.voice) / 3;
      if (totalMastery < requirements.rediSkillMastery.total) {
        return false;
      }
    }
  }
  
  // Check OWL skill mastery
  if (requirements.owlSkillMastery) {
    if (requirements.owlSkillMastery.mechanics && 
        owlSkillMastery.mechanics < requirements.owlSkillMastery.mechanics) {
      return false;
    }
    if (requirements.owlSkillMastery.sequencing && 
        owlSkillMastery.sequencing < requirements.owlSkillMastery.sequencing) {
      return false;
    }
    if (requirements.owlSkillMastery.voice && 
        owlSkillMastery.voice < requirements.owlSkillMastery.voice) {
      return false;
    }
    if (requirements.owlSkillMastery.total) {
      const totalMastery = (owlSkillMastery.mechanics + owlSkillMastery.sequencing + owlSkillMastery.voice) / 3;
      if (totalMastery < requirements.owlSkillMastery.total) {
        return false;
      }
    }
  }
  
  // Support legacy skillMastery field (for backward compatibility)
  if ((achievement as any).requirements.skillMastery) {
    const skillMastery = (achievement as any).requirements.skillMastery;
    // Use OWL mastery as default since it's more likely to be higher for legacy achievements
    if (skillMastery.mechanics && owlSkillMastery.mechanics < skillMastery.mechanics) {
      return false;
    }
    if (skillMastery.sequencing && owlSkillMastery.sequencing < skillMastery.sequencing) {
      return false;
    }
    if (skillMastery.voice && owlSkillMastery.voice < skillMastery.voice) {
      return false;
    }
    if (skillMastery.total) {
      const totalMastery = (owlSkillMastery.mechanics + owlSkillMastery.sequencing + owlSkillMastery.voice) / 3;
      if (totalMastery < skillMastery.total) {
        return false;
      }
    }
  }
  
  // Check specific exercises
  if (requirements.specificExercises) {
    for (const exerciseId of requirements.specificExercises) {
      if (!completedExercises.includes(exerciseId)) {
        return false;
      }
    }
  }
  
  // Check specific quests
  if (requirements.specificQuests) {
    for (const questId of requirements.specificQuests) {
      if (!completedQuests.includes(questId)) {
        return false;
      }
    }
  }
  
  // All requirements met
  return true;
};
