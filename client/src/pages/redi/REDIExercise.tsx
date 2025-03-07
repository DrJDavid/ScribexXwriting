import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  
  // Track if we've already mounted this component to avoid state resets
  const componentMounted = useRef(false);
  // Store exercise set in a ref to preserve it between renders
  const exerciseSetRef = useRef<string[]>([]);
  // exerciseIndex is 1-based (for display/UI purposes)
  // But when we use it as an index into the 0-based exerciseSet array,
  // we need to handle the conversion carefully
  // Start at 1 for the first exercise (0-indexed in array would be 0)
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
  // Initialize with the URL parameter exerciseId
  const [currentSetExerciseId, setCurrentSetExerciseId] = useState<string>(params.exerciseId || "");
  
  console.log("Current state:", { 
    currentSetExerciseId,
    paramsExerciseId: params.exerciseId,
    exerciseIndex, 
    totalExercises,
    hasSubmitted
  });
  
  // Get the exercise data using the current exercise ID in the set
  const exercise = getExerciseById(currentSetExerciseId || params.exerciseId || "");
  
  // Track component mounting and set up event listeners
  useEffect(() => {
    console.log("Component mount effect running, mounted=", componentMounted.current);
    
    // Only run this once when component mounts
    if (!componentMounted.current) {
      console.log("📱 Component has mounted for the first time");
      componentMounted.current = true;
      
      // Setup event listener for custom continue events from child components
      const handleContinueEvent = (event: Event) => {
        const { exerciseId, selectedOption, isCorrect, response, isComplete } = (event as CustomEvent).detail;
        console.log("📢 Received exercise:continue event:", (event as CustomEvent).detail);
        
        // Determine which type of exercise is continuing
        if (response !== undefined) {
          // It's a writing exercise
          console.log("✍️ Processing writing continue event");
          setHasSubmitted(true);
          setAnsweredCorrectly(true); // Writing exercises are always considered "correct"
          
          // Increment correct answers
          setCorrectAnswers(prev => prev + 1);
          
          // Show success toast
          toast({
            title: "Exercise Complete!",
            description: "Your submission meets the requirements. Proceeding to next exercise..."
          });
          
          // Wait a moment before continuing to next exercise
          setTimeout(() => handleContinue(), 500);
          
        } else if (selectedOption !== undefined) {
          // It's a multiple choice exercise
          console.log("🔢 Processing multiple choice continue event");
          setHasSubmitted(true);
          setAnsweredCorrectly(isCorrect);
          
          // Record total correct answers for the exercise set
          if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
            
            toast({
              title: "Correct!",
              description: "Great job! Proceeding to next exercise..."
            });
          } else {
            toast({
              title: "Not quite right",
              description: "That's okay! Proceeding to next exercise..."
            });
          }
          
          // Wait a moment before continuing to next exercise
          setTimeout(() => handleContinue(), 500);
        }
      };
      
      // Add the event listener
      window.addEventListener('exercise:continue', handleContinueEvent);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('exercise:continue', handleContinueEvent);
      };
    }
    
    // Cleanup when component unmounts
    return () => {
      console.log("📴 Component is unmounting");
      componentMounted.current = false;
    };
  }, []);
  
  // Generate a set of exercises for the current skill type - only on first load
  useEffect(() => {
    if (exercise) {
      // Only regenerate if we don't have a set already OR if we're starting a new exercise
      if (exerciseSet.length === 0 || exercise.id !== exerciseSet[0]) {
        console.log("🎲 Generating exercise set for:", exercise.id);
        
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
        
        console.log("🎯 Setting initial exercise set:", exerciseSelection);
        
        // Store exercise set in both state and ref
        exerciseSetRef.current = exerciseSelection;
        setExerciseSet(exerciseSelection);
        setTotalExercises(exerciseSelection.length);
        
        // Reset to first exercise when starting a new set
        // This ensures the index is correct for the current set
        if (exercise.id === exerciseSelection[0] && exerciseIndex !== 1) {
          console.log("Resetting exercise index to 1 for new set");
          setExerciseIndex(1);
          setCorrectAnswers(0);
          setHasSubmitted(false);
        }
      } else {
        console.log("Using existing exercise set:", exerciseSet);
      }
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
    console.log("⚡ advanceToNextExercise called", { exerciseIndex, totalExercises, exerciseSet });
    
    // If we've completed all exercises in the set
    if (exerciseIndex >= totalExercises) {
      console.log("🎮 All exercises in set completed, updating mastery...");
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
        console.log("🗺️ Navigating back to REDI map");
        navigate('/redi');
      });
      return;
    }
    
    // Otherwise, go to the next exercise in the set
    // IMPORTANT - We need to calculate the array index from the exerciseIndex
    // Since exerciseIndex is 1-based (for UI) and arrays are 0-based,
    // the NEXT exercise is at index equal to exerciseIndex
    // (since exerciseIndex = 1 means first element at array[0], so next is at array[1])
    console.log("ENTIRE EXERCISE SET:", exerciseSet);
    console.log("EXERCISE SET FROM REF:", exerciseSetRef.current);
    
    // Use the exercise set from the ref to ensure consistency
    const combinedSet = exerciseSet.length > 0 ? exerciseSet : exerciseSetRef.current;
    
    // Directly get the next exercise without complicated calculations
    const nextExerciseId = combinedSet[exerciseIndex]; // Using the 1-indexed value directly
    console.log("🔄 Going to next exercise", { 
      currentExerciseIndex: exerciseIndex - 1, // For display only
      nextExerciseIndex: exerciseIndex,  // For display only
      nextExerciseId,
      remainingExercises: exerciseSet.slice(exerciseIndex)
    });
    
    if (nextExerciseId) {
      // First reset submission state to prepare for the next exercise
      setHasSubmitted(false);
      setAnsweredCorrectly(false);
      
      // Get the next exercise details
      const nextExercise = getExerciseById(nextExerciseId);
      
      if (nextExercise) {
        console.log("✅ Found next exercise:", nextExercise.title);
        
        // Update the exercise ID - this triggers a re-render with the new exercise 
        setCurrentSetExerciseId(nextExerciseId);
        
        // Then increment the exercise index for UI display and next iteration
        setExerciseIndex(prevIndex => prevIndex + 1);
        console.log("📊 Progress updated to", exerciseIndex + 1, "of", totalExercises);
      } else {
        console.log("❌ Next exercise not found, going back to map");
        navigate('/redi');
      }
    } else {
      console.log("❌ No next exercise in set, going back to map");
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
  
  // Handle continue button - directly advance to next exercise
  const handleContinue = () => {
    // This is a critical function called when clicking Continue
    console.log("⏭️ Continue button clicked, hasSubmitted:", hasSubmitted);
    
    // Get the actual next exercise ID directly from the set
    // Use refs to ensure we have the most stable data
    const nextExerciseId = exerciseSetRef.current[exerciseIndex];
    console.log("🎮 Next exercise from continue:", nextExerciseId);
    
    // If the next exercise exists, update state
    if (nextExerciseId) {
      setHasSubmitted(false);
      setAnsweredCorrectly(false);
      
      // Update the current exercise ID
      setCurrentSetExerciseId(nextExerciseId);
      
      // Increment exercise index
      setExerciseIndex(exerciseIndex + 1);
      
      console.log("Continue button advancing to:", nextExerciseId);
    } else {
      // If we've completed all exercises
      console.log("Set completed via continue button");
      updateRediMastery().then(() => {
        // Mark original exercise as completed
        if (params.exerciseId && completeExercise) {
          completeExercise(params.exerciseId, correctAnswers >= 3);
        }
        navigate('/redi');
      });
    }
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
      
      {/* We no longer need the parent's Continue button since 
         each child component handles its own continue action 
         through the custom events */}
      
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
