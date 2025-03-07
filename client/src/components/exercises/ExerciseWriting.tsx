import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/context/ThemeContext';

export interface ExerciseWritingProps {
  exerciseId: string;
  title: string;
  instructions: string;
  content: string;
  prompt: string;
  minWordCount: number;
  exampleResponse?: string;
  onSubmit: (exerciseId: string, response: string, isComplete: boolean) => void;
}

const ExerciseWriting: React.FC<ExerciseWritingProps> = ({
  exerciseId,
  title,
  instructions,
  content,
  prompt,
  minWordCount,
  exampleResponse,
  onSubmit
}) => {
  const { theme } = useTheme();
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [wordCount, setWordCount] = useState(0);
  
  // Set theme-specific styling
  const accentClass = theme === 'redi' 
    ? 'from-blue-600 to-purple-600' 
    : 'from-amber-500 to-orange-500';
    
  const fontClass = theme === 'redi'
    ? 'font-mono'
    : 'font-serif';
  
  // Calculate word count
  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setResponse(text);
    // Count words by splitting on whitespace
    const words = text.trim().split(/\s+/);
    const count = text.trim() === '' ? 0 : words.length;
    setWordCount(count);
    
    // Clear validation message if they're typing again
    if (validationMessage) {
      setValidationMessage('');
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Check word count
    if (wordCount < minWordCount) {
      setValidationMessage(`Please write at least ${minWordCount} words. Current count: ${wordCount}.`);
      return;
    }
    
    // Submission is valid
    setSubmitted(true);
    setValidationMessage('');
    
    // We'll call onSubmit when clicking continue, not here
    // This prevents double submission events causing state issues
  };
  
  // Separate handler for the continue button
  const handleContinue = () => {
    // Always consider writing submissions as "correct"
    onSubmit(exerciseId, response, true);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className={`text-xl font-bold mb-4 ${theme === 'owl' ? 'text-amber-400' : 'text-blue-400'}`}>
        {instructions}
      </h2>
      
      <div className="mb-6 text-gray-300">
        {content}
      </div>
      
      <div className="mb-6 bg-gray-700 p-4 rounded-md text-white">
        {prompt}
      </div>
      
      {!submitted ? (
        <>
          <div className="mb-2">
            <Textarea 
              placeholder="Write your response here..." 
              value={response}
              onChange={handleResponseChange}
              className="min-h-[200px] bg-gray-900 text-white border-gray-700"
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className={wordCount >= minWordCount ? 'text-green-400' : 'text-gray-400'}>
                Words: {wordCount} / {minWordCount} minimum
              </span>
              {validationMessage && (
                <span className="text-red-400">{validationMessage}</span>
              )}
            </div>
          </div>
          
          <Button
            className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
            onClick={handleSubmit}
            disabled={response.trim() === ''}
          >
            Submit Response
          </Button>
        </>
      ) : (
        <div className="mt-6">
          <div className="bg-gray-700 p-4 rounded-md mb-4">
            <h3 className="text-green-400 font-bold mb-2">Your Response:</h3>
            <div className="text-white whitespace-pre-wrap">{response}</div>
          </div>
          
          {exampleResponse && (
            <div className="bg-gray-700 p-4 rounded-md mb-4">
              <h3 className="text-blue-400 font-bold mb-2">Example Response:</h3>
              <div className="text-white whitespace-pre-wrap">{exampleResponse}</div>
            </div>
          )}
          
          <div className="bg-green-900/30 border border-green-500 p-4 rounded-md mb-6">
            <p className="text-green-400 font-medium">
              Great job! Writing exercises help you practice expressing your thoughts clearly.
            </p>
          </div>
          
          <Button
            className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExerciseWriting;