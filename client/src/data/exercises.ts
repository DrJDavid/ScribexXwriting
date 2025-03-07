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
  // Mechanics exercises row - More horizontal spacing and slight vertical variation
  'mechanics-1': { x: 40, y: 60 },
  'mechanics-2': { x: 160, y: 50 },
  'mechanics-3': { x: 280, y: 65 },
  'mechanics-4': { x: 400, y: 45 },
  'mechanics-5': { x: 520, y: 60 },
  
  // Writing exercises row - placed to create a visual branch
  'mechanics-writing-1': { x: 640, y: 55 }, // Writing exercise for mechanics
  
  // Sequencing exercises row - with more spacing and staggered positioning
  'sequencing-1': { x: 80, y: 200 },
  'sequencing-2': { x: 200, y: 185 },
  'sequencing-3': { x: 320, y: 210 },
  'sequencing-4': { x: 440, y: 190 },
  'sequencing-5': { x: 560, y: 205 },
  
  // Voice exercises row - with more spacing and staggered positioning
  'voice-1': { x: 120, y: 340 },
  'voice-2': { x: 240, y: 325 },
  'voice-3': { x: 360, y: 350 },
  'voice-4': { x: 480, y: 330 },
  'voice-5': { x: 600, y: 345 },
  'voice-writing-1': { x: 720, y: 335 }, // Writing exercise for voice
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

// Get the next exercise based on the current exercise ID
export const getNextExerciseId = (currentId: string): string | undefined => {
  const currentIndex = EXERCISES.findIndex(exercise => exercise.id === currentId);
  if (currentIndex === -1 || currentIndex === EXERCISES.length - 1) {
    return undefined; // No next exercise
  }
  return EXERCISES[currentIndex + 1].id;
};

// NodeQuestions data structure for sub-questions within a node
export interface NodeQuestion {
  id: string;
  questionNumber: number;
  title: string;
  instructions: string;
  content: string;
  type: ExerciseType;
  options?: string[];
  correctOptionIndex?: number;
  prompt?: string;
  minWordCount?: number;
  exampleResponse?: string;
}

// Map of node IDs to their respective questions
export interface NodesQuestionsMap {
  [nodeId: string]: NodeQuestion[];
}

// Example questions for some nodes
export const NODE_QUESTIONS: NodesQuestionsMap = {
  'mechanics-1': [
    {
      id: 'mechanics-1-q1',
      questionNumber: 1,
      title: 'Nouns and Pronouns',
      instructions: 'Select the correctly written sentence',
      content: 'Choose the option with proper noun and pronoun usage.',
      type: 'multiple-choice',
      options: [
        'Her and me went to the store.',
        'Her and I went to the store.',
        'She and me went to the store.',
        'She and myself went to the store.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-1-q2',
      questionNumber: 2,
      title: 'Subject-Verb Agreement',
      instructions: 'Choose the sentence with correct subject-verb agreement',
      content: 'Read each option and select the sentence where the subject and verb properly agree.',
      type: 'multiple-choice',
      options: [
        'The group of students are working on their projects.',
        'The group of students is working on their projects.',
        'The group of students be working on their projects.',
        'The group of students working on their projects.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-1-q3',
      questionNumber: 3,
      title: 'Verb Tenses',
      instructions: 'Identify the sentence with consistent verb tense',
      content: 'Choose the option where the verb tenses are consistent.',
      type: 'multiple-choice',
      options: [
        'I am going to the store and bought some milk.',
        'I went to the store and buy some milk.',
        'I go to the store and bought some milk.',
        'I went to the store and bought some milk.'
      ],
      correctOptionIndex: 3
    },
    {
      id: 'mechanics-1-q4',
      questionNumber: 4,
      title: 'Capitalization',
      instructions: 'Select the correctly capitalized sentence',
      content: 'Choose the option with proper capitalization rules applied.',
      type: 'multiple-choice',
      options: [
        'My Friend Sara lives in new york city.',
        'My friend sara lives in New york city.',
        'My friend Sara lives in New York City.',
        'my Friend Sara Lives In New York City.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'mechanics-1-q5',
      questionNumber: 5,
      title: 'Sentence Structure',
      instructions: 'Identify the complete sentence',
      content: 'Choose the option that represents a complete sentence.',
      type: 'multiple-choice',
      options: [
        'Running quickly through the park.',
        'The dog barked loudly at the mailman.',
        'When the rain started to fall.',
        'Because we were late for the meeting.'
      ],
      correctOptionIndex: 1
    }
  ],
  'sequencing-1': [
    {
      id: 'sequencing-1-q1',
      questionNumber: 1,
      title: 'Chronological Order',
      instructions: 'Select the correct sequence for these events',
      content: 'Which order would these events naturally occur?',
      type: 'multiple-choice',
      options: [
        'Graduate college, Start high school, Learn to walk, Retire',
        'Learn to walk, Start high school, Graduate college, Retire',
        'Start high school, Learn to walk, Graduate college, Retire',
        'Retire, Graduate college, Start high school, Learn to walk'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'sequencing-1-q2',
      questionNumber: 2,
      title: 'Logical Flow',
      instructions: 'Identify the most logical sequence',
      content: 'Which order makes the most sense for these actions?',
      type: 'multiple-choice',
      options: [
        'Turn on oven, Eat cake, Mix ingredients, Bake batter',
        'Mix ingredients, Turn on oven, Bake batter, Eat cake',
        'Eat cake, Mix ingredients, Turn on oven, Bake batter',
        'Bake batter, Mix ingredients, Turn on oven, Eat cake'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'sequencing-1-q3',
      questionNumber: 3,
      title: 'Paragraph Organization',
      instructions: 'Choose the best order for these sentences to form a paragraph',
      content: 'Which sequence creates the most logical paragraph?',
      type: 'multiple-choice',
      options: [
        'She won first place. She practiced daily. She entered the competition. She received a trophy.',
        'She practiced daily. She entered the competition. She won first place. She received a trophy.',
        'She received a trophy. She won first place. She entered the competition. She practiced daily.',
        'She entered the competition. She practiced daily. She won first place. She received a trophy.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'sequencing-1-q4',
      questionNumber: 4,
      title: 'Transitional Phrases',
      instructions: 'Identify the sentence with transitional phrases in logical order',
      content: 'Which option uses transitional phrases in a logical sequence?',
      type: 'multiple-choice',
      options: [
        'Finally, we started the project. Next, we planned our approach. First, we gathered materials. Lastly, we presented our results.',
        'First, we gathered materials. Next, we planned our approach. Finally, we started the project. Lastly, we presented our results.',
        'First, we gathered materials. Next, we planned our approach. Then, we started the project. Finally, we presented our results.',
        'Next, we gathered materials. First, we planned our approach. Then, we started the project. Finally, we presented our results.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'sequencing-1-q5',
      questionNumber: 5,
      title: 'Story Sequence',
      instructions: 'Select the most logical sequence for this story',
      content: 'Which order of events creates the most coherent story?',
      type: 'multiple-choice',
      options: [
        'The princess was rescued. The dragon appeared. The knight set out on a quest. The kingdom celebrated.',
        'The dragon appeared. The princess was rescued. The knight set out on a quest. The kingdom celebrated.',
        'The knight set out on a quest. The dragon appeared. The princess was rescued. The kingdom celebrated.',
        'The kingdom celebrated. The knight set out on a quest. The dragon appeared. The princess was rescued.'
      ],
      correctOptionIndex: 2
    }
  ],
  'voice-1': [
    {
      id: 'voice-1-q1',
      questionNumber: 1,
      title: 'Formal vs. Informal',
      instructions: 'Identify the sentence with a formal tone',
      content: 'Which sentence would be appropriate in a formal academic essay?',
      type: 'multiple-choice',
      options: [
        'The experiment was like, super cool and stuff.',
        'The results of the experiment were quite fascinating.',
        'OMG! The experiment results blew my mind!',
        'So anyway, the experiment turned out pretty good I think.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'voice-1-q2',
      questionNumber: 2,
      title: 'Active Voice',
      instructions: 'Select the sentence written in active voice',
      content: 'Which option uses the active rather than passive voice?',
      type: 'multiple-choice',
      options: [
        'The ball was thrown by the pitcher.',
        'The essay was written by the student.',
        'The student wrote the essay.',
        'The cake was baked by my mother.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-1-q3',
      questionNumber: 3,
      title: 'Vivid Description',
      instructions: 'Choose the sentence with the most vivid description',
      content: 'Which sentence creates the clearest mental image?',
      type: 'multiple-choice',
      options: [
        'The man walked through the forest.',
        'The tall man went through the green forest.',
        'The elderly ranger trudged through the dense, misty forest, his boots crunching fallen leaves.',
        'The forest had a man walking in it who was going somewhere.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-1-q4',
      questionNumber: 4,
      title: 'Audience Appropriate',
      instructions: 'Select the sentence most appropriate for younger readers',
      content: 'Which option would be best in a children\'s book?',
      type: 'multiple-choice',
      options: [
        'The canine\'s rapid locomotion suggested heightened alertness.',
        'The dog ran super fast, like, faster than any dog ever!',
        'The happy puppy zoomed around the yard, his tail wagging like a flag in the wind.',
        'The physical exertion demonstrated by the domesticated animal was notable.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-1-q5',
      questionNumber: 5,
      title: 'Emotional Appeal',
      instructions: 'Identify the sentence with the strongest emotional appeal',
      content: 'Which sentence evokes the strongest emotional response?',
      type: 'multiple-choice',
      options: [
        'The dog waited at the shelter.',
        'The number of dogs in shelters increased by 5% last year.',
        'The dog was at the shelter for 732 days.',
        'After two years of waiting, the three-legged shepherd watched hopefully as each visitor passed by his kennel, his eyes pleading for a forever home.'
      ],
      correctOptionIndex: 3
    }
  ]
};

// Function to get questions for a specific node
export const getQuestionsForNode = (nodeId: string): NodeQuestion[] => {
  return NODE_QUESTIONS[nodeId] || [];
};

// Function to get a specific question by node ID and question number
export const getQuestionByNodeAndNumber = (nodeId: string, questionNumber: number): NodeQuestion | undefined => {
  const questions = getQuestionsForNode(nodeId);
  return questions.find(q => q.questionNumber === questionNumber);
};
