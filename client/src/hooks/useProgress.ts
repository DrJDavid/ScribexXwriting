import { useProgress as useProgressContext } from '@/context/ProgressContext';

// A convenience hook to get progress information
const useProgress = () => {
  const progress = useProgressContext();
  
  // Calculate total skill mastery percentage
  const calculateTotalMastery = () => {
    if (!progress.progress) return 0;
    
    const { mechanics, sequencing, voice } = progress.progress.skillMastery;
    return Math.round((mechanics + sequencing + voice) / 3);
  };
  
  // Calculate level based on total mastery
  const calculateLevel = () => {
    const totalMastery = calculateTotalMastery();
    return Math.floor(totalMastery / 10) + 1;
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
  
  return {
    ...progress,
    totalMastery: calculateTotalMastery(),
    level: calculateLevel(),
    isExerciseCompleted,
    isQuestCompleted,
    isLocationUnlocked,
    isAchievementUnlocked,
  };
};

export default useProgress;
