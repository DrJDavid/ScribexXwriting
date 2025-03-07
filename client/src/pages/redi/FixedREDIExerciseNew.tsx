import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getExerciseById, getNextExerciseId, EXERCISES } from '@/data/exercises';
import { motion } from 'framer-motion';
import REDIExerciseModal from './REDIExerciseModal';

/**
 * Fixed REDI Exercise component that combines all exercise types into a single component 
 * to prevent component swapping and state reset issues.
 */
const FixedREDIExerciseNew: React.FC = () => {
  const { setTheme } = useTheme();
  const params = useParams<{ exerciseId: string }>();
  const [, navigate] = useLocation();
  const { progress, completeExercise } = useProgress();
  
  // Make sure REDI theme is active
  useEffect(() => {
    setTheme('redi');
  }, [setTheme]);
  
  // Exercise state
  const [exerciseIndex, setExerciseIndex] = useState(1);
  const [totalExercises, setTotalExercises] = useState(5);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [writingResponse, setWritingResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  
  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // Get the current exercise
  const exercise = getExerciseById(params.exerciseId || "");
  const isWritingExercise = exercise?.type === 'writing';
  
  // Calculate exercise index and total exercises in useEffect
  useEffect(() => {
    if (exercise?.id) {
      const currentIndex = EXERCISES.findIndex(ex => ex.id === exercise.id);
      if (currentIndex !== -1) {
        setExerciseIndex(currentIndex + 1);
        setTotalExercises(EXERCISES.length);
      }
    }
  }, [exercise?.id]);
  
  // If exercise not found, go back to map
  useEffect(() => {
    if (!exercise && params.exerciseId) {
      navigate('/redi');
    }
  }, [exercise, params.exerciseId, navigate]);
  
  // Reset state when exercise changes
  useEffect(() => {
    if (exercise) {
      setSelectedOption(null);
      setHasSubmitted(false);
      setIsAnswerCorrect(false);
      setWritingResponse('');
      setWordCount(0);
      setValidationMessage('');
      setFeedbackModalOpen(false);
    }
  }, [exercise?.id]);
  
  // Count words in writing response
  useEffect(() => {
    if (isWritingExercise) {
      // Count non-empty words
      const words = writingResponse.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      
      // Update validation message
      if (words.length < (exercise?.minWordCount || 50) && writingResponse.trim().length > 0) {
        setValidationMessage(`Need ${(exercise?.minWordCount || 50) - words.length} more words.`);
      } else {
        setValidationMessage('');
      }
    }
  }, [writingResponse, isWritingExercise, exercise]);
  
  // If no exercise, don't render
  if (!exercise) {
    return null;
  }
  
  const handleBack = () => {
    navigate('/redi');
  };
  
  const handleOptionSelect = (index: number) => {
    if (!hasSubmitted) {
      setSelectedOption(index);
    }
  };
  
  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWritingResponse(e.target.value);
  };
  
  const handleMultipleChoiceSubmit = () => {
    if (selectedOption !== null) {
      const isCorrect = selectedOption === exercise.correctOptionIndex;
      setIsAnswerCorrect(isCorrect);
      setHasSubmitted(true);
      
      // Set feedback modal content
      if (isCorrect) {
        setFeedbackTitle("Correct!");
        setFeedbackMessage("Great job! Click Continue to proceed.");
      } else {
        setFeedbackTitle("Not quite right");
        const correctAnswer = exercise.options?.[exercise.correctOptionIndex || 0] || "";
        setFeedbackMessage(`That's okay! The correct answer was: ${correctAnswer}`);
      }
      
      // Show feedback modal
      setFeedbackModalOpen(true);
    }
  };
  
  const handleWritingSubmit = () => {
    if (writingResponse.trim().length === 0) return;
    
    const meetsWordCount = wordCount >= (exercise.minWordCount || 50);
    setIsAnswerCorrect(meetsWordCount);
    setHasSubmitted(true);
    
    // Set feedback modal content
    if (meetsWordCount) {
      setFeedbackTitle("Exercise Complete!");
      setFeedbackMessage("Your submission meets the requirements. Click Continue to proceed.");
    } else {
      setFeedbackTitle("Requirements Not Met");
      setFeedbackMessage("Your submission doesn't meet all requirements yet. Click Continue to proceed anyway.");
    }
    
    // Show feedback modal
    setFeedbackModalOpen(true);
  };
  
  const handleNextExercise = async () => {
    try {
      // First close the feedback modal
      setFeedbackModalOpen(false);
      
      // Record completion - need to await this to catch any errors
      if (completeExercise && exercise?.id) {
        await completeExercise(exercise.id, isAnswerCorrect);
      }
      
      // Check if there's a next exercise
      if (exercise?.id) {
        const nextExerciseId = getNextExerciseId(exercise.id);
        if (nextExerciseId) {
          // Navigate to the next exercise
          navigate(`/redi/exercise/${nextExerciseId}`);
          return;
        }
      }
      
      // If no next exercise or there was an error getting it, go back to the map
      navigate('/redi');
    } catch (error) {
      console.error("Error completing exercise:", error);
      // If an error occurs, still close the modal but show an error message
      setFeedbackModalOpen(false);
      navigate('/redi');
    }
  };
  
  // Theme-specific styling
  const bgClass = 'bg-[#1e1e1e]';
  const contentBgClass = 'bg-[#121212]';
  const accentClass = 'from-[#6320ee] to-[#1c77c3]';
  const selectedClass = 'bg-[#6320ee] border-[#39ff14]';
  const correctClass = 'bg-green-700 border-[#39ff14]';
  const incorrectClass = 'bg-red-700 border-[#ff3864]';
  const fontClass = 'font-orbitron';
  
  return (
    <MainLayout 
      title={exercise.title} 
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="text-gray-300 text-sm mb-4">
        Exercise {exerciseIndex} of {totalExercises}
      </div>
      
      {/* Feedback Modal */}
      <REDIExerciseModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        title={feedbackTitle}
        message={feedbackMessage}
        isCorrect={isAnswerCorrect}
        onContinue={handleNextExercise}
        fontClass={fontClass}
        accentClass={accentClass}
      />
      
      {/* Main exercise content */}
      <div className={`${bgClass} rounded-xl p-5 shadow-lg`}>
        <div className="mb-6">
          <h3 className={`text-white ${fontClass} text-xl mb-3`}>{exercise.title}</h3>
          <p className="text-gray-200 text-sm">{exercise.instructions}</p>
        </div>
        
        <div className={`${contentBgClass} p-4 rounded-lg mb-6`}>
          <p className="text-gray-200 text-sm leading-relaxed">
            {exercise.content}
          </p>
        </div>
        
        {/* Exercise-specific content */}
        {isWritingExercise ? (
          /* Writing Exercise */
          <>
            <div className="mb-6 bg-gray-700 p-4 rounded-md text-white">
              {exercise.prompt}
            </div>
            
            {!hasSubmitted ? (
              <>
                <div className="mb-2">
                  <Textarea 
                    placeholder="Write your response here..." 
                    value={writingResponse}
                    onChange={handleResponseChange}
                    className="min-h-[200px] bg-gray-900 text-white border-gray-700"
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span className={wordCount >= (exercise.minWordCount || 50) ? 'text-green-400' : 'text-gray-400'}>
                      Words: {wordCount} / {exercise.minWordCount || 50} minimum
                    </span>
                    {validationMessage && (
                      <span className="text-red-400">{validationMessage}</span>
                    )}
                  </div>
                </div>
                
                <Button
                  className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleWritingSubmit();
                  }}
                  disabled={writingResponse.trim() === ''}
                  type="button"
                >
                  Submit Response
                </Button>
              </>
            ) : (
              <div className="mt-6">
                <div className="bg-gray-700 p-4 rounded-md mb-4">
                  <h3 className="text-green-400 font-bold mb-2">Your Response:</h3>
                  <div className="text-white whitespace-pre-wrap">{writingResponse}</div>
                </div>
                
                {exercise.exampleResponse && (
                  <div className="bg-gray-700 p-4 rounded-md mb-4">
                    <h3 className="text-blue-400 font-bold mb-2">Example Response:</h3>
                    <div className="text-white whitespace-pre-wrap">{exercise.exampleResponse}</div>
                  </div>
                )}
                
                <div className="bg-green-900/30 border border-green-500 p-4 rounded-md mb-6">
                  <p className="text-green-400 font-medium">
                    Great job! Writing exercises help you practice expressing your thoughts clearly.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Multiple Choice Exercise */
          <>
            {/* Multiple choice options */}
            <div className="space-y-3 mb-6">
              {exercise.options?.map((option, index) => {
                let optionClasses = `w-full text-left ${contentBgClass} hover:bg-opacity-80 transition-colors p-3 rounded-lg text-gray-200 text-sm border border-gray-700`;
                
                if (hasSubmitted) {
                  if (index === exercise.correctOptionIndex) {
                    optionClasses = `w-full text-left ${correctClass} p-3 rounded-lg text-white text-sm border-2`;
                  } else if (index === selectedOption) {
                    optionClasses = `w-full text-left ${incorrectClass} p-3 rounded-lg text-white text-sm border-2`;
                  }
                } else if (index === selectedOption) {
                  optionClasses = `w-full text-left ${selectedClass} p-3 rounded-lg text-white text-sm border-2`;
                }
                
                return (
                  <motion.button
                    key={index}
                    className={optionClasses}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOptionSelect(index);
                    }}
                    whileHover={!hasSubmitted ? { scale: 1.01 } : {}}
                    whileTap={!hasSubmitted ? { scale: 0.99 } : {}}
                    type="button"
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
            
            {!hasSubmitted && (
              <Button
                className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMultipleChoiceSubmit();
                }}
                disabled={selectedOption === null}
                type="button"
              >
                Submit Answer
              </Button>
            )}
          </>
        )}
      </div>
      
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

export default FixedREDIExerciseNew;