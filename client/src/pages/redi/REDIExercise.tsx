import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getExerciseById, getExerciseNodes } from '@/data/exercises';
import { useToast } from '@/hooks/use-toast';

// This is a completely rebuilt, non-form based implementation
function REDIExercise() {
  // Setup hooks and params
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const params = useParams<{ exerciseId: string }>();
  const [, navigate] = useLocation();
  const { progress, completeExercise, updateProgress, calculateRediLevel } = useProgress();
  
  // Set REDI theme
  useEffect(() => { setTheme('redi'); }, [setTheme]);

  // Static exercise set - we define 5 questions for predictability
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // For any one exercise
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [writingResponse, setWritingResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [validationError, setValidationError] = useState('');
  
  // Build exercise set
  useEffect(() => {
    if (!params.exerciseId || questions.length > 0 || !progress) return;
    
    // Create a predictable set of 5 exercises starting with the selected one
    const baseExercise = getExerciseById(params.exerciseId);
    if (!baseExercise) {
      navigate('/redi');
      return;
    }
    
    // Get available exercises
    const nodes = getExerciseNodes(
      progress.rediSkillMastery,
      progress.completedExercises || []
    );
    
    // Get matching and other exercises
    const sameType = nodes
      .filter(node => node.skillType === baseExercise.skillType && 
             (node.status === 'available' || node.status === 'current'))
      .map(node => node.id);
      
    const otherType = nodes
      .filter(node => node.skillType !== baseExercise.skillType && 
             (node.status === 'available' || node.status === 'current'))
      .map(node => node.id);
    
    // Start with the selected exercise
    let set = [params.exerciseId];
    
    // Add other exercises
    const pool = [...sameType, ...otherType].filter(id => id !== params.exerciseId);
    
    // Randomly add from pool to reach 5
    while (set.length < 5 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      set.push(pool[idx]);
      pool.splice(idx, 1);
    }
    
    // Fill with duplicates if needed
    while (set.length < 5) {
      set.push(set[Math.floor(Math.random() * set.length)]);
    }
    
    setQuestions(set);
  }, [params.exerciseId, progress, questions.length, navigate]);
  
  // Current exercise data
  const currentExercise = questions.length > 0 ? getExerciseById(questions[currentIndex]) : null;
  
  // Reset state when moving to a new question
  useEffect(() => {
    setCurrentAnswer(null);
    setIsCorrect(false);
    setShowResult(false);
    setWritingResponse('');
    setWordCount(0);
    setValidationError('');
  }, [currentIndex]);
  
  // If exercise not found, go back to map
  useEffect(() => {
    if (!currentExercise && params.exerciseId) {
      navigate('/redi');
    }
  }, [currentExercise, params.exerciseId, navigate]);
  
  // Show nothing until we're ready to render
  if (!currentExercise || questions.length === 0) {
    return null;
  }
  
  // Check if this is the last question
  const isLastQuestion = currentIndex === questions.length - 1;
  
  // Handlers for multiple choice
  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setCurrentAnswer(index);
  };
  
  const handleMultipleChoiceSubmit = () => {
    if (currentAnswer === null || showResult) return;
    
    // Check if correct
    const correct = currentAnswer === currentExercise.correctOptionIndex;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Increment correct count
    if (correct) {
      setTotalCorrect(prev => prev + 1);
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
  
  // Handlers for writing exercises
  const handleWritingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setWritingResponse(text);
    
    // Count words
    const words = text.trim().split(/\s+/);
    const count = text.trim() === '' ? 0 : words.length;
    setWordCount(count);
    
    // Clear validation errors
    if (validationError) {
      setValidationError('');
    }
  };
  
  const handleWritingSubmit = () => {
    if (showResult) return;
    
    // Check word count
    if (wordCount < (currentExercise.minWordCount || 50)) {
      setValidationError(`Please write at least ${currentExercise.minWordCount || 50} words. Currently: ${wordCount} words.`);
      return;
    }
    
    // Mark as correct and show result
    setIsCorrect(true);
    setShowResult(true);
    setTotalCorrect(prev => prev + 1);
    
    toast({
      title: "Exercise Complete!",
      description: "Your submission meets the requirements. Click Continue to proceed.",
      duration: 3000,
    });
  };
  
  // Handle continue button
  const handleContinue = async () => {
    // If this is the last question, finish the set
    if (isLastQuestion) {
      // Success criteria: at least 3/5 correct
      const isSuccessful = totalCorrect >= 3;
      
      // Update skill mastery if successful
      if (isSuccessful && progress) {
        // Calculate skill increase based on correct answers
        const skillIncrease = Math.min(totalCorrect * 5, 20);
        
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
          description: `You got ${totalCorrect} out of ${questions.length} correct. Your ${currentExercise.skillType} mastery increased by ${skillIncrease}%.`,
        });
      } else {
        toast({
          title: "Exercise Set Attempted",
          description: `You got ${totalCorrect} out of ${questions.length} correct. You need at least 3 correct to increase mastery.`,
        });
      }
      
      // Mark the exercise as completed
      if (params.exerciseId && completeExercise) {
        completeExercise(params.exerciseId, isSuccessful);
        
        toast({
          title: isSuccessful ? "Node Completed!" : "Node Attempted",
          description: isSuccessful 
            ? `You got ${totalCorrect} out of ${questions.length} correct! Node mastery unlocked.` 
            : `You got ${totalCorrect} out of ${questions.length} correct. Try again for better mastery.`,
        });
      }
      
      // Go back to map
      navigate('/redi');
      return;
    }
    
    // Move to next question
    setCurrentIndex(currentIndex + 1);
  };
  
  // Render the exercise
  return (
    <MainLayout 
      title={currentExercise.title} 
      showBackButton={true}
      onBackClick={() => navigate('/redi')}
    >
      <div className="text-gray-300 text-sm mb-4">
        Exercise {currentIndex + 1} of {questions.length}
      </div>
      
      {/* Exercise content */}
      <div className="bg-[#1e1e1e] rounded-xl p-5 shadow-lg">
        {/* Title and instructions */}
        <div className="mb-6">
          <h3 className="text-white font-orbitron text-xl mb-3">{currentExercise.title}</h3>
          <p className="text-gray-200 text-sm">{currentExercise.instructions}</p>
        </div>
        
        {/* Exercise content */}
        <div className="bg-[#121212] p-4 rounded-lg mb-6">
          <p className="text-gray-200 text-sm leading-relaxed">{currentExercise.content}</p>
        </div>
        
        {/* MULTIPLE CHOICE QUESTION */}
        {currentExercise.type !== 'writing' && (
          <>
            <div className="space-y-3 mb-6">
              {currentExercise.options?.map((option, index) => {
                // Determine styling based on selection and submission state
                let optionClasses = "w-full text-left bg-[#121212] hover:bg-opacity-80 transition-colors p-3 rounded-lg text-gray-200 text-sm border border-gray-700";
                
                if (showResult) {
                  if (index === currentExercise.correctOptionIndex) {
                    optionClasses = "w-full text-left bg-green-700 p-3 rounded-lg text-white text-sm border-2 border-[#39ff14]";
                  } else if (index === currentAnswer) {
                    optionClasses = "w-full text-left bg-red-700 p-3 rounded-lg text-white text-sm border-2 border-[#ff3864]";
                  }
                } else if (index === currentAnswer) {
                  optionClasses = "w-full text-left bg-[#6320ee] p-3 rounded-lg text-white text-sm border-2 border-[#39ff14]";
                }
                
                return (
                  <div 
                    key={index}
                    className={optionClasses}
                    onClick={() => handleOptionSelect(index)}
                    style={{ cursor: showResult ? 'default' : 'pointer' }}
                  >
                    {option}
                  </div>
                );
              })}
            </div>
            
            {/* Results or submit button */}
            {showResult ? (
              <div className="mb-6">
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-700/20' : 'bg-red-700/20'} mb-4`}>
                  <h4 className={`text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'} font-orbitron mb-2`}>
                    {isCorrect ? 'Correct!' : 'Not quite right'}
                  </h4>
                  <p className="text-gray-200 text-sm">
                    {isCorrect 
                      ? 'Great job! You selected the correct answer.' 
                      : `The correct answer was: ${currentExercise.options?.[currentExercise.correctOptionIndex || 0]}`
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="w-full py-3 text-center font-medium text-white bg-gradient-to-r from-[#6320ee] to-[#1c77c3] rounded-md shadow hover:opacity-90 transition font-orbitron"
                onClick={handleMultipleChoiceSubmit}
                style={{
                  cursor: currentAnswer === null ? 'not-allowed' : 'pointer',
                  opacity: currentAnswer === null ? 0.6 : 1
                }}
              >
                Submit Answer
              </div>
            )}
          </>
        )}
        
        {/* WRITING EXERCISE */}
        {currentExercise.type === 'writing' && (
          <>
            {/* Writing prompt */}
            <div className="mb-6 bg-[#1a1a1a] p-4 rounded-md text-white">
              {currentExercise.prompt || 'Write your response to the prompt.'}
            </div>
            
            {/* Writing area or result */}
            {!showResult ? (
              <div>
                <div className="mb-2">
                  <textarea 
                    placeholder="Write your response here..." 
                    value={writingResponse}
                    onChange={handleWritingChange}
                    className="min-h-[200px] w-full p-3 bg-[#0a0a0a] text-white border border-gray-700 rounded-md"
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span className={wordCount >= (currentExercise.minWordCount || 50) ? 'text-green-400' : 'text-gray-400'}>
                      Words: {wordCount} / {currentExercise.minWordCount || 50} minimum
                    </span>
                    {validationError && (
                      <span className="text-red-400">{validationError}</span>
                    )}
                  </div>
                </div>
                
                <div
                  className="w-full py-3 text-center font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md shadow hover:opacity-90 transition font-mono"
                  onClick={handleWritingSubmit}
                  style={{
                    cursor: writingResponse.trim() === '' ? 'not-allowed' : 'pointer',
                    opacity: writingResponse.trim() === '' ? 0.6 : 1
                  }}
                >
                  Submit Response
                </div>
              </div>
            ) : (
              <div className="mt-6">
                {/* Submitted response */}
                <div className="bg-[#1a1a1a] p-4 rounded-md mb-4">
                  <h3 className="text-green-400 font-bold mb-2">Your Response:</h3>
                  <div className="text-white whitespace-pre-wrap">{writingResponse}</div>
                </div>
                
                {/* Example response if provided */}
                {currentExercise.exampleResponse && (
                  <div className="bg-[#1a1a1a] p-4 rounded-md mb-4">
                    <h3 className="text-blue-400 font-bold mb-2">Example Response:</h3>
                    <div className="text-white whitespace-pre-wrap">{currentExercise.exampleResponse}</div>
                  </div>
                )}
                
                {/* Feedback message */}
                <div className="bg-green-900/30 border border-green-500 p-4 rounded-md mb-6">
                  <p className="text-green-400 font-medium">
                    Great job! Writing exercises help you practice expressing your thoughts clearly.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Continue button - only shown after answering */}
      {showResult && (
        <div className="mt-6 flex justify-end">
          <div 
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-all text-lg
            ${isCorrect 
              ? 'bg-green-600 hover:bg-green-500' 
              : 'bg-violet-600 hover:bg-violet-500'} 
            flex items-center gap-2 shadow-xl hover:shadow-2xl fixed bottom-8 right-8 z-50 animate-pulse cursor-pointer`}
            onClick={handleContinue}
          >
            {isLastQuestion ? 'Finish' : 'Continue'}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      )}
      
      {/* Exercise progress */}
      <div className="mt-8">
        <div className="flex justify-between mb-2 text-gray-300 text-sm">
          <span>Progress</span>
          <span>{currentIndex + 1} of {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </MainLayout>
  );
}

export default REDIExercise;
