import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { 
  getExerciseById, 
  getQuestionsForNode, 
  getQuestionByNodeAndNumber, 
  NodeQuestion
} from '@/data/exercises';
import { motion } from 'framer-motion';
import REDIExerciseModal from './REDIExerciseModal';

/**
 * Fixed REDI Exercise component that combines all exercise types into a single component 
 * to prevent component swapping and state reset issues.
 * 
 * This version supports node-based questions where each node contains 5 questions.
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
  
  // Node and question state
  const [currentNodeId, setCurrentNodeId] = useState<string>("");
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [writingResponse, setWritingResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  
  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // Get the current exercise (node)
  const exercise = getExerciseById(params.exerciseId || "");
  
  // Get questions for this node
  const nodeQuestions = getQuestionsForNode(params.exerciseId || "");
  const totalQuestionsInNode = nodeQuestions.length;
  
  // Get current question
  const currentQuestion = getQuestionByNodeAndNumber(
    params.exerciseId || "",
    currentQuestionNumber
  );
  
  const isWritingExercise = currentQuestion?.type === 'writing';
  
  // Initialize node and question
  useEffect(() => {
    if (exercise?.id) {
      setCurrentNodeId(exercise.id);
      setCurrentQuestionNumber(1);
      setCorrectAnswersCount(0);
    }
  }, [exercise?.id]);
  
  // Default to 5 questions if no questions found
  useEffect(() => {
    if (totalQuestionsInNode === 0 && exercise?.id) {
      console.log("No questions found for this node:", exercise.id);
    }
  }, [totalQuestionsInNode, exercise?.id]);
  
  // If exercise/node not found, go back to map
  useEffect(() => {
    if (!exercise && params.exerciseId) {
      navigate('/redi');
    }
  }, [exercise, params.exerciseId, navigate]);
  
  // Reset state when question changes
  useEffect(() => {
    if (currentQuestion) {
      setSelectedOption(null);
      setHasSubmitted(false);
      setIsAnswerCorrect(false);
      setWritingResponse('');
      setWordCount(0);
      setValidationMessage('');
      setFeedbackModalOpen(false);
    }
  }, [currentNodeId, currentQuestionNumber]);
  
  // Count words in writing response
  useEffect(() => {
    if (isWritingExercise && currentQuestion) {
      // Count non-empty words
      const words = writingResponse.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      
      // Update validation message
      if (words.length < (currentQuestion.minWordCount || 50) && writingResponse.trim().length > 0) {
        setValidationMessage(`Need ${(currentQuestion.minWordCount || 50) - words.length} more words.`);
      } else {
        setValidationMessage('');
      }
    }
  }, [writingResponse, isWritingExercise, currentQuestion]);
  
  // If no exercise or question, don't render
  if (!exercise || !currentQuestion) {
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
    if (selectedOption !== null && currentQuestion) {
      const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
      setIsAnswerCorrect(isCorrect);
      setHasSubmitted(true);
      
      // Count correct answers for mastery calculation
      if (isCorrect) {
        setCorrectAnswersCount(prev => prev + 1);
      }
      
      // Set feedback modal content
      if (isCorrect) {
        setFeedbackTitle("Correct!");
        setFeedbackMessage("Great job! Click Continue to proceed.");
      } else {
        setFeedbackTitle("Not quite right");
        const correctAnswer = currentQuestion.options?.[currentQuestion.correctOptionIndex || 0] || "";
        setFeedbackMessage(`That's okay! The correct answer was: ${correctAnswer}`);
      }
      
      // Show feedback modal
      setFeedbackModalOpen(true);
    }
  };
  
  const handleWritingSubmit = () => {
    if (writingResponse.trim().length === 0 || !currentQuestion) return;
    
    const meetsWordCount = wordCount >= (currentQuestion.minWordCount || 50);
    setIsAnswerCorrect(meetsWordCount);
    setHasSubmitted(true);
    
    // Count correct answers for mastery calculation
    if (meetsWordCount) {
      setCorrectAnswersCount(prev => prev + 1);
    }
    
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
      
      // Check if there's another question in this node
      if (currentQuestionNumber < totalQuestionsInNode) {
        // Move to the next question in this node
        setCurrentQuestionNumber(prev => prev + 1);
        return;
      }
      
      // If completed all questions in the node, calculate mastery and submit
      const masteryPercentage = (correctAnswersCount / totalQuestionsInNode) * 100;
      const isNodeComplete = masteryPercentage >= 60; // Consider 60% correct as passing
      
      // Record completion - need to await this to catch any errors
      if (completeExercise && exercise?.id) {
        try {
          // Add the exercise to the completedExercises list in progress
          const result = await completeExercise(exercise.id, isNodeComplete);
          console.log(`Node ${exercise.id} completed with mastery: ${masteryPercentage}%`);
          console.log('Updated progress:', result);
          
          // Wait a moment for progress state to update before navigating
          setTimeout(() => {
            // Navigate back to the REDI map
            navigate('/redi');
          }, 500);
        } catch (updateError) {
          console.error("Error updating progress:", updateError);
          navigate('/redi');
        }
      } else {
        console.warn("Unable to update progress: completeExercise function or exercise ID is missing");
        navigate('/redi');
      }
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
      title={`${exercise.title} - Question ${currentQuestionNumber}`} 
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="text-gray-300 text-sm mb-4">
        Question {currentQuestionNumber} of {totalQuestionsInNode}
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
          <h3 className={`text-white ${fontClass} text-xl mb-3`}>{currentQuestion.title}</h3>
          <p className="text-gray-200 text-sm">{currentQuestion.instructions}</p>
        </div>
        
        <div className={`${contentBgClass} p-4 rounded-lg mb-6`}>
          <p className="text-gray-200 text-sm leading-relaxed">
            {currentQuestion.content}
          </p>
        </div>
        
        {/* Exercise-specific content */}
        {isWritingExercise ? (
          /* Writing Exercise */
          <>
            <div className="mb-6 bg-gray-700 p-4 rounded-md text-white">
              {currentQuestion.prompt}
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
                    <span className={wordCount >= (currentQuestion.minWordCount || 50) ? 'text-green-400' : 'text-gray-400'}>
                      Words: {wordCount} / {currentQuestion.minWordCount || 50} minimum
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
                
                {currentQuestion.exampleResponse && (
                  <div className="bg-gray-700 p-4 rounded-md mb-4">
                    <h3 className="text-blue-400 font-bold mb-2">Example Response:</h3>
                    <div className="text-white whitespace-pre-wrap">{currentQuestion.exampleResponse}</div>
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
              {currentQuestion.options?.map((option, index) => {
                let optionClasses = `w-full text-left ${contentBgClass} hover:bg-opacity-80 transition-colors p-3 rounded-lg text-gray-200 text-sm border border-gray-700`;
                
                if (hasSubmitted) {
                  if (index === currentQuestion.correctOptionIndex) {
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
          <span>Node Progress</span>
          <span>Question {currentQuestionNumber} of {totalQuestionsInNode}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full"
            style={{ width: `${(currentQuestionNumber / totalQuestionsInNode) * 100}%` }}
          ></div>
        </div>
        
        {/* Show mastery stats */}
        <div className="flex justify-between mt-4 text-gray-300 text-sm">
          <span>Mastery Progress</span>
          <span>{correctAnswersCount} correct answers</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            style={{ width: `${(correctAnswersCount / totalQuestionsInNode) * 100}%` }}
          ></div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FixedREDIExerciseNew;