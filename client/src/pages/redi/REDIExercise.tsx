import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import ExerciseMultipleChoice from '@/components/exercises/ExerciseMultipleChoice';
import ExerciseWriting from '@/components/exercises/ExerciseWriting';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getExerciseById, getExerciseNodes } from '@/data/exercises';
import { useToast } from '@/hooks/use-toast';

// Wrapping in div to prevent form submission propagation
const REDIExercise: React.FC = () => {
  // This will prevent form submission and the questions resetting
  const handleFormSubmitPrevention = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Form submission prevented');
    return false;
  };

  return (
    <div onSubmit={handleFormSubmitPrevention}>
      <REDIExerciseContent />
    </div>
  );
};

// Actual component content separated to prevent form issues
const REDIExerciseContent: React.FC = () => {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const params = useParams<{ exerciseId: string }>();
  const [, navigate] = useLocation();
  const { progress, completeExercise, updateProgress, calculateRediLevel } = useProgress();
  
  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [exercises, setExercises] = useState<string[]>([]);
  const [currentExerciseId, setCurrentExerciseId] = useState<string>(params.exerciseId);
  
  // Make sure REDI theme is active
  useEffect(() => {
    setTheme('redi');
  }, [setTheme]);
  
  // Current exercise data
  const currentExercise = getExerciseById(currentExerciseId);
  
  // Create initial exercise set
  useEffect(() => {
    // Early returns
    if (!params.exerciseId || exercises.length > 0 || !progress) return;
    
    // Get base exercise
    const baseExercise = getExerciseById(params.exerciseId);
    if (!baseExercise) {
      console.error('Base exercise not found');
      navigate('/redi');
      return;
    }
    
    console.log('Initializing exercise set for:', params.exerciseId);
    
    // Get all nodes
    const nodes = getExerciseNodes(
      progress.rediSkillMastery || { mechanics: 0, sequencing: 0, voice: 0 },
      progress.completedExercises || []
    );
    
    // Get matching skill type exercises
    const matchingExercises = nodes
      .filter(node => 
        node.skillType === baseExercise.skillType && 
        (node.status === 'available' || node.status === 'current' || node.id === baseExercise.id))
      .map(node => node.id);
    
    // Get other types as backups
    const otherExercises = nodes
      .filter(node => 
        node.skillType !== baseExercise.skillType && 
        (node.status === 'available' || node.status === 'current'))
      .map(node => node.id);
    
    // Always start with the original exercise
    let questionsList = [params.exerciseId];
    
    // Get additional exercises, not including the starting one
    const remainingOptions = [...matchingExercises, ...otherExercises]
      .filter(id => id !== params.exerciseId);
    
    // Add exercises to reach 5 total
    while (questionsList.length < 5 && remainingOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingOptions.length);
      questionsList.push(remainingOptions[randomIndex]);
      remainingOptions.splice(randomIndex, 1);
    }
    
    // If we need more, duplicate some
    while (questionsList.length < 5) {
      const randomIndex = Math.floor(Math.random() * questionsList.length);
      questionsList.push(questionsList[randomIndex]);
    }
    
    console.log('Exercise set created:', questionsList);
    setExercises(questionsList);
    setCurrentExerciseId(questionsList[0]);
  }, [params.exerciseId, progress, navigate]);
  
  // Safety check for missing exercise
  useEffect(() => {
    if (!currentExercise && params.exerciseId) {
      console.error('Current exercise not found');
      navigate('/redi');
    }
  }, [currentExercise, params.exerciseId, navigate]);
  
  // Exit if no exercise data
  if (!currentExercise || exercises.length === 0) {
    return null;
  }
  
  // Last question check
  const isLastQuestion = currentIndex === exercises.length - 1;
  
  // Handle multiple choice submission
  const handleMultipleChoiceSubmit = useCallback((exerciseId: string, selectedOption: number, isCorrect: boolean) => {
    console.log('Multiple choice submitted:', { exerciseId, isCorrect });
    if (hasAnswered) return; // Prevent double submission
    
    // Update state
    setIsCorrectAnswer(isCorrect);
    setHasAnswered(true);
    
    // Track correct answers
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      toast({
        title: "Correct!",
        description: "Great job! Click Continue to proceed.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Not quite right",
        description: "That's okay! Click Continue to proceed.",
        duration: 3000,
      });
    }
  }, [hasAnswered, toast]);
  
  // Handle writing submission
  const handleWritingSubmit = useCallback((exerciseId: string, response: string, isComplete: boolean) => {
    console.log('Writing exercise submitted:', { exerciseId, isComplete });
    if (hasAnswered) return; // Prevent double submission
    
    // Update state
    setIsCorrectAnswer(isComplete);
    setHasAnswered(true);
    
    // Count as correct if complete
    if (isComplete) {
      setCorrectCount(prev => prev + 1);
      toast({
        title: "Exercise Complete!",
        description: "Your submission meets the requirements. Click Continue to proceed.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Requirements Not Met",
        description: "Your submission doesn't meet all requirements yet. Click Continue to proceed anyway.",
        duration: 3000,
      });
    }
  }, [hasAnswered, toast]);
  
  // Continue to next question or finish
  const handleContinue = useCallback(async (e: React.MouseEvent) => {
    // Prevent any form submission
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Continue clicked:', { 
      currentIndex, 
      isLastQuestion, 
      correctCount 
    });
    
    // If last question, complete the exercise set
    if (isLastQuestion) {
      // Success criteria: at least 3/5 correct
      const isSuccessful = correctCount >= 3;
      
      // Update skill mastery if successful
      if (isSuccessful && progress) {
        // Calculate skill increase based on correct answers
        const skillIncrease = Math.min(correctCount * 5, 20);
        
        // Update the appropriate skill
        const updatedSkillMastery = { ...progress.rediSkillMastery };
        
        if (currentExercise.skillType === 'mechanics') {
          updatedSkillMastery.mechanics = Math.min(updatedSkillMastery.mechanics + skillIncrease, 100);
        } else if (currentExercise.skillType === 'sequencing') {
          updatedSkillMastery.sequencing = Math.min(updatedSkillMastery.sequencing + skillIncrease, 100);
        } else if (currentExercise.skillType === 'voice') {
          updatedSkillMastery.voice = Math.min(updatedSkillMastery.voice + skillIncrease, 100);
        }
        
        // Calculate new level
        const newRediLevel = calculateRediLevel(
          updatedSkillMastery,
          [...(progress.completedExercises || [])]
        );
        
        // Update progress
        await updateProgress({
          rediSkillMastery: updatedSkillMastery,
          rediLevel: newRediLevel,
        });
        
        toast({
          title: "Exercise Set Completed!",
          description: `You got ${correctCount} out of ${exercises.length} correct. Your ${currentExercise.skillType} mastery increased by ${skillIncrease}%.`,
        });
      } else {
        toast({
          title: "Exercise Set Attempted",
          description: `You got ${correctCount} out of ${exercises.length} correct. You need at least 3 correct to increase mastery.`,
        });
      }
      
      // Mark the original exercise as completed
      if (params.exerciseId && completeExercise) {
        completeExercise(params.exerciseId, isSuccessful);
        
        toast({
          title: isSuccessful ? "Node Completed!" : "Node Attempted",
          description: isSuccessful 
            ? `You got ${correctCount} out of ${exercises.length} correct! Node mastery unlocked.` 
            : `You got ${correctCount} out of ${exercises.length} correct. Try again for better mastery.`,
        });
      }
      
      // Navigate back to the REDI map
      navigate('/redi');
      return;
    }
    
    // Move to next question
    const nextIndex = currentIndex + 1;
    const nextExerciseId = exercises[nextIndex];
    
    if (nextExerciseId) {
      console.log(`Moving to next exercise: ${nextExerciseId} (${nextIndex + 1} of ${exercises.length})`);
      
      // Update state for the next question
      setCurrentIndex(nextIndex);
      setCurrentExerciseId(nextExerciseId);
      setHasAnswered(false);
      setIsCorrectAnswer(false);
    } else {
      console.error('Next exercise not found');
      navigate('/redi');
    }
  }, [
    currentIndex, 
    isLastQuestion, 
    correctCount, 
    exercises, 
    currentExercise, 
    progress, 
    calculateRediLevel, 
    updateProgress, 
    params.exerciseId, 
    completeExercise, 
    navigate, 
    toast
  ]);
  
  // Handle back button
  const handleBack = useCallback(() => {
    navigate('/redi');
  }, [navigate]);
  
  // Determine exercise type
  const isWritingExercise = currentExercise.type === 'writing';
  
  return (
    <MainLayout 
      title={currentExercise.title} 
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="text-gray-300 text-sm mb-4">
        Exercise {currentIndex + 1} of {exercises.length}
      </div>
      
      <div onSubmit={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()}>
        {isWritingExercise ? (
          // Render writing exercise component
          <ExerciseWriting
            exerciseId={currentExercise.id}
            title={currentExercise.title}
            instructions={currentExercise.instructions}
            content={currentExercise.content}
            prompt={currentExercise.prompt || ''}
            minWordCount={currentExercise.minWordCount || 50}
            exampleResponse={currentExercise.exampleResponse}
            onSubmit={handleWritingSubmit}
          />
        ) : (
          // Render multiple choice component
          <ExerciseMultipleChoice
            exerciseId={currentExercise.id}
            title={currentExercise.title}
            instructions={currentExercise.instructions}
            content={currentExercise.content}
            options={currentExercise.options || []}
            correctOptionIndex={currentExercise.correctOptionIndex || 0}
            onSubmit={handleMultipleChoiceSubmit}
          />
        )}
      </div>
      
      {/* Continue button - only shown after answering */}
      {hasAnswered && (
        <div className="mt-6 flex justify-end">
          <button 
            type="button"
            onClick={handleContinue}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-all text-lg
            ${isCorrectAnswer 
              ? 'bg-green-600 hover:bg-green-500' 
              : 'bg-violet-600 hover:bg-violet-500'} 
            flex items-center gap-2 shadow-xl hover:shadow-2xl fixed bottom-8 right-8 z-50 animate-pulse`}
          >
            {isLastQuestion ? 'Finish' : 'Continue'}
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
          <span>{currentIndex + 1} of {exercises.length}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </MainLayout>
  );
};

export default REDIExercise;
