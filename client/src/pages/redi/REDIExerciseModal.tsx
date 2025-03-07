import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface REDIExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  isCorrect: boolean;
  onContinue: () => void;
  fontClass?: string;
  accentClass?: string;
}

export function REDIExerciseModal({
  open,
  onOpenChange,
  title,
  message,
  isCorrect,
  onContinue,
  fontClass = 'font-orbitron',
  accentClass = 'from-[#6320ee] to-[#1c77c3]'
}: REDIExerciseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700" aria-describedby="exercise-feedback-message">
        <DialogHeader>
          <DialogTitle className={`text-xl ${isCorrect ? 'text-green-400' : 'text-red-400'} ${fontClass}`}>
            {title}
          </DialogTitle>
          <div className="text-gray-200 mt-2" id="exercise-feedback-message">
            {message}
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            className={`w-full py-3 font-medium text-white bg-gradient-to-r ${accentClass} rounded-md shadow hover:opacity-90 transition ${fontClass}`}
            onClick={() => {
              onOpenChange(false);
              onContinue();
            }}
            type="button"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default REDIExerciseModal;