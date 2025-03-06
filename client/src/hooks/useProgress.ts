import { useProgress as useProgressContext } from '@/context/ProgressContext';

// A convenience hook to get progress information
const useProgress = () => {
  const progress = useProgressContext();
  
  // Calculate total REDI skill mastery percentage
  const calculateREDIMastery = () => {
    if (!progress.progress) return 0;
    
    const { mechanics, sequencing, voice } = progress.progress.rediSkillMastery;
    return Math.round((mechanics + sequencing + voice) / 3);
  };
  
  // Calculate total OWL skill mastery percentage
  const calculateOWLMastery = () => {
    if (!progress.progress) return 0;
    
    const { mechanics, sequencing, voice } = progress.progress.owlSkillMastery;
    return Math.round((mechanics + sequencing + voice) / 3);
  };
  
  // Get REDI level
  const getREDILevel = () => {
    if (!progress.progress) return 1;
    return progress.progress.rediLevel;
  };
  
  // Get OWL level
  const getOWLLevel = () => {
    if (!progress.progress) return 1;
    return progress.progress.owlLevel;
  };
  
  // Check if an exercise is completed
  const isExerciseCompleted = (exerciseId: string) => {
    return progress.progress?.completedExercises.includes(exerciseId) || false;
  };
  
  // Check if a quest is completed
  const isQuestCompleted = (questId: string) => {
    return progress.progress?.completedQuests.includes(questId) || false;
  };
  
  // Check if a location is unlocked
  const isLocationUnlocked = (locationId: string) => {
    return progress.progress?.unlockedLocations.includes(locationId) || false;
  };
  
  // Check if an achievement is unlocked
  const isAchievementUnlocked = (achievementId: string) => {
    return progress.progress?.achievements.includes(achievementId) || false;
  };
  
  // For backward compatibility
  const calculateTotalMastery = () => {
    return calculateREDIMastery();
  };
  
  // For backward compatibility
  const calculateLevel = () => {
    return getREDILevel();
  };
  
  // Update streak function
  const updateStreak = async (completed: boolean) => {
    try {
      // Use apiRequest directly to update the streak
      const response = await fetch('/api/streak/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update streak');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating streak:", error);
      return { currentStreak: 0, longestStreak: 0 };
    }
  };

  return {
    ...progress,
    rediMastery: calculateREDIMastery(),
    owlMastery: calculateOWLMastery(),
    rediLevel: getREDILevel(),
    owlLevel: getOWLLevel(),
    // Keep these for backward compatibility
    totalMastery: calculateTotalMastery(),
    level: calculateLevel(),
    // Utility functions
    isExerciseCompleted,
    isQuestCompleted,
    isLocationUnlocked,
    isAchievementUnlocked,
    // Streak management
    updateStreak
  };
};

export default useProgress;
