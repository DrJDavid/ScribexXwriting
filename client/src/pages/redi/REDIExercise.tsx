import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import ExerciseMultipleChoice from '@/components/exercises/ExerciseMultipleChoice';
import ExerciseWriting from '@/components/exercises/ExerciseWriting';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getExerciseById, getExerciseNodes } from '@/data/exercises';
import { useToast } from '@/hooks/use-toast';

/**
 * REDI Exercise page to show quizzes and exercises
 */
const REDIExercise = () => {
  // Setup hooks and params
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const params = useParams<{ exerciseId: string }>();
  const [, navigate] = useLocation();
  const { progress, completeExercise, updateProgress, calculateRediLevel } = useProgress();
  
  // Set REDI theme
  useEffect(() => { setTheme('redi'); }, [setTheme]);

  // QUIZ STATE
  // Track current exercise being shown
  const [currentExerciseId, setCurrentExerciseId] = useState(params.exerciseId || '');
  // Has user answered current question
  const [hasAnswered, setHasAnswered] = useState(false);
  // Was their answer correct
  const [isCorrect, setIsCorrect] = useState(false);
  // How many correct answers so far
  const [correctCount, setCorrectCount] = useState(0);
  // Current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // List of questions in order
  const [questionsList, setQuestionsList] = useState<string[]>([]);

  // Create 5 question exercise set
  useEffect(() => {
    // Skip if we already have questions or missing required data
    if (!params.exerciseId || questionsList.length > 0 || !progress) return;
    
    // Get initial exercise data
    const initialExercise = getExerciseById(params.exerciseId);
    if (!initialExercise) return navigate('/redi');
    
    // Find available exercises
    const nodes = getExerciseNodes(
      progress.rediSkillMastery || { mechanics: 0, sequencing: 0, voice: 0 },
      progress.completedExercises || []
    );
    
    // Get exercises of the same skill type (mechanics, sequencing, voice)
    const sameTypeExercises = nodes
      .filter(node => 
        node.skillType === initialExercise.skillType && 
        (node.status === 'available' || node.status === 'current' || node.id === initialExercise.id))
      .map(node => node.id);
    
    // Get other skill types as backups
    const otherExercises = nodes
      .filter(node => 
        node.skillType !== initialExercise.skillType && 
        (node.status === 'available' || node.status === 'current'))
      .map(node => node.id);
    
    // Always start with the initial exercise
    let exercises = [params.exerciseId];
    
    // Add other exercises (not including the starting one)
    const availableExercises = [...sameTypeExercises, ...otherExercises]
      .filter(id => id !== params.exerciseId);
    
    // Add exercises until we have 5 total
    while (exercises.length < 5 && availableExercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableExercises.length);
      exercises.push(availableExercises[randomIndex]);
      availableExercises.splice(randomIndex, 1);
    }
    
    // If we don't have enough, duplicate some
    while (exercises.length < 5) {
      const randomIndex = Math.floor(Math.random() * exercises.length);
      exercises.push(exercises[randomIndex]);
    }
    
    // Save state
    setQuestionsList(exercises);
    setCurrentExerciseId(exercises[0]);
  }, [params.exerciseId, progress, questionsList.length, navigate]);
  
  // Get current exercise data
  const currentExercise = getExerciseById(currentExerciseId);
  
  // If exercise not found, back to map
  useEffect(() => {
    if (!currentExercise && params.exerciseId) {
      navigate('/redi');
    }
  }, [currentExercise, params.exerciseId, navigate]);
  
  // Show nothing until we're ready to render
  if (!currentExercise || questionsList.length === 0) {
    return null;
  }
  
  // Is this the last question?
  const isLastQuestion = currentQuestionIndex === questionsList.length - 1;
  
  // Handle multiple choice answer
  const handleMultipleChoiceSubmit = (exerciseId: string, selectedOption: number, correct: boolean) => {
    if (hasAnswered) return;
    
    // Update state based on answer
    setIsCorrect(correct);
    setHasAnswered(true);
    
    // Count correct answers
    if (correct) {
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
  };
  
  // Handle writing submission
  const handleWritingSubmit = (exerciseId: string, response: string, isComplete: boolean) => {
    if (hasAnswered) return;
    
    // Update state based on submission
    setIsCorrect(isComplete);
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
  };
  
  // Handle continue button click
  const handleContinue = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If this is the last question, finish the exercise
    if (isLastQuestion) {
      // Need at least 3 correct to pass
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
          description: `You got ${correctCount} out of ${questionsList.length} correct. Your ${currentExercise.skillType} mastery increased by ${skillIncrease}%.`,
        });
      } else {
        toast({
          title: "Exercise Set Attempted",
          description: `You got ${correctCount} out of ${questionsList.length} correct. You need at least 3 correct to increase mastery.`,
        });
      }
      
      // Mark the exercise as completed
      if (params.exerciseId && completeExercise) {
        completeExercise(params.exerciseId, isSuccessful);
        
        toast({
          title: isSuccessful ? "Node Completed!" : "Node Attempted",
          description: isSuccessful 
            ? `You got ${correctCount} out of ${questionsList.length} correct! Node mastery unlocked.` 
            : `You got ${correctCount} out of ${questionsList.length} correct. Try again for better mastery.`,
        });
      }
      
      // Navigate back to the REDI map
      navigate('/redi');
      return;
    }
    
    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    const nextExerciseId = questionsList[nextIndex];
    
    if (nextExerciseId) {
      // Update state for the next question
      setCurrentQuestionIndex(nextIndex);
      setCurrentExerciseId(nextExerciseId);
      setHasAnswered(false);
      setIsCorrect(false);
    } else {
      navigate('/redi');
    }
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/redi');
  };
  
  return (
    // Wrap everything in a root element that captures any form submissions
    <div onSubmit={(e) => { e.preventDefault(); return false; }}>
      <MainLayout 
        title={currentExercise.title} 
        showBackButton={true}
        onBackClick={handleBack}
      >
        <div className="text-gray-300 text-sm mb-4">
          Exercise {currentQuestionIndex + 1} of {questionsList.length}
        </div>
        
        {/* Display the appropriate exercise component */}
        {currentExercise.type === 'writing' ? (
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
        {hasAnswered && (
          <div className="mt-6 flex justify-end">
            <button 
              type="button"
              onClick={handleContinue}
              className={`px-6 py-3 rounded-lg text-white font-semibold transition-all text-lg
              ${isCorrect 
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
            <span>{currentQuestionIndex + 1} of {questionsList.length}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / questionsList.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default REDIExercise;
