// Copied from shared/schema.ts to make types available to client components

export interface User {
  id: number;
  username: string;
  password: string;
  displayName: string;
  email?: string | null;
  age?: number | null;
  grade?: number | null;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  createdAt: Date;
}

export interface Progress {
  userId: number;
  rediSkillMastery: {
    mechanics: number;
    sequencing: number;
    voice: number;
  };
  owlSkillMastery: {
    mechanics: number;
    sequencing: number;
    voice: number;
  };
  completedExercises: string[];
  completedQuests: string[];
  unlockedLocations: string[];
  rediLevel: number;
  owlLevel: number;
  currency: number;
  achievements: string[];
  progressHistory: any[];
  currentStreak: number;
  longestStreak: number;
  lastWritingDate: string | null;
  completedDailyChallenges: number[];
}

export interface ExerciseAttempt {
  id: number;
  userId: number;
  exerciseId: string;
  isCorrect: boolean;
  response: string;
  createdAt: Date;
}

export interface WritingSubmission {
  id: number;
  userId: number;
  questId: string;
  title: string;
  content: string;
  status: 'draft' | 'submitted' | 'reviewed';
  submittedAt: Date | null;
  feedback: string | null;
  aiFeedback: any | null;
  skillsAssessed: any | null;
  suggestedExercises: string[] | null;
}

export interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  prompt: string;
  wordMinimum: number;
  skillFocus: 'mechanics' | 'sequencing' | 'voice';
  difficulty: number;
  expiresAt: Date;
}

export interface TeacherStudent {
  teacherId: number;
  studentId: number;
  createdAt: Date;
}

export interface ParentStudent {
  parentId: number;
  studentId: number;
  createdAt: Date;
}

export interface SkillMastery {
  mechanics: number;
  sequencing: number;
  voice: number;
}

export interface AIFeedback {
  overallFeedback: string;
  strengthsAnalysis: string;
  areasToImprove: string;
  mechanicsScore: number;
  sequencingScore: number;
  voiceScore: number;
  suggestions: {
    mechanics?: string[];
    sequencing?: string[];
    voice?: string[];
  };
  nextSteps: string;
}