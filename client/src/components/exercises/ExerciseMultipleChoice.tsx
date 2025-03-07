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

const ExerciseMultipleChoice: React.FC<ExerciseMultipleChoiceProps> = ({
  exerciseId,
  title,
  instructions,
  content,
  options,
  correctOptionIndex,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Effect to reset state when exerciseId changes (new question)
  useEffect(() => {
    // Reset state for new exercise
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsCorrect(false);
  }, [exerciseId]);
  
  const isREDI = theme === 'redi';
  
  // Theme-specific classes
  const bgClass = isREDI ? 'bg-[#1e1e1e]' : 'bg-[#2d4438]';
  const contentBgClass = isREDI ? 'bg-[#121212]' : 'bg-[#1a2f23]';
  const accentClass = isREDI ? 'from-[#6320ee] to-[#1c77c3]' : 'from-[#3cb371] to-[#588157]';
  const selectedClass = isREDI 
    ? 'bg-[#6320ee] border-[#39ff14]' 
    : 'bg-[#3cb371] border-[#ffd700]';
  const correctClass = isREDI 
    ? 'bg-green-700 border-[#39ff14]' 
    : 'bg-green-700 border-[#ffd700]';
  const incorrectClass = isREDI 
    ? 'bg-red-700 border-[#ff3864]' 
    : 'bg-red-700 border-[#ff5a5f]';
  const fontClass = isREDI ? 'font-orbitron' : 'font-montserrat';
  
  const handleOptionSelect = (index: number) => {
    if (!hasSubmitted) {
      setSelectedOption(index);
    }
  };
  
  const handleSubmit = () => {
    if (selectedOption !== null) {
      const correct = selectedOption === correctOptionIndex;
      setIsCorrect(correct);
      setHasSubmitted(true);
      // We'll call onSubmit but NOT when handling the initial submit
      // This prevents double-calling which may cause state issues
    }
  };
  
  // Separate function to handle the continue button click
  const handleContinue = () => {
    if (selectedOption !== null) {
      // Call onSubmit with hasSubmitted=true to indicate this is 
      // a continuation after already submitting an answer
      console.log("Continue clicked, notifying parent to advance");
      onSubmit(exerciseId, selectedOption, isCorrect);
    }
  };

  return (
    <div className={`${bgClass} rounded-xl p-5 shadow-lg`}>
      <div className="mb-6">
        <h3 className={`text-white ${fontClass} text-xl mb-3`}>{title}</h3>
        <p className="text-gray-200 text-sm">{instructions}</p>
      </div>
      
      <div className={`${contentBgClass} p-4 rounded-lg mb-6`}>
        <p className="text-gray-200 text-sm leading-relaxed">
          {content}
        </p>
      </div>
      
      {/* Multiple choice options */}
      <div className="space-y-3 mb-6">
        {options.map((option, index) => {
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
          
          <Button
            className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      ) : (
        <Button
          className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
          onClick={handleSubmit}
          disabled={selectedOption === null}
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
};

export default ExerciseMultipleChoice;
