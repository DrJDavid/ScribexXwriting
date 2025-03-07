import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { SkillMastery } from '@shared/schema';
import { Progress } from '@/types';

interface ProgressContextType {
  progress: Progress | null;
  isLoading: boolean;
  updateProgress: (update: Partial<Progress>) => Promise<void>;
  completeExercise: (exerciseId: string, isCorrect: boolean) => Promise<any>;
  completeQuest: (questId: string, skillsGained?: SkillMastery) => Promise<void>;
  unlockLocation: (locationId: string) => Promise<void>;
  addCurrency: (amount: number) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  calculateRediLevel: (mastery: SkillMastery, completedExercises: string[]) => number;
  calculateOwlLevel: (mastery: SkillMastery, completedQuests: string[]) => number;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<Progress | null>(null);

  // Fetch progress data
  const { data, isLoading } = useQuery<Progress>({
    queryKey: ['/api/progress'],
    refetchOnWindowFocus: false,
  });

  // Update local state when data changes
  useEffect(() => {
    if (data) {
      setProgress(data);
    }
  }, [data]);

  // Mutation to update progress
  const mutation = useMutation({
    mutationFn: async (update: Partial<Progress>) => {
      return await apiRequest('/api/progress', 'PATCH', update);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      if (data) {
        setProgress(data as Progress);
      }
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
  const updateProgress = async (update: Partial<Progress>): Promise<void> => {
    await mutation.mutateAsync(update);
  };

  // Calculate REDI level
  const calculateRediLevel = (mastery: SkillMastery, completedExercises: string[]): number => {
    const avgMastery = (mastery.mechanics + mastery.sequencing + mastery.voice) / 3;
    const exerciseFactor = Math.floor(completedExercises.length / 3);
    const masteryFactor = Math.floor(avgMastery / 10);
    return Math.max(1, Math.min(10, 1 + exerciseFactor + masteryFactor));
  };

  // Calculate OWL level
  const calculateOwlLevel = (mastery: SkillMastery, completedQuests: string[]): number => {
    const avgMastery = (mastery.mechanics + mastery.sequencing + mastery.voice) / 3;
    const questFactor = Math.floor(completedQuests.length / 2);
    const masteryFactor = Math.floor(avgMastery / 15);
    return Math.max(1, Math.min(10, 1 + questFactor + masteryFactor));
  };

  // Complete exercise
  const completeExercise = async (exerciseId: string, isCorrect: boolean) => {
    if (!progress) return null;
    
    // Only add to completed if correct
    const completed = isCorrect 
      ? [...progress.completedExercises, exerciseId].filter((x, i, a) => a.indexOf(x) === i)
      : progress.completedExercises;
    
    // Check if node completion
    const isNodeCompletion = exerciseId.includes('-') && !exerciseId.includes('-q');
    
    // Basic update
    const updateObject: Partial<Progress> = {
      completedExercises: completed,
      currency: progress.currency + (isCorrect ? 5 : 1),
    };
    
    // Handle skill mastery for node completion
    if (isNodeCompletion && isCorrect) {
      const skillIncreases = {
        mechanics: exerciseId.includes('mechanics') ? 10 : 0,
        sequencing: exerciseId.includes('sequencing') ? 10 : 0,
        voice: exerciseId.includes('voice') ? 10 : 0
      };
      
      const updatedRediSkillMastery = {
        mechanics: Math.min(progress.rediSkillMastery.mechanics + skillIncreases.mechanics, 100),
        sequencing: Math.min(progress.rediSkillMastery.sequencing + skillIncreases.sequencing, 100),
        voice: Math.min(progress.rediSkillMastery.voice + skillIncreases.voice, 100),
      };
      
      const rediLevel = calculateRediLevel(updatedRediSkillMastery, completed);
      
      updateObject.rediSkillMastery = updatedRediSkillMastery;
      updateObject.rediLevel = rediLevel;
    }
    
    try {
      const result = await mutation.mutateAsync(updateObject);
      
      if (isCorrect) {
        if (isNodeCompletion) {
          toast({
            title: 'Exercise Node Completed!',
            description: 'Great job! You\'ve mastered this node and earned 5 stars!',
          });
        } else {
          toast({
            title: 'Exercise Completed',
            description: 'You earned 5 stars!',
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error in completeExercise:", error);
      return null;
    }
  };

  // Complete quest
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

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoading,
        updateProgress,
        completeExercise,
        completeQuest,
        unlockLocation,
        addCurrency,
        unlockAchievement,
        calculateRediLevel,
        calculateOwlLevel
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
