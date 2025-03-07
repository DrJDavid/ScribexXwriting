import React, { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { SkillMastery } from '@shared/schema';

// Define Progress type with separate REDI and OWL stats
interface Progress {
  rediSkillMastery: SkillMastery;
  owlSkillMastery: SkillMastery;
  completedExercises: string[];
  completedQuests: string[];
  unlockedLocations: string[];
  rediLevel: number;
  owlLevel: number;
  currency: number;
  achievements: string[];
}

// Define context type with extended methods
interface ProgressContextType {
  progress: Progress | null;
  isLoading: boolean;
  updateProgress: (update: Partial<Progress>) => Promise<void>;
  completeExercise: (exerciseId: string, isCorrect: boolean) => Promise<void>;
  completeQuest: (questId: string, skillsGained?: SkillMastery) => Promise<void>;
  unlockLocation: (locationId: string) => Promise<void>;
  addCurrency: (amount: number) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  calculateRediLevel: (mastery: SkillMastery, completedExercises: string[]) => number;
  calculateOwlLevel: (mastery: SkillMastery, completedQuests: string[]) => number;
}

// Default progress values
const defaultProgress: Progress = {
  rediSkillMastery: {
    mechanics: 0,
    sequencing: 0,
    voice: 0,
  },
  owlSkillMastery: {
    mechanics: 0,
    sequencing: 0,
    voice: 0,
  },
  completedExercises: [],
  completedQuests: [],
  unlockedLocations: ['townHall', 'library', 'musicHall'],
  rediLevel: 1,
  owlLevel: 1,
  currency: 0,
  achievements: [],
};

// Create context
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch progress
  const { data: progress, isLoading } = useQuery<Progress>({
    queryKey: ['/api/progress'],
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    staleTime: 2 * 60 * 1000, // 2 minutes before refetching
    retry: 3,
    onSuccess: (data) => {
      console.log('Progress data loaded successfully');
    },
    onError: (error) => {
      console.error('Failed to load progress data', error);
    },
  } as any);

  // Mutation to update progress
  const updateProgressMutation = useMutation({
    mutationFn: async (update: Partial<Progress>) => {
      return await apiRequest('/api/progress', 'PATCH', update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
    onError: (error) => {
      console.error("Error updating progress:", error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
    },
  });

  // Update progress
  const updateProgress = async (update: Partial<Progress>) => {
    await updateProgressMutation.mutateAsync(update);
  };

  // Calculate REDI level based on mastery and completed exercises
  const calculateRediLevel = (mastery: SkillMastery, completedExercises: string[]): number => {
    // Calculate average mastery
    const averageMastery = (mastery.mechanics + mastery.sequencing + mastery.voice) / 3;
    // Calculate level based on mastery and number of completed exercises
    // Base level on both average mastery and number of exercises completed
    const exerciseFactor = Math.floor(completedExercises.length / 3); // Every 3 exercises increases level
    const masteryFactor = Math.floor(averageMastery / 10); // Every 10% average mastery increases level
    return Math.max(1, Math.min(10, 1 + exerciseFactor + masteryFactor)); // Cap at level 10
  };

  // Calculate OWL level based on mastery and completed quests
  const calculateOwlLevel = (mastery: SkillMastery, completedQuests: string[]): number => {
    // Calculate average mastery
    const averageMastery = (mastery.mechanics + mastery.sequencing + mastery.voice) / 3;
    // Calculate level based on mastery and number of completed quests
    // OWL level is more dependent on quest completion than pure mastery
    const questFactor = Math.floor(completedQuests.length / 2); // Every 2 quests increases level
    const masteryFactor = Math.floor(averageMastery / 15); // Every 15% average mastery increases level
    return Math.max(1, Math.min(10, 1 + questFactor + masteryFactor)); // Cap at level 10
  };

  // Complete exercise - now updates REDI-specific skills
  // This function now only adds the exercise to completed and earns currency
  // Mastery calculation happens when completing sets of exercises in REDIExercise.tsx
  const completeExercise = async (exerciseId: string, isCorrect: boolean) => {
    // Don't update if progress is still loading or not available
    if (!progress) return;
    
    // Only add to completed if correct
    const completed = isCorrect 
      ? [...progress.completedExercises, exerciseId].filter((x, i, a) => a.indexOf(x) === i)
      : progress.completedExercises;
    
    // Update progress - just adding to completed exercises and currency
    // Mastery calculation is done in the exercise component when full sets are completed
    await updateProgress({
      completedExercises: completed,
      currency: progress.currency + (isCorrect ? 5 : 1),
    });
    
    if (isCorrect) {
      toast({
        title: 'Exercise Completed',
        description: 'You earned 5 stars!',
      });
    }
  };

  // Complete quest - now updates OWL-specific skills
  const completeQuest = async (questId: string, skillsGained?: SkillMastery) => {
    if (!progress) return;
    
    // Add quest to completed list
    const completed = [...progress.completedQuests, questId].filter((x, i, a) => a.indexOf(x) === i);
    
    // Default skill increases if not provided
    const skillIncreases = skillsGained || {
      voice: 15,
      sequencing: 5,
      mechanics: 5,
    };
    
    // Create updated OWL skill mastery
    const updatedOwlSkillMastery = {
      mechanics: Math.min(progress.owlSkillMastery.mechanics + skillIncreases.mechanics, 100),
      sequencing: Math.min(progress.owlSkillMastery.sequencing + skillIncreases.sequencing, 100),
      voice: Math.min(progress.owlSkillMastery.voice + skillIncreases.voice, 100),
    };
    
    // Calculate new OWL level
    const owlLevel = calculateOwlLevel(updatedOwlSkillMastery, completed);
    
    // Update progress
    await updateProgress({
      owlSkillMastery: updatedOwlSkillMastery,
      completedQuests: completed,
      owlLevel,
      currency: progress.currency + 15,
    });
    
    toast({
      title: 'Quest Completed',
      description: 'You earned 15 stars!',
    });
  };

  // Unlock location
  const unlockLocation = async (locationId: string) => {
    if (!progress) return;
    
    const unlocked = [...progress.unlockedLocations, locationId].filter((x, i, a) => a.indexOf(x) === i);
    
    await updateProgress({
      unlockedLocations: unlocked,
    });
    
    toast({
      title: 'New Location Unlocked',
      description: 'You can now explore a new area!',
    });
  };

  // Add currency
  const addCurrency = async (amount: number) => {
    if (!progress) return;
    
    await updateProgress({
      currency: progress.currency + amount,
    });
  };

  // Unlock achievement
  const unlockAchievement = async (achievementId: string) => {
    if (!progress) return;
    
    // Check if already unlocked
    if (progress.achievements.includes(achievementId)) return;
    
    const achievements = [...progress.achievements, achievementId];
    
    await updateProgress({
      achievements,
      currency: progress.currency + 10, // Bonus for achievement
    });
    
    toast({
      title: 'Achievement Unlocked!',
      description: 'You earned a new achievement and 10 stars!',
    });
  };

  // Context value
  const value = {
    progress: progress || defaultProgress,
    isLoading,
    updateProgress,
    completeExercise,
    completeQuest,
    unlockLocation,
    addCurrency,
    unlockAchievement,
    calculateRediLevel,
    calculateOwlLevel
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

// Custom hook to use progress context
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
