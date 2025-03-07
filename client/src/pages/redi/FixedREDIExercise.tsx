import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { useToast } from '@/hooks/use-toast';
import { getExerciseById, getExerciseNodes } from '@/data/exercises';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';

/**
 * Fixed REDI Exercise component that combines all exercise types into a single component 
 * to prevent component swapping and state reset issues.
 */
const FixedREDIExercise: React.FC = () => {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const params = useParams<{ exerciseId: string }>();
  const [, navigate] = useLocation();
  const { progress, completeExercise, updateProgress } = useProgress();
  
  // Initial exercise ID from URL
  const initialExerciseId = params.exerciseId || '';
  
  // Track which stage of the exercise set we're in
  const [exerciseIndex, setExerciseIndex] = useState(1);
  const [totalExercises, setTotalExercises] = useState(5);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  // Exercise set management - keep track of all exercises in the set
  const [exerciseSet, setExerciseSet] = useState<string[]>([]);
  const [currentExerciseId, setCurrentExerciseId] = useState(initialExerciseId);
  
  // Multiple choice exercise state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  
  // Writing exercise state
  const [writingResponse, setWritingResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  
  // Ensure REDI theme is active
  useEffect(() => {
    setTheme('redi');
  }, [setTheme]);
  
  // Get the current exercise data
  const exercise = getExerciseById(currentExerciseId);
  const isWritingExercise = exercise?.type === 'writing';

  // Generate initial exercise set on component mount
  useEffect(() => {
    if (exercise && exerciseSet.length === 0) {
      console.log("🔍 Generating exercise set for", exercise.id);
      
      // Get nodes of the same skill type
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
      
      console.log("✅ Exercise set generated:", exerciseSelection);
      setExerciseSet(exerciseSelection);
      setTotalExercises(exerciseSelection.length);
    }
  }, [exercise, progress]);
  
  // Handle exercise not found
  useEffect(() => {
    if (!exercise && initialExerciseId) {
      navigate('/redi');
    }
  }, [exercise, initialExerciseId, navigate]);
  
  // Reset exercise-specific state when changing to a new exercise
  useEffect(() => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsAnswerCorrect(false);
    setWritingResponse('');
    setWordCount(0);
    setValidationMessage('');
  }, [currentExerciseId]);
  
  // Abort early if exercise is not found
  if (!exercise) {
    return null;
  }
  
  // Calculate word count for writing exercises
  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setWritingResponse(text);
    
    // Count words by splitting on whitespace
    const words = text.trim().split(/\s+/);
    const count = text.trim() === '' ? 0 : words.length;
    setWordCount(count);
    
    // Clear validation message if they're typing again
    if (validationMessage) {
      setValidationMessage('');
    }
  };
  
  // Handle selection of multiple choice option
  const handleOptionSelect = (index: number) => {
    if (!hasSubmitted) {
      setSelectedOption(index);
    }
  };
  
  // Handle the submission of an answer for multiple choice exercises
  const handleMultipleChoiceSubmit = () => {
    if (selectedOption !== null) {
      const isCorrect = selectedOption === exercise.correctOptionIndex;
      setIsAnswerCorrect(isCorrect);
      setHasSubmitted(true);
      
      // Record correct answers
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
    }
  };
  
  // Handle the submission of a writing exercise
  const handleWritingSubmit = () => {
    // Check word count
    if (wordCount < (exercise.minWordCount || 50)) {
      setValidationMessage(`Please write at least ${exercise.minWordCount || 50} words. Current count: ${wordCount}.`);
      return;
    }
    
    // Submission is valid
    setHasSubmitted(true);
    setValidationMessage('');
    setIsAnswerCorrect(true); // Writing exercises are always considered "correct"
    
    // Increment correct answers count for the exercise set
    setCorrectAnswers(prev => prev + 1);
    
    toast({
      title: "Exercise Complete!",
      description: "Your submission meets the requirements. Click Continue to proceed.",
    });
  };
  
  // Advance to the next exercise in the set
  const handleNextExercise = () => {
    console.log("➡️ Advancing to next exercise", { currentIndex: exerciseIndex, total: totalExercises });
    
    // If we've completed all exercises in the set
    if (exerciseIndex >= totalExercises) {
      console.log("🏆 Exercise set completed!");
      
      // Prepare skill mastery update
      const isSuccessful = correctAnswers >= 3;
      
      if (isSuccessful && progress) {
        // Calculate skill increase based on correct answers
        const skillIncrease = Math.min(correctAnswers * 5, 20); // Cap at 20% increase
        
        // Create a skill update object based on exercise type
        const updatedSkillMastery = { ...progress.rediSkillMastery };
        
        if (exercise.skillType === 'mechanics') {
          updatedSkillMastery.mechanics = Math.min(updatedSkillMastery.mechanics + skillIncrease, 100);
        } else if (exercise.skillType === 'sequencing') {
          updatedSkillMastery.sequencing = Math.min(updatedSkillMastery.sequencing + skillIncrease, 100);
        } else if (exercise.skillType === 'voice') {
          updatedSkillMastery.voice = Math.min(updatedSkillMastery.voice + skillIncrease, 100);
        }
        
        // Calculate new REDI level
        const exerciseCount = progress.completedExercises.length;
        const totalMastery = updatedSkillMastery.mechanics + 
                           updatedSkillMastery.sequencing + 
                           updatedSkillMastery.voice;
        const avgMastery = totalMastery / 3;
        const exerciseFactor = Math.floor(exerciseCount / 3);
        const masteryFactor = Math.floor(avgMastery / 10);
        const rediLevel = Math.max(1, Math.min(10, 1 + exerciseFactor + masteryFactor));
        
        // Update progress
        updateProgress({
          rediSkillMastery: updatedSkillMastery,
          rediLevel,
        }).then(() => {
          toast({
            title: "Exercise Set Completed!",
            description: `You got ${correctAnswers} out of ${totalExercises} correct. Your ${exercise.skillType} mastery increased by ${skillIncrease}%.`,
          });
          
          // Mark original exercise as completed
          if (initialExerciseId) {
            completeExercise(initialExerciseId, isSuccessful);
          }
          
          // Return to REDI map
          navigate('/redi');
        });
      } else {
        // No mastery increase if not successful
        toast({
          title: "Exercise Set Attempted",
          description: `You got ${correctAnswers} out of ${totalExercises} correct. You need at least 3 correct to increase mastery.`,
        });
        
        // Mark exercise as attempted
        if (initialExerciseId) {
          completeExercise(initialExerciseId, false);
        }
        
        // Return to REDI map
        navigate('/redi');
      }
      
      return;
    }
    
    // Get the next exercise ID - arrays are 0-indexed but exerciseIndex is 1-indexed for UI
    const nextExerciseId = exerciseSet[exerciseIndex];
    
    if (nextExerciseId) {
      // Get next exercise details to check if it exists
      const nextExercise = getExerciseById(nextExerciseId);
      
      if (nextExercise) {
        console.log("🔄 Moving to next exercise:", nextExercise.title);
        
        // Set the new exercise ID
        setCurrentExerciseId(nextExerciseId);
        
        // Increment exercise index
        setExerciseIndex(prevIndex => prevIndex + 1);
      } else {
        console.log("❌ Next exercise not found, returning to map");
        navigate('/redi');
      }
    } else {
      console.log("❌ No next exercise in set, returning to map");
      navigate('/redi');
    }
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/redi');
  };
  
  // Theme-specific styling for multiple choice options
  const theme = 'redi'; // Always use REDI theme
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
                    // Prevent default form submission behavior
                    e.preventDefault();
                    e.stopPropagation();
                    // Call our handler
                    handleWritingSubmit();
                  }}
                  disabled={writingResponse.trim() === ''}
                  type="button" // Explicitly set button type to prevent form submission
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
                
                <Button
                  className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNextExercise();
                  }}
                  type="button"
                >
                  Continue
                </Button>
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
                    onClick={() => handleOptionSelect(index)}
                    whileHover={!hasSubmitted ? { scale: 1.01 } : {}}
                    whileTap={!hasSubmitted ? { scale: 0.99 } : {}}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
            
            {hasSubmitted ? (
              <div className="mb-6">
                <div className={`p-4 rounded-lg ${isAnswerCorrect ? 'bg-green-700/20' : 'bg-red-700/20'} mb-4`}>
                  <h4 className={`text-lg ${isAnswerCorrect ? 'text-green-400' : 'text-red-400'} ${fontClass} mb-2`}>
                    {isAnswerCorrect ? 'Correct!' : 'Not quite right'}
                  </h4>
                  <p className="text-gray-200 text-sm">
                    {isAnswerCorrect 
                      ? 'Great job! You selected the correct answer.' 
                      : `The correct answer was: ${exercise.options?.[exercise.correctOptionIndex || 0]}`
                    }
                  </p>
                </div>
                
                <Button
                  className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
                  onClick={handleNextExercise}
                >
                  Continue
                </Button>
              </div>
            ) : (
              <Button
                className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
                onClick={(e) => {
                  // Prevent default form submission behavior
                  e.preventDefault();
                  e.stopPropagation();
                  // Call our handler
                  handleMultipleChoiceSubmit();
                }}
                disabled={selectedOption === null}
                type="button" // Explicitly set button type to prevent form submission
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

export default FixedREDIExercise;