import React, { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { SkillMastery } from '@shared/schema';

// Define Progress type
interface Progress {
  skillMastery: SkillMastery;
  completedExercises: string[];
  completedQuests: string[];
  unlockedLocations: string[];
  currency: number;
  achievements: string[];
}

// Define context type
interface ProgressContextType {
  progress: Progress | null;
  isLoading: boolean;
  updateProgress: (update: Partial<Progress>) => Promise<void>;
  completeExercise: (exerciseId: string, isCorrect: boolean) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  unlockLocation: (locationId: string) => Promise<void>;
  addCurrency: (amount: number) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
}

// Default progress values
const defaultProgress: Progress = {
  skillMastery: {
    mechanics: 0,
    sequencing: 0,
    voice: 0,
  },
  completedExercises: [],
  completedQuests: [],
  unlockedLocations: ['townHall', 'library', 'musicHall'],
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
    onError: () => {
      console.error('Failed to load progress data');
    },
  });

  // Mutation to update progress
  const updateProgressMutation = useMutation({
    mutationFn: async (update: Partial<Progress>) => {
      const res = await apiRequest('PATCH', '/api/progress', update);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
    onError: () => {
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

  // Complete exercise
  const completeExercise = async (exerciseId: string, isCorrect: boolean) => {
    // Don't update if progress is still loading or not available
    if (!progress) return;

    // Calculate skill increase (more for correct answers)
    const skillIncrease = isCorrect ? 10 : 2;
    
    // Update based on exercise ID prefix
    let skillUpdate: Partial<SkillMastery> = {};
    
    if (exerciseId.startsWith('mechanics')) {
      skillUpdate = { mechanics: Math.min(progress.skillMastery.mechanics + skillIncrease, 100) };
    } else if (exerciseId.startsWith('sequencing')) {
      skillUpdate = { sequencing: Math.min(progress.skillMastery.sequencing + skillIncrease, 100) };
    } else if (exerciseId.startsWith('voice')) {
      skillUpdate = { voice: Math.min(progress.skillMastery.voice + skillIncrease, 100) };
    }
    
    // Only add to completed if correct
    const completed = isCorrect 
      ? [...progress.completedExercises, exerciseId].filter((x, i, a) => a.indexOf(x) === i)
      : progress.completedExercises;
    
    // Update progress
    await updateProgress({
      skillMastery: { ...progress.skillMastery, ...skillUpdate },
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

  // Complete quest
  const completeQuest = async (questId: string) => {
    if (!progress) return;
    
    // Add quest to completed list
    const completed = [...progress.completedQuests, questId].filter((x, i, a) => a.indexOf(x) === i);
    
    // Update voice skill more than other skills
    await updateProgress({
      skillMastery: {
        ...progress.skillMastery,
        voice: Math.min(progress.skillMastery.voice + 15, 100),
        sequencing: Math.min(progress.skillMastery.sequencing + 5, 100),
        mechanics: Math.min(progress.skillMastery.mechanics + 5, 100),
      },
      completedQuests: completed,
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
