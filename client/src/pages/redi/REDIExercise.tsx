import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import ExerciseMultipleChoice from '@/components/exercises/ExerciseMultipleChoice';
import ExerciseWriting from '@/components/exercises/ExerciseWriting';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getExerciseById, getExerciseNodes } from '@/data/exercises';
import { useToast } from '@/hooks/use-toast';

const REDIExercise: React.FC = () => {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const params = useParams<{ exerciseId: string }>();
  const [, navigate] = useLocation();
  const { progress, completeExercise, updateProgress } = useProgress();
  const [exerciseIndex, setExerciseIndex] = useState(1);
  const [totalExercises, setTotalExercises] = useState(5);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [exerciseSet, setExerciseSet] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  
  // Make sure REDI theme is active
  useEffect(() => {
    setTheme('redi');
  }, [setTheme]);
  
  // State to track the current exercise ID in the set
  const [currentSetExerciseId, setCurrentSetExerciseId] = useState(params.exerciseId);
  
  // Get the exercise data using the current exercise ID in the set
  const exercise = getExerciseById(currentSetExerciseId || params.exerciseId);
  
  // Generate a set of exercises for the current skill type
  useEffect(() => {
    if (exercise) {
      // Get all available exercises of the same skill type
      const nodes = getExerciseNodes(progress?.rediSkillMastery || { mechanics: 0, sequencing: 0, voice: 0 });
      const sameTypeExercises = nodes
        .filter(node => node.skillType === exercise.skillType && node.status !== 'locked')
        .map(node => node.id);
      
      // If we don't have enough exercises of this type, include some from other types
      let exerciseSelection = [...sameTypeExercises];
      if (exerciseSelection.length < 5) {
        const otherExercises = nodes
          .filter(node => node.skillType !== exercise.skillType && node.status !== 'locked')
          .map(node => node.id);
        exerciseSelection = [...exerciseSelection, ...otherExercises].slice(0, 5);
      }
      
      // Make sure the current exercise is included and is first
      exerciseSelection = exerciseSelection.filter(id => id !== exercise.id);
      exerciseSelection = [exercise.id, ...exerciseSelection].slice(0, 5);
      
      setExerciseSet(exerciseSelection);
      setTotalExercises(exerciseSelection.length);
    }
  }, [exercise, progress]);
  
  // If exercise not found, go back to map
  useEffect(() => {
    if (!exercise && params.exerciseId) {
      navigate('/redi');
    }
  }, [exercise, params.exerciseId, navigate]);
  
  if (!exercise) {
    return null;
  }
  
  // Function to update REDI skill mastery after completing a set
  const updateRediMastery = useCallback(async () => {
    if (!progress) return;
    
    // Only increase mastery if the user got at least 3/5 correct answers
    const isSuccessful = correctAnswers >= 3;
    
    if (isSuccessful) {
      // Calculate skill increase based on correct answers in the set
      const skillIncrease = Math.min(correctAnswers * 5, 20); // Cap at 20% increase per set
      
      // Create a skill update object based on the exercise type
      let updatedRediSkillMastery = { ...progress.rediSkillMastery };
      
      if (exercise.skillType === 'mechanics') {
        updatedRediSkillMastery.mechanics = Math.min(updatedRediSkillMastery.mechanics + skillIncrease, 100);
      } else if (exercise.skillType === 'sequencing') {
        updatedRediSkillMastery.sequencing = Math.min(updatedRediSkillMastery.sequencing + skillIncrease, 100);
      } else if (exercise.skillType === 'voice') {
        updatedRediSkillMastery.voice = Math.min(updatedRediSkillMastery.voice + skillIncrease, 100);
      }
      
      // Calculate new REDI level with updated mastery
      const exerciseCount = progress.completedExercises.length;
      const totalMastery = updatedRediSkillMastery.mechanics + 
                          updatedRediSkillMastery.sequencing + 
                          updatedRediSkillMastery.voice;
      const avgMastery = totalMastery / 3;
      const exerciseFactor = Math.floor(exerciseCount / 3);
      const masteryFactor = Math.floor(avgMastery / 10);
      const rediLevel = Math.max(1, Math.min(10, 1 + exerciseFactor + masteryFactor));
      
      // Update progress with new mastery and level
      // Use the updateProgress function from the hook, not as a method on progress
      await updateProgress({
        rediSkillMastery: updatedRediSkillMastery,
        rediLevel,
      });
      
      toast({
        title: "Exercise Set Completed!",
        description: `You got ${correctAnswers} out of ${totalExercises} correct. Your ${exercise.skillType} mastery increased by ${skillIncrease}%.`,
      });
    } else {
      // No mastery increase if they didn't get enough correct
      toast({
        title: "Exercise Set Attempted",
        description: `You got ${correctAnswers} out of ${totalExercises} correct. You need at least 3 correct to increase mastery.`,
      });
    }
  }, [correctAnswers, totalExercises, exercise.skillType, progress, toast, updateProgress]);

  // Function to handle advancing to next exercise
  const advanceToNextExercise = useCallback(() => {
    // If we've completed all exercises in the set
    if (exerciseIndex >= totalExercises) {
      // Update mastery only after completing the full set
      updateRediMastery().then(() => {
        // Mark original exercise ID as completed
        if (params.exerciseId && completeExercise) {
          // Consider set completed successfully if at least 3 out of 5 correct
          const isSuccessful = correctAnswers >= 3;
          completeExercise(params.exerciseId, isSuccessful);
          
          toast({
            title: isSuccessful ? "Node Completed!" : "Node Attempted",
            description: isSuccessful 
              ? `You got ${correctAnswers} out of ${totalExercises} correct! Node mastery unlocked.` 
              : `You got ${correctAnswers} out of ${totalExercises} correct. Try again for better mastery.`,
          });
        }
        
        // Navigate back to the REDI map after updating mastery
        navigate('/redi');
      });
      return;
    }
    
    // Otherwise, go to the next exercise in the set
    const nextExerciseId = exerciseSet[exerciseIndex]; // 0-indexed array, 1-indexed display
    if (nextExerciseId) {
      // Reset submission state
      setHasSubmitted(false);
      setAnsweredCorrectly(false);
      
      // Increment exercise index
      setExerciseIndex(exerciseIndex + 1);
      
      // We don't navigate - just update the current exercise ID in the set
      // This keeps us on the same page but with new exercise content
      const exercise = getExerciseById(nextExerciseId);
      if (exercise) {
        setCurrentSetExerciseId(nextExerciseId);
      } else {
        // Fallback if exercise not found
        navigate('/redi');
      }
    } else {
      // Fallback if we don't have a next exercise
      navigate('/redi');
    }
  }, [exerciseIndex, totalExercises, exerciseSet, navigate, updateRediMastery, params.exerciseId, completeExercise, correctAnswers, toast]);
  
  // Handle multiple choice submission
  const handleMultipleChoiceSubmit = (exerciseId: string, selectedOption: number, isCorrect: boolean) => {
    console.log("handleMultipleChoiceSubmit called", { exerciseId, selectedOption, isCorrect, hasSubmitted });
    
    // This function is called by both the initial submission and the continue button
    if (hasSubmitted) {
      // If already submitted, advance to next exercise
      console.log("Already submitted, advancing to next exercise");
      advanceToNextExercise();
      return;
    }
    
    // First submission - just track the state but don't advance yet
    console.log("First submission - tracking state");
    setAnsweredCorrectly(isCorrect);
    setHasSubmitted(true);
    
    // Record total correct answers for the exercise set
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      
      toast({
        title: "Correct!",
        description: "Great job! Click Continue to proceed.",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "That's okay! Click Continue to proceed.",
      });
    }
    
    // We'll only mark the original exercise as completed after finishing the full set
    // This is handled in updateRediMastery
  };
  
  // Handle writing submission
  const handleWritingSubmit = (exerciseId: string, response: string, isComplete: boolean) => {
    console.log("handleWritingSubmit called", { exerciseId, response: response.substring(0, 20), isComplete, hasSubmitted });
    
    if (hasSubmitted) {
      // If already submitted, advance to next exercise
      console.log("Already submitted writing, advancing to next exercise");
      advanceToNextExercise();
      return;
    }
    
    // Track if answered correctly (meets requirements)
    console.log("First writing submission - tracking state");
    setAnsweredCorrectly(isComplete);
    setHasSubmitted(true);
    
    // Record total correct answers for the exercise set
    if (isComplete) {
      setCorrectAnswers(prev => prev + 1);
      
      toast({
        title: "Exercise Complete!",
        description: "Your submission meets the requirements. Click Continue to proceed.",
      });
    } else {
      toast({
        title: "Requirements Not Met",
        description: "Your submission doesn't meet all requirements yet. Click Continue to proceed anyway.",
      });
    }
    
    // We'll only mark the original exercise as completed after finishing the full set
    // This is handled in updateRediMastery
  };
  
  // Handle continue button
  const handleContinue = () => {
    advanceToNextExercise();
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/redi');
  };

  // Determine if this is a writing exercise
  const isWritingExercise = exercise.type === 'writing';

  return (
    <MainLayout 
      title={exercise.title} 
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="text-gray-300 text-sm mb-4">
        Exercise {exerciseIndex} of {totalExercises}
      </div>
      
      {isWritingExercise ? (
        // Render writing exercise component
        <ExerciseWriting
          exerciseId={exercise.id}
          title={exercise.title}
          instructions={exercise.instructions}
          content={exercise.content}
          prompt={exercise.prompt || ''}
          minWordCount={exercise.minWordCount || 50}
          exampleResponse={exercise.exampleResponse}
          onSubmit={handleWritingSubmit}
        />
      ) : (
        // Render multiple choice component
        <ExerciseMultipleChoice
          exerciseId={exercise.id}
          title={exercise.title}
          instructions={exercise.instructions}
          content={exercise.content}
          options={exercise.options || []}
          correctOptionIndex={exercise.correctOptionIndex || 0}
          onSubmit={handleMultipleChoiceSubmit}
        />
      )}
      
      {/* Continue button - only shown after answering */}
      {hasSubmitted && (
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleContinue}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-all
            ${answeredCorrectly 
              ? 'bg-green-600 hover:bg-green-500' 
              : 'bg-violet-600 hover:bg-violet-500'} 
            flex items-center gap-2 shadow-lg hover:shadow-xl`}
          >
            Continue
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      )}
      
      {/* Exercise progress */}
      <div className="mt-8">
        <div className="flex justify-between mb-2 text-gray-300 text-sm">
          <span>Progress</span>
          <span>{exerciseIndex} of {totalExercises}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full"
            style={{ width: `${(exerciseIndex / totalExercises) * 100}%` }}
          ></div>
        </div>
      </div>
    </MainLayout>
  );
};

export default REDIExercise;
