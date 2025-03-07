import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

export interface ExerciseMultipleChoiceProps {
  exerciseId: string;
  title: string;
  instructions: string;
  content: string;
  options: string[];
  correctOptionIndex: number;
  onSubmit: (exerciseId: string, selectedOption: number, isCorrect: boolean) => void;
}

/**
 * Extremely simplified multiple choice component
 * No form submissions, just direct state management
 */
const ExerciseMultipleChoice: React.FC<ExerciseMultipleChoiceProps> = ({
  exerciseId,
  title,
  instructions,
  content,
  options,
  correctOptionIndex,
  onSubmit,
}) => {
  // Base state
  const { theme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Reset state when exercise changes
  useEffect(() => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsCorrect(false);
  }, [exerciseId]);
  
  // Theme classes
  const isREDI = theme === 'redi';
  const bgClass = isREDI ? 'bg-[#1e1e1e]' : 'bg-[#2d4438]';
  const contentBgClass = isREDI ? 'bg-[#121212]' : 'bg-[#1a2f23]';
  const accentClass = isREDI ? 'from-[#6320ee] to-[#1c77c3]' : 'from-[#3cb371] to-[#588157]';
  const selectedClass = isREDI ? 'bg-[#6320ee] border-[#39ff14]' : 'bg-[#3cb371] border-[#ffd700]';
  const correctClass = isREDI ? 'bg-green-700 border-[#39ff14]' : 'bg-green-700 border-[#ffd700]';
  const incorrectClass = isREDI ? 'bg-red-700 border-[#ff3864]' : 'bg-red-700 border-[#ff5a5f]';
  const fontClass = isREDI ? 'font-orbitron' : 'font-montserrat';

  // Handle selection of an option
  const selectOption = (index: number) => {
    if (!hasSubmitted) {
      setSelectedOption(index);
    }
  };
  
  // Submit the answer
  const submitAnswer = () => {
    if (selectedOption === null) return;
    
    // Calculate if correct
    const correct = selectedOption === correctOptionIndex;
    
    // Update local state
    setIsCorrect(correct);
    setHasSubmitted(true);
    
    // Call parent handler
    onSubmit(exerciseId, selectedOption, correct);
  };

  return (
    <div className={`${bgClass} rounded-xl p-5 shadow-lg`}>
      {/* Question title and instructions */}
      <div className="mb-6">
        <h3 className={`text-white ${fontClass} text-xl mb-3`}>{title}</h3>
        <p className="text-gray-200 text-sm">{instructions}</p>
      </div>
      
      {/* Question content */}
      <div className={`${contentBgClass} p-4 rounded-lg mb-6`}>
        <p className="text-gray-200 text-sm leading-relaxed">{content}</p>
      </div>
      
      {/* Answer options */}
      <div className="space-y-3 mb-6">
        {options.map((option, index) => {
          // Determine styling based on selection and submission state
          let optionClasses = `w-full text-left ${contentBgClass} hover:bg-opacity-80 transition-colors p-3 rounded-lg text-gray-200 text-sm border border-gray-700`;
          
          if (hasSubmitted) {
            if (index === correctOptionIndex) {
              optionClasses = `w-full text-left ${correctClass} p-3 rounded-lg text-white text-sm border-2`;
            } else if (index === selectedOption) {
              optionClasses = `w-full text-left ${incorrectClass} p-3 rounded-lg text-white text-sm border-2`;
            }
          } else if (index === selectedOption) {
            optionClasses = `w-full text-left ${selectedClass} p-3 rounded-lg text-white text-sm border-2`;
          }
          
          return (
            <div 
              key={index}
              className={optionClasses}
              onClick={() => selectOption(index)}
              style={{cursor: hasSubmitted ? 'default' : 'pointer'}}
            >
              {option}
            </div>
          );
        })}
      </div>
      
      {/* Results or submit button */}
      {hasSubmitted ? (
        <div className="mb-6">
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-700/20' : 'bg-red-700/20'} mb-4`}>
            <h4 className={`text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'} ${fontClass} mb-2`}>
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </h4>
            <p className="text-gray-200 text-sm">
              {isCorrect 
                ? 'Great job! You selected the correct answer.' 
                : `The correct answer was: ${options[correctOptionIndex]}`
              }
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`w-full py-3 text-center font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
          onClick={submitAnswer}
          style={{
            cursor: selectedOption === null ? 'not-allowed' : 'pointer',
            opacity: selectedOption === null ? 0.6 : 1
          }}
        >
          Submit Answer
        </div>
      )}
    </div>
  );
};

export default ExerciseMultipleChoice;
