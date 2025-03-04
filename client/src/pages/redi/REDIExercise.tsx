import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import ExerciseMultipleChoice from '@/components/exercises/ExerciseMultipleChoice';
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
  
  // Handle answer submission
  const handleSubmit = (exerciseId: string, selectedOption: number, isCorrect: boolean) => {
    // Record the exercise completion in the progress context
    completeExercise(exerciseId, isCorrect);
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/redi');
  };

  return (
    <MainLayout 
      title={exercise.title} 
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="text-gray-300 text-sm mb-4">
        Exercise {exerciseIndex} of {totalExercises}
      </div>
      
      <ExerciseMultipleChoice
        exerciseId={exercise.id}
        title={exercise.title}
        instructions={exercise.instructions}
        content={exercise.content}
        options={exercise.options}
        correctOptionIndex={exercise.correctOptionIndex}
        onSubmit={handleSubmit}
      />
    </MainLayout>
  );
};

export default REDIExercise;
