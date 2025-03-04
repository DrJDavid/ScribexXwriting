// Define achievement interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirements: {
    completedExercises?: number;
    completedQuests?: number;
    skillMastery?: {
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
    skillMastery: { mechanics: number; sequencing: number; voice: number };
    completedExercises: string[];
    completedQuests: string[];
  }
): boolean => {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return false;
  
  const requirements = achievement.requirements;
  const { completedExercises, completedQuests, skillMastery } = progress;
  
  // Check completed exercises count
  if (requirements.completedExercises && completedExercises.length < requirements.completedExercises) {
    return false;
  }
  
  // Check completed quests count
  if (requirements.completedQuests && completedQuests.length < requirements.completedQuests) {
    return false;
  }
  
  // Check skill mastery
  if (requirements.skillMastery) {
    if (requirements.skillMastery.mechanics && skillMastery.mechanics < requirements.skillMastery.mechanics) {
      return false;
    }
    if (requirements.skillMastery.sequencing && skillMastery.sequencing < requirements.skillMastery.sequencing) {
      return false;
    }
    if (requirements.skillMastery.voice && skillMastery.voice < requirements.skillMastery.voice) {
      return false;
    }
    if (requirements.skillMastery.total) {
      const totalMastery = (skillMastery.mechanics + skillMastery.sequencing + skillMastery.voice) / 3;
      if (totalMastery < requirements.skillMastery.total) {
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
