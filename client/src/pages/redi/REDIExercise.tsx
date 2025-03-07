import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import ExerciseMultipleChoice from '@/components/exercises/ExerciseMultipleChoice';
import ExerciseWriting from '@/components/exercises/ExerciseWriting';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getExerciseById, getExerciseNodes } from '@/data/exercises';
import { useToast } from '@/hooks/use-toast';

// Set of quiz exercises that we'll cycle through
const REDIExercise: React.FC = () => {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const params = useParams<{ exerciseId: string }>();
  const [, navigate] = useLocation();
  const { progress, completeExercise, updateProgress, calculateRediLevel } = useProgress();
  
  // State for quiz management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [questionsSet, setQuestionsSet] = useState<string[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(params.exerciseId);
  
  // Make sure REDI theme is active
  useEffect(() => {
    setTheme('redi');
  }, [setTheme]);
  
  // Get the current exercise
  const currentExercise = getExerciseById(currentQuestionId);
  
  // Create the initial set of exercises for the quiz
  useEffect(() => {
    if (!params.exerciseId || questionsSet.length > 0 || !progress) return;

    // Get the initial exercise
    const startingExercise = getExerciseById(params.exerciseId);
    if (!startingExercise) {
      console.error('Starting exercise not found');
      navigate('/redi');
      return;
    }

    // Find available exercises for the quiz
    const nodes = getExerciseNodes(
      progress.rediSkillMastery || { mechanics: 0, sequencing: 0, voice: 0 },
      progress.completedExercises || []
    );
    
    // Get exercises of the same type first
    const sameTypeExercises = nodes
      .filter(node => 
        node.skillType === startingExercise.skillType && 
        (node.status === 'available' || node.status === 'current' || node.id === startingExercise.id))
      .map(node => node.id);
    
    // Get other available exercises if needed
    const otherExercises = nodes
      .filter(node => 
        node.skillType !== startingExercise.skillType && 
        (node.status === 'available' || node.status === 'current'))
      .map(node => node.id);
    
    // Create a set with the starting exercise first
    const exerciseIds = [params.exerciseId];
    
    // Add other exercises (not including the starting one)
    const remainingExercises = [...sameTypeExercises, ...otherExercises]
      .filter(id => id !== params.exerciseId);
    
    // Add as many as needed to reach 5 total
    while (exerciseIds.length < 5 && remainingExercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingExercises.length);
      exerciseIds.push(remainingExercises[randomIndex]);
      remainingExercises.splice(randomIndex, 1);
    }
    
    // If we still need more, duplicate some exercises
    while (exerciseIds.length < 5) {
      const randomIndex = Math.floor(Math.random() * exerciseIds.length);
      exerciseIds.push(exerciseIds[randomIndex]);
    }
    
    console.log('Created quiz set with exercises:', exerciseIds);
    setQuestionsSet(exerciseIds);
    setCurrentQuestionId(exerciseIds[0]);
  }, [params.exerciseId, progress, navigate]);
  
  // If exercise not found, go back to map
  useEffect(() => {
    if (!currentExercise && params.exerciseId) {
      console.error('Exercise not found');
      navigate('/redi');
    }
  }, [currentExercise, params.exerciseId, navigate]);
  
  // Skip rendering until we have an exercise
  if (!currentExercise || questionsSet.length === 0) {
    return null;
  }
  
  // Calculate if this is the last question
  const isLastQuestion = currentQuestionIndex === questionsSet.length - 1;
  
  // Function to submit a multiple choice answer
  const handleMultipleChoiceSubmit = (exerciseId: string, selectedOption: number, isCorrect: boolean) => {
    if (hasSubmittedAnswer) return;
    
    // Update state based on answer
    setLastAnswerCorrect(isCorrect);
    setHasSubmittedAnswer(true);
    
    // Count correct answers
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
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
  };
  
  // Function to submit a writing exercise
  const handleWritingSubmit = (exerciseId: string, response: string, isComplete: boolean) => {
    if (hasSubmittedAnswer) return;
    
    // Update state based on submission
    setLastAnswerCorrect(isComplete);
    setHasSubmittedAnswer(true);
    
    // Count as correct if complete
    if (isComplete) {
      setCorrectAnswersCount(prev => prev + 1);
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
  };
  
  // Function to handle the continue button
  const handleContinue = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If this was the last question, update progress and go back to the map
    if (isLastQuestion) {
      // Required success criteria: at least 3 correct answers out of 5
      const isSuccessful = correctAnswersCount >= 3;
      
      // Update skill mastery if successful
      if (isSuccessful && progress) {
        // Calculate skill increase based on correct answers
        const skillIncrease = Math.min(correctAnswersCount * 5, 20);
        
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
          description: `You got ${correctAnswersCount} out of ${questionsSet.length} correct. Your ${currentExercise.skillType} mastery increased by ${skillIncrease}%.`,
        });
      } else {
        toast({
          title: "Exercise Set Attempted",
          description: `You got ${correctAnswersCount} out of ${questionsSet.length} correct. You need at least 3 correct to increase mastery.`,
        });
      }
      
      // Mark the original exercise as completed
      if (params.exerciseId && completeExercise) {
        completeExercise(params.exerciseId, isSuccessful);
        
        toast({
          title: isSuccessful ? "Node Completed!" : "Node Attempted",
          description: isSuccessful 
            ? `You got ${correctAnswersCount} out of ${questionsSet.length} correct! Node mastery unlocked.` 
            : `You got ${correctAnswersCount} out of ${questionsSet.length} correct. Try again for better mastery.`,
        });
      }
      
      // Navigate back to the REDI map
      navigate('/redi');
      return;
    }
    
    // Move to the next question
    const nextIndex = currentQuestionIndex + 1;
    const nextQuestionId = questionsSet[nextIndex];
    
    if (nextQuestionId) {
      console.log(`Moving to next question: ${nextQuestionId} (${nextIndex + 1} of ${questionsSet.length})`);
      
      // Update state for the next question
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestionId(nextQuestionId);
      setHasSubmittedAnswer(false);
      setLastAnswerCorrect(false);
    } else {
      console.error('Next question not found in set');
      navigate('/redi');
    }
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/redi');
  };
  
  // Determine if this is a writing exercise
  const isWritingExercise = currentExercise.type === 'writing';
  
  return (
    <MainLayout 
      title={currentExercise.title} 
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="text-gray-300 text-sm mb-4">
        Exercise {currentQuestionIndex + 1} of {questionsSet.length}
      </div>
      
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
      
      {/* Continue button - only shown after answering */}
      {hasSubmittedAnswer && (
        <div className="mt-6 flex justify-end">
          <button 
            type="button"
            onClick={handleContinue}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-all text-lg
            ${lastAnswerCorrect 
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
          <span>{currentQuestionIndex + 1} of {questionsSet.length}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full"
            style={{ width: `${((currentQuestionIndex + 1) / questionsSet.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </MainLayout>
  );
};

export default REDIExercise;
