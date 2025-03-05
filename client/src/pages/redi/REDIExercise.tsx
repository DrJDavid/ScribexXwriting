import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import ExerciseMultipleChoice from '@/components/exercises/ExerciseMultipleChoice';
import ExerciseWriting from '@/components/exercises/ExerciseWriting';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getExerciseById } from '@/data/exercises';

const REDIExercise: React.FC = () => {
  const { setTheme } = useTheme();
  const params = useParams<{ exerciseId: string }>();
  const [, navigate] = useLocation();
  const { completeExercise } = useProgress();
  const [exerciseIndex, setExerciseIndex] = useState(1);
  const [totalExercises, setTotalExercises] = useState(5);
  
  // Make sure REDI theme is active
  useEffect(() => {
    setTheme('redi');
  }, [setTheme]);
  
  // Get the exercise data
  const exercise = getExerciseById(params.exerciseId);
  
  // If exercise not found, go back to map
  useEffect(() => {
    if (!exercise && params.exerciseId) {
      navigate('/redi');
    }
  }, [exercise, params.exerciseId, navigate]);
  
  if (!exercise) {
    return null;
  }
  
  // Handle multiple choice submission
  const handleMultipleChoiceSubmit = (exerciseId: string, selectedOption: number, isCorrect: boolean) => {
    // Record the exercise completion in the progress context
    completeExercise(exerciseId, isCorrect);
  };
  
  // Handle writing submission
  const handleWritingSubmit = (exerciseId: string, response: string, isComplete: boolean) => {
    // For writing exercises, we consider them correct if they meet the minimum requirements
    completeExercise(exerciseId, isComplete);
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/redi');
  };

  // Determine if this is a writing exercise
  const isWritingExercise = exercise.type === 'writing';

  return (
    <MainLayout 
      title={exercise.title} 
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="text-gray-300 text-sm mb-4">
        Exercise {exerciseIndex} of {totalExercises}
      </div>
      
      {isWritingExercise ? (
        // Render writing exercise component
        <ExerciseWriting
          exerciseId={exercise.id}
          title={exercise.title}
          instructions={exercise.instructions}
          content={exercise.content}
          prompt={exercise.prompt || ''}
          minWordCount={exercise.minWordCount || 50}
          exampleResponse={exercise.exampleResponse}
          onSubmit={handleWritingSubmit}
        />
      ) : (
        // Render multiple choice component
        <ExerciseMultipleChoice
          exerciseId={exercise.id}
          title={exercise.title}
          instructions={exercise.instructions}
          content={exercise.content}
          options={exercise.options || []}
          correctOptionIndex={exercise.correctOptionIndex || 0}
          onSubmit={handleMultipleChoiceSubmit}
        />
      )}
    </MainLayout>
  );
};

export default REDIExercise;
