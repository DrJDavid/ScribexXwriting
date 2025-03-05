import { SkillMastery } from '@shared/schema';
import { NodeStatus } from '@/components/redi/REDIMapNode';

// Define exercise type
export type ExerciseType = 'multiple-choice' | 'writing';

// Define exercise interface with optional fields to accommodate both types
export interface Exercise {
  id: string;
  title: string;
  level: number;
  skillType: 'mechanics' | 'sequencing' | 'voice';
  type?: ExerciseType; // Made optional for backward compatibility
  instructions: string;
  content: string;
  options?: string[];
  correctOptionIndex?: number;
  prompt?: string;
  minWordCount?: number;
  exampleResponse?: string;
}

// Define map node type that adds display information to exercise
export interface ExerciseMapNode extends Exercise {
  status: NodeStatus;
  position: { x: number; y: number };
  mastery?: number;
}

// Function to determine exercise availability based on skill mastery
const getExerciseStatus = (
  exerciseId: string,
  level: number,
  skillType: string,
  skillMastery: SkillMastery,
  completedExercises: string[] = []
): NodeStatus => {
  // If already completed
  if (completedExercises.includes(exerciseId)) {
    return 'completed';
  }
  
  // Base skill mastery requirement (each level requires +10% mastery)
  const masteryRequirement = (level - 1) * 10;
  
  // Get relevant skill mastery
  const relevantMastery = skillMastery[skillType as keyof SkillMastery];
  
  // If mastery is sufficient but not completed, mark as available or current
  if (relevantMastery >= masteryRequirement) {
    // Find lowest available level that's not completed - mark as current
    const lowestAvailableLevel = EXERCISES
      .filter(ex => !completedExercises.includes(ex.id) && 
        (skillMastery[ex.skillType as keyof SkillMastery] >= (ex.level - 1) * 10))
      .sort((a, b) => a.level - b.level)[0];
    
    if (lowestAvailableLevel && lowestAvailableLevel.id === exerciseId) {
      return 'current';
    }
    
    return 'available';
  }
  
  // Otherwise locked
  return 'locked';
};

// List of all exercises
export const EXERCISES: Exercise[] = [
  // Mechanics Exercises
  {
    id: 'mechanics-1',
    title: 'Grammar Basics',
    level: 1,
    skillType: 'mechanics',
    type: 'multiple-choice',
    instructions: 'Choose the sentence with correct grammar',
    content: 'Read each option and select the sentence with proper grammar.',
    options: [
      'The books is on the table.',
      'The books are on the table.',
      'The books on the table.',
      'The books be on the table.'
    ],
    correctOptionIndex: 1
  },
  {
    id: 'mechanics-2',
    title: 'Punctuation',
    level: 2,
    skillType: 'mechanics',
    type: 'multiple-choice',
    instructions: 'Select the correctly punctuated sentence',
    content: 'Choose the option with proper punctuation.',
    options: [
      'Where are you going.',
      'Where are you going!',
      'Where are you going?',
      'Where are you going,'
    ],
    correctOptionIndex: 2
  },
  {
    id: 'mechanics-3',
    title: 'Subject-Verb Agreement',
    level: 3,
    skillType: 'mechanics',
    type: 'multiple-choice',
    instructions: 'Select the sentence with correct subject-verb agreement',
    content: 'Read each option and choose the sentence where the subject and verb properly agree.',
    options: [
      'The team are working on different projects.',
      'The team is working on different projects.',
      'The group of students are working on their projects.',
      'The group of students is working on their projects.'
    ],
    correctOptionIndex: 3
  },
  {
    id: 'mechanics-4',
    title: 'Tense Consistency',
    level: 4,
    skillType: 'mechanics',
    type: 'multiple-choice',
    instructions: 'Choose the sentence with consistent verb tense',
    content: 'Identify the sentence that maintains a consistent verb tense throughout.',
    options: [
      'She went to the store and buys some apples.',
      'She goes to the store and bought some apples.',
      'She went to the store and bought some apples.',
      'She goes to the store and buys some apples, then she left.'
    ],
    correctOptionIndex: 2
  },
  {
    id: 'mechanics-5',
    title: 'Apostrophe Usage',
    level: 5,
    skillType: 'mechanics',
    type: 'multiple-choice',
    instructions: 'Select the sentence with correct apostrophe usage',
    content: 'Identify proper use of apostrophes in possessives and contractions.',
    options: [
      'The dogs bone is under the table.',
      'The dog\'s bone is under the table.',
      'The dogs\' bone is under the table.',
      'The dog\'s bone\'s under the table.'
    ],
    correctOptionIndex: 1
  },
  
  // Sequencing Exercises
  {
    id: 'sequencing-1',
    title: 'Paragraph Order',
    level: 1,
    skillType: 'sequencing',
    type: 'multiple-choice',
    instructions: 'Choose the correct sequence for these sentences',
    content: 'Which order would make these sentences a logical paragraph?\n1. Then, add the eggs and mix well.\n2. First, combine the flour and sugar.\n3. Finally, bake for 30 minutes.\n4. Next, pour the batter into a pan.',
    options: [
      '1, 2, 3, 4',
      '2, 1, 4, 3',
      '4, 3, 2, 1',
      '2, 3, 1, 4'
    ],
    correctOptionIndex: 1
  },
  {
    id: 'sequencing-2',
    title: 'Topic Sentences',
    level: 2,
    skillType: 'sequencing',
    type: 'multiple-choice',
    instructions: 'Identify the topic sentence',
    content: 'Although many people think of spiders as insects, they are actually arachnids. Spiders have eight legs, while insects have only six. Unlike insects, spiders don\'t have antennae or wings. Another difference is that spiders have two body segments, while insects have three. These differences are important to scientists who study arthropods.',
    options: [
      'Spiders have eight legs, while insects have only six.',
      'Although many people think of spiders as insects, they are actually arachnids.',
      'These differences are important to scientists who study arthropods.',
      'Another difference is that spiders have two body segments, while insects have three.'
    ],
    correctOptionIndex: 1
  },
  {
    id: 'sequencing-3',
    title: 'Paragraph Flow',
    level: 3,
    skillType: 'sequencing',
    type: 'multiple-choice',
    instructions: 'Select the sentence that best continues the paragraph',
    content: 'Recycling has many benefits for our environment. It reduces the amount of waste sent to landfills. It also conserves natural resources and prevents pollution.',
    options: [
      'However, not everyone agrees about climate change.',
      'My family recycles paper, plastic, and glass.',
      'Furthermore, recycling helps save energy and reduces greenhouse gas emissions.',
      'Plastic water bottles are very common litter items.'
    ],
    correctOptionIndex: 2
  },
  {
    id: 'sequencing-4',
    title: 'Transition Words',
    level: 4,
    skillType: 'sequencing',
    type: 'multiple-choice',
    instructions: 'Choose the best transition word or phrase',
    content: 'I wanted to go to the concert. __________, I couldn\'t afford the tickets.',
    options: [
      'Furthermore',
      'However',
      'Similarly',
      'Consequently'
    ],
    correctOptionIndex: 1
  },
  {
    id: 'sequencing-5',
    title: 'Logical Organization',
    level: 5,
    skillType: 'sequencing',
    type: 'multiple-choice',
    instructions: 'Identify the best organizational structure',
    content: 'You\'re writing an essay about the causes and effects of climate change. Which organizational structure would work best?',
    options: [
      'Chronological order (events by time)',
      'Cause and effect structure',
      'Compare and contrast structure',
      'Spatial organization (by location)'
    ],
    correctOptionIndex: 1
  },
  
  // Writing Exercises
  {
    id: 'mechanics-writing-1',
    title: 'Fix Grammar Errors',
    level: 3,
    skillType: 'mechanics',
    type: 'writing',
    instructions: 'Rewrite the paragraph, correcting all grammar errors',
    content: 'In this exercise, you will practice identifying and fixing grammar errors in a short paragraph.',
    prompt: 'The following paragraph contains several grammar errors. Rewrite it with correct grammar:\n\nLast week, me and my friend goes to the store. We buyed some snacks and drinks for the party. When we gets home, my sister help us to set up. There was many people at the party. Everyone have a good time.',
    minWordCount: 50,
    exampleResponse: 'Last week, my friend and I went to the store. We bought some snacks and drinks for the party. When we got home, my sister helped us to set up. There were many people at the party. Everyone had a good time.'
  },
  {
    id: 'voice-writing-1',
    title: 'Write a Personal Narrative',
    level: 3,
    skillType: 'voice',
    type: 'writing',
    instructions: 'Write a short personal narrative about a memorable experience',
    content: 'Practice using descriptive language and appropriate tone to convey your personal experience.',
    prompt: 'Write a short personal narrative about a time when you tried something new. How did you feel before, during, and after the experience? Use descriptive language that engages the readers senses.',
    minWordCount: 100
  },
  
  // Voice Exercises
  {
    id: 'voice-1',
    title: 'Audience Awareness',
    level: 1,
    skillType: 'voice',
    type: 'multiple-choice',
    instructions: 'Select the sentence with appropriate tone for a formal essay',
    content: 'You\'re writing a research paper for school. Which sentence has the most appropriate tone?',
    options: [
      'This stuff about climate change is pretty scary, you know?',
      'Climate change is like, a really big problem for everyone.',
      'The evidence suggests that climate change poses significant challenges to global ecosystems.',
      'OMG! Climate change is THE WORST thing ever!!!'
    ],
    correctOptionIndex: 2
  },
  {
    id: 'voice-2',
    title: 'Vivid Language',
    level: 2,
    skillType: 'voice',
    type: 'multiple-choice',
    instructions: 'Choose the sentence with the most vivid descriptive language',
    content: 'Select the option that paints the clearest picture in the reader\'s mind.',
    options: [
      'The dog ran in the yard.',
      'The golden retriever sprinted across the sun-dappled lawn, ears flapping in the breeze.',
      'The canine moved quickly outside in the yard area.',
      'The dog, which was in the yard, ran around a lot and seemed happy about it.'
    ],
    correctOptionIndex: 1
  },
  {
    id: 'voice-3',
    title: 'Active vs. Passive Voice',
    level: 3,
    skillType: 'voice',
    type: 'multiple-choice',
    instructions: 'Identify the sentence written in active voice',
    content: 'Select the option that uses active rather than passive voice.',
    options: [
      'The ball was thrown by the pitcher.',
      'The window was broken by the storm.',
      'The committee is considering the proposal.',
      'It was decided by the judges that the contest would be canceled.'
    ],
    correctOptionIndex: 2
  },
  {
    id: 'voice-4',
    title: 'Persuasive Language',
    level: 4,
    skillType: 'voice',
    type: 'multiple-choice',
    instructions: 'Choose the most persuasive statement',
    content: 'You\'re writing to convince your school to start a recycling program. Which statement is most persuasive?',
    options: [
      'You should start a recycling program.',
      'I think it would be nice to have recycling bins.',
      'By implementing a recycling program, our school could reduce waste by 40% and save $3,000 annually.',
      'Recycling is good for the environment, so we should do it.'
    ],
    correctOptionIndex: 2
  },
  {
    id: 'voice-5',
    title: 'Emotional Appeal',
    level: 5,
    skillType: 'voice',
    type: 'multiple-choice',
    instructions: 'Select the sentence with the strongest emotional appeal',
    content: 'You\'re writing about animal adoption. Which sentence creates the strongest emotional connection?',
    options: [
      'Animal shelters have many pets available for adoption.',
      'The statistical data shows increased adoption rates in the spring months.',
      'Approximately 6.5 million companion animals enter shelters each year.',
      'Every day, lonely animals wait in shelters, hoping for someone to give them a loving forever home.'
    ],
    correctOptionIndex: 3
  },
];

// Define node positions on the map
const POSITIONS = {
  'mechanics-1': { x: 30, y: 50 },
  'mechanics-2': { x: 120, y: 50 },
  'mechanics-3': { x: 210, y: 50 },
  'mechanics-4': { x: 300, y: 50 },
  'mechanics-5': { x: 390, y: 50 },
  'mechanics-writing-1': { x: 210, y: 100 }, // Writing exercise for mechanics
  
  'sequencing-1': { x: 60, y: 150 },
  'sequencing-2': { x: 150, y: 150 },
  'sequencing-3': { x: 240, y: 150 },
  'sequencing-4': { x: 330, y: 150 },
  'sequencing-5': { x: 420, y: 150 },
  
  'voice-1': { x: 90, y: 250 },
  'voice-2': { x: 180, y: 250 },
  'voice-3': { x: 270, y: 250 },
  'voice-4': { x: 360, y: 250 },
  'voice-5': { x: 450, y: 250 },
  'voice-writing-1': { x: 270, y: 300 }, // Writing exercise for voice
};

// Create map nodes with positions and default status
export const getExerciseNodes = (
  skillMastery: SkillMastery,
  completedExercises: string[] = []
): ExerciseMapNode[] => {
  return EXERCISES.map(exercise => {
    // Calculate mastery based on completion
    let mastery: number | undefined = undefined;
    if (completedExercises.includes(exercise.id)) {
      // For completed exercises, show a mastery % based on skill level
      const baseSkillMastery = skillMastery[exercise.skillType as keyof SkillMastery];
      // Slightly randomize it for visual variety, but ensure it's at least 80%
      mastery = Math.max(80, Math.min(100, baseSkillMastery + Math.floor(Math.random() * 10)));
    }
    
    return {
      ...exercise,
      position: POSITIONS[exercise.id as keyof typeof POSITIONS],
      status: getExerciseStatus(
        exercise.id,
        exercise.level,
        exercise.skillType,
        skillMastery,
        completedExercises
      ),
      mastery
    };
  });
};

// Get a specific exercise by ID
export const getExerciseById = (id: string): Exercise | undefined => {
  return EXERCISES.find(exercise => exercise.id === id);
};
