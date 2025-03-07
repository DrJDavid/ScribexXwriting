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
// All 17 sets of questions, 5 questions each:
// 1. Grammar Basics (mechanics-1)
// 2. Punctuation (mechanics-2)
// 3. Subject-Verb Agreement (mechanics-3)
// 4. Tense Consideration (mechanics-4)
// 5. Apostrophe Use (mechanics-5)
// 6. Fixing Grammar Errors - writing (mechanics-writing-1)
// 7. Paragraph Order (sequencing-1)
// 8. Topic Sentences (sequencing-2)
// 9. Paragraph Flow (sequencing-3)
// 10. Transition Words (sequencing-4)
// 11. Logical Organization (sequencing-5)
// 12. Audience Awareness (voice-1)
// 13. Vivid Language (voice-2)
// 14. Active vs Passive Voice (voice-3)
// 15. Persuasive Language (voice-4)
// 16. Emotional Appeal (voice-5)
// 17. Write a Personal Narrative - writing (voice-writing-1)

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
  'mechanics-2': [
    {
      id: 'mechanics-2-q1',
      questionNumber: 1,
      title: 'Punctuation: Periods',
      instructions: 'Choose the correctly punctuated sentence',
      content: 'Select the option that uses periods correctly.',
      type: 'multiple-choice',
      options: [
        'Dr Jones arrived at 4.30 P.M.',
        'Dr. Jones arrived at 4:30 P.M.',
        'Dr. Jones arrived at 4.30 P.M',
        'Dr Jones arrived at 4:30 pm.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-2-q2',
      questionNumber: 2,
      title: 'Punctuation: Question Marks',
      instructions: 'Identify the correct use of question marks',
      content: 'Choose the sentence that uses question marks properly.',
      type: 'multiple-choice',
      options: [
        'Do you know what time it is.',
        'Do you know what time it is?',
        'Do you know what time it is!',
        'Do you know what time it is;'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-2-q3',
      questionNumber: 3,
      title: 'Punctuation: Commas',
      instructions: 'Select the sentence with correct comma usage',
      content: 'Choose the option that uses commas appropriately.',
      type: 'multiple-choice',
      options: [
        'After eating dinner, we went to the movies.',
        'After eating dinner we, went to the movies.',
        'After, eating dinner we went to the movies.',
        'After eating dinner we went, to the movies.'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'mechanics-2-q4',
      questionNumber: 4,
      title: 'Punctuation: Quotation Marks',
      instructions: 'Choose the sentence with correct quotation mark usage',
      content: 'Identify the proper use of quotation marks.',
      type: 'multiple-choice',
      options: [
        'She said "I\'ll be there soon".',
        'She said, "I\'ll be there soon."',
        'She said, "I\'ll be there soon".',
        'She said "I\'ll be there soon."'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-2-q5',
      questionNumber: 5,
      title: 'Punctuation: Apostrophes',
      instructions: 'Identify the correct use of apostrophes',
      content: 'Choose the option that uses apostrophes correctly.',
      type: 'multiple-choice',
      options: [
        'The dog\'s bone is under the table.',
        'The dogs bone is under the table.',
        'The dog\'s bone is under the table\'s.',
        'The dogs\' bone is under the table.'
      ],
      correctOptionIndex: 0
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
  ],
  'voice-2': [
    {
      id: 'voice-2-q1',
      questionNumber: 1,
      title: 'Sensory Language',
      instructions: 'Choose the sentence with the most sensory details',
      content: 'Select the option that engages the reader\'s senses most effectively.',
      type: 'multiple-choice',
      options: [
        'The pizza was good.',
        'The pizza had cheese and pepperoni on it.',
        'The hot, gooey cheese stretched in stringy strands as I lifted a slice of spicy pepperoni pizza, its aroma of oregano and tomato filling the air.',
        'I ate a large pizza for dinner yesterday evening.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-2-q2',
      questionNumber: 2,
      title: 'Metaphors and Similes',
      instructions: 'Identify the sentence containing a metaphor',
      content: 'Choose the option that uses metaphorical language.',
      type: 'multiple-choice',
      options: [
        'The runner was very fast.',
        'The classroom was like a zoo during the party.',
        'Her eyes were pools of wisdom that had witnessed decades of history.',
        'The runner moved quickly, similar to a cheetah.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-2-q3',
      questionNumber: 3,
      title: 'Strong Verbs',
      instructions: 'Select the sentence with the strongest verbs',
      content: 'Choose the option with the most powerful and specific verbs.',
      type: 'multiple-choice',
      options: [
        'The dog went across the yard and got the ball.',
        'The dog moved quickly to the yard and took the ball.',
        'The dog sprinted across the yard and snatched the ball.',
        'The dog was in the yard with the ball.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-2-q4',
      questionNumber: 4,
      title: 'Precise Adjectives',
      instructions: 'Identify the sentence with the most precise adjectives',
      content: 'Choose the option that uses specific, descriptive adjectives.',
      type: 'multiple-choice',
      options: [
        'It was a bad day with bad weather.',
        'It was a day with weather that wasn\'t good.',
        'It was a miserable day with stormy weather.',
        'It was a really really bad day with very bad weather.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-2-q5',
      questionNumber: 5,
      title: 'Word Choice Impact',
      instructions: 'Select the sentence with the most impactful word choice',
      content: 'Choose the option where the words create the strongest impression.',
      type: 'multiple-choice',
      options: [
        'The old building was taken down yesterday.',
        'The historic landmark was demolished yesterday.',
        'They got rid of the building that was there for a long time yesterday.',
        'The building is no longer there as of yesterday.'
      ],
      correctOptionIndex: 1
    }
  ],
  
  // Add more node question sets for all 17 nodes
  'mechanics-3': [
    {
      id: 'mechanics-3-q1',
      questionNumber: 1,
      title: 'Basic Subject-Verb Agreement',
      instructions: 'Choose the sentence with correct subject-verb agreement',
      content: 'Select the option where the subject and verb correctly agree in number.',
      type: 'multiple-choice',
      options: [
        'The students takes notes during class.',
        'The students take notes during class.',
        'The students is taking notes during class.',
        'The students taking notes during class.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-3-q2',
      questionNumber: 2,
      title: 'Collective Nouns',
      instructions: 'Identify the sentence with proper subject-verb agreement',
      content: 'Choose the option that correctly uses a verb with a collective noun.',
      type: 'multiple-choice',
      options: [
        'The committee are divided on this issue.',
        'The committee is divided on this issue.',
        'The committee have different opinions.',
        'The committee being divided on this issue.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-3-q3',
      questionNumber: 3,
      title: 'Indefinite Pronouns',
      instructions: 'Select the sentence with correct subject-verb agreement',
      content: 'Choose the option that uses the proper verb form with an indefinite pronoun.',
      type: 'multiple-choice',
      options: [
        'Everyone have their own opinion.',
        'Everyone has their own opinion.',
        'Everyone have his or her own opinion.',
        'Everyone having their own opinion.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-3-q4',
      questionNumber: 4,
      title: 'Compound Subjects',
      instructions: 'Choose the sentence with correct subject-verb agreement',
      content: 'Select the option that correctly agrees when there are multiple subjects.',
      type: 'multiple-choice',
      options: [
        'Neither the teacher nor the students was prepared for the test.',
        'Neither the teacher nor the students were prepared for the test.',
        'Neither the teacher nor the students have been prepared for the test.',
        'Neither the teacher nor the students being prepared for the test.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-3-q5',
      questionNumber: 5,
      title: 'Intervening Phrases',
      instructions: 'Identify the correct subject-verb agreement',
      content: 'Select the option where the verb agrees with the subject despite intervening phrases.',
      type: 'multiple-choice',
      options: [
        'The box of chocolates were on the table.',
        'The box of chocolates was on the table.',
        'The box of chocolates have been on the table.',
        'The box of chocolates being on the table.'
      ],
      correctOptionIndex: 1
    }
  ],
  
  'mechanics-4': [
    {
      id: 'mechanics-4-q1',
      questionNumber: 1,
      title: 'Present Tense Consistency',
      instructions: 'Select the sentence with consistent present tense',
      content: 'Choose the option where all verbs are in the present tense.',
      type: 'multiple-choice',
      options: [
        'She walks to school and ate lunch with her friends.',
        'She walks to school and eats lunch with her friends.',
        'She is walking to school and ate lunch with her friends.',
        'She walked to school and eats lunch with her friends.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-4-q2',
      questionNumber: 2,
      title: 'Past Tense Consistency',
      instructions: 'Identify the sentence with consistent past tense',
      content: 'Choose the option where all verbs are properly in the past tense.',
      type: 'multiple-choice',
      options: [
        'We visited the museum and learn about dinosaurs.',
        'We visited the museum and learned about dinosaurs.',
        'We visit the museum and learned about dinosaurs.',
        'We was visiting the museum and learn about dinosaurs.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-4-q3',
      questionNumber: 3,
      title: 'Future Tense Consistency',
      instructions: 'Choose the sentence with consistent future tense',
      content: 'Select the option where all verbs properly indicate future action.',
      type: 'multiple-choice',
      options: [
        'We will go to the beach and swim in the ocean.',
        'We will go to the beach and swam in the ocean.',
        'We will go to the beach and swimming in the ocean.',
        'We going to the beach and will swim in the ocean.'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'mechanics-4-q4',
      questionNumber: 4,
      title: 'Shifting Tense',
      instructions: 'Identify the sentence with appropriate tense shifts',
      content: 'Choose the option where tense shifts are logical and necessary.',
      type: 'multiple-choice',
      options: [
        'I know that dinosaurs lived millions of years ago.',
        'I knew that dinosaurs live millions of years ago.',
        'I know that dinosaurs lives millions of years ago.',
        'I known that dinosaurs lived millions of years ago.'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'mechanics-4-q5',
      questionNumber: 5,
      title: 'Narrative Tense',
      instructions: 'Select the paragraph with consistent narrative tense',
      content: 'Choose the option that maintains appropriate tense throughout a narrative.',
      type: 'multiple-choice',
      options: [
        'The character enters the room. He looked around nervously. Then he sits down and waited.',
        'The character entered the room. He looked around nervously. Then he sat down and waited.',
        'The character entered the room. He looks around nervously. Then he sat down and waits.',
        'The character enters the room. He looks around nervously. Then he sits down and wait.'
      ],
      correctOptionIndex: 1
    }
  ],
  
  'mechanics-5': [
    {
      id: 'mechanics-5-q1',
      questionNumber: 1,
      title: 'Singular Possession',
      instructions: 'Choose the correct use of apostrophes for singular possession',
      content: 'Identify the option with properly formed singular possessives.',
      type: 'multiple-choice',
      options: [
        'The cats toy is under the couch.',
        'The cat\'s toy is under the couch.',
        'The cats\' toy is under the couch.',
        'The cat\'s\' toy is under the couch.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-5-q2',
      questionNumber: 2,
      title: 'Plural Possession',
      instructions: 'Identify the correct use of apostrophes for plural possession',
      content: 'Select the option with properly formed plural possessives.',
      type: 'multiple-choice',
      options: [
        'The students projects were displayed in the hall.',
        'The student\'s projects were displayed in the hall.',
        'The students\' projects were displayed in the hall.',
        'The students\'s projects were displayed in the hall.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'mechanics-5-q3',
      questionNumber: 3,
      title: 'Contractions',
      instructions: 'Select the sentence with correctly formed contractions',
      content: 'Choose the option that uses apostrophes in contractions properly.',
      type: 'multiple-choice',
      options: [
        'I dont think theyre coming to the party because its too late.',
        'I don\'t think they\'re coming to the party because it\'s too late.',
        'I don\'t think their coming to the party because its too late.',
        'I dont think they\'re coming to the party because it is too late.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'mechanics-5-q4',
      questionNumber: 4,
      title: 'Irregular Plural Possession',
      instructions: 'Choose the correct apostrophe use for irregular plurals',
      content: 'Identify the properly formed possessive with an irregular plural noun.',
      type: 'multiple-choice',
      options: [
        'The children\'s toys were scattered across the floor.',
        'The childrens\' toys were scattered across the floor.',
        'The childrens toys were scattered across the floor.',
        'The children toys were scattered across the floor.'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'mechanics-5-q5',
      questionNumber: 5,
      title: 'Common Apostrophe Errors',
      instructions: 'Identify the sentence with NO apostrophe errors',
      content: 'Select the option where all apostrophes are used correctly.',
      type: 'multiple-choice',
      options: [
        'The two company\'s merged their resource\'s to form a stronger business.',
        'In the 1990\'s, cell phone\'s became widely available to the public.',
        'The ladies\' room is down the hall past the men\'s room.',
        'Its time to check it\'s battery since its\' not working properly.'
      ],
      correctOptionIndex: 2
    }
  ],
  
  'mechanics-writing-1': [
    {
      id: 'mechanics-writing-1-q1',
      questionNumber: 1,
      title: 'Subject-Verb Agreement Correction',
      instructions: 'Correct the subject-verb agreement errors',
      content: 'Identify and fix all subject-verb agreement errors in this paragraph.',
      type: 'writing',
      prompt: 'The following paragraph contains subject-verb agreement errors. Rewrite it with correct subject-verb agreement:\n\nThe group of students have been studying for the test. Each of the books contain important information. Neither the teacher nor the students was prepared for how difficult the material were. The committee are still deciding on the best approach.',
      minWordCount: 50,
      exampleResponse: 'The group of students has been studying for the test. Each of the books contains important information. Neither the teacher nor the students were prepared for how difficult the material was. The committee is still deciding on the best approach.'
    },
    {
      id: 'mechanics-writing-1-q2',
      questionNumber: 2,
      title: 'Verb Tense Correction',
      instructions: 'Fix all verb tense inconsistencies',
      content: 'Identify and correct all verb tense inconsistencies in this paragraph.',
      type: 'writing',
      prompt: 'Rewrite this paragraph to maintain consistent and appropriate verb tenses:\n\nYesterday, I go to the store and I bought some groceries. While I am there, I see my friend who will tell me about the party next weekend. I was excited and decide to bring a dessert. I am making my famous chocolate cake.',
      minWordCount: 50,
      exampleResponse: 'Yesterday, I went to the store and I bought some groceries. While I was there, I saw my friend who told me about the party next weekend. I was excited and decided to bring a dessert. I will make my famous chocolate cake.'
    },
    {
      id: 'mechanics-writing-1-q3',
      questionNumber: 3,
      title: 'Punctuation Correction',
      instructions: 'Correct all punctuation errors',
      content: 'Identify and fix all punctuation errors in this paragraph.',
      type: 'writing',
      prompt: 'Rewrite this paragraph with correct punctuation:\n\nDid you know that elephants are the largest land mammals? They\'re known for their long trunks intelligence and excellent memory some elephants can live up to 70 years in the wild! The african elephant is larger than it\'s asian counterpart. Dr Smith who studies elephants said "These magnificent creatures are endangered and we must protect them"',
      minWordCount: 50,
      exampleResponse: 'Did you know that elephants are the largest land mammals? They\'re known for their long trunks, intelligence, and excellent memory. Some elephants can live up to 70 years in the wild! The African elephant is larger than its Asian counterpart. Dr. Smith, who studies elephants, said, "These magnificent creatures are endangered, and we must protect them."'
    },
    {
      id: 'mechanics-writing-1-q4',
      questionNumber: 4,
      title: 'Pronoun Correction',
      instructions: 'Fix all pronoun errors',
      content: 'Identify and correct all pronoun errors in this paragraph.',
      type: 'writing',
      prompt: 'Rewrite this paragraph with correct pronoun usage:\n\nWhen a student enters the classroom, they should put their books on their desk. The teacher will hand them their assignment. Me and her will review the instructions. Each student must complete their work before they leave.',
      minWordCount: 50,
      exampleResponse: 'When students enter the classroom, they should put their books on their desks. The teacher will hand them their assignments. She and I will review the instructions. Each student must complete his or her work before leaving.'
    },
    {
      id: 'mechanics-writing-1-q5',
      questionNumber: 5,
      title: 'Complete Grammar Editing',
      instructions: 'Edit this paragraph to fix all grammar errors',
      content: 'Correct all grammar errors in this paragraph, including subject-verb agreement, verb tense, punctuation, and pronoun usage.',
      type: 'writing',
      prompt: 'Edit this paragraph to correct all grammar errors:\n\nLast week, me and my friend goes to the store. We buyed some snacks and drinks for the party. When we gets home, my sister help us to set up. There was many people at the party. Everyone have a good time. Tomorrow we plan to have another party, but first we needed to clean up from yesterday party.',
      minWordCount: 50,
      exampleResponse: 'Last week, my friend and I went to the store. We bought some snacks and drinks for the party. When we got home, my sister helped us to set up. There were many people at the party. Everyone had a good time. Tomorrow we plan to have another party, but first we need to clean up from yesterday\'s party.'
    }
  ],
  
  'sequencing-2': [
    {
      id: 'sequencing-2-q1',
      questionNumber: 1,
      title: 'Identifying Topic Sentences',
      instructions: 'Select the best topic sentence for this paragraph',
      content: 'Choose the option that would make the most effective topic sentence.',
      type: 'multiple-choice',
      options: [
        'The Golden Gate Bridge is red.',
        'The Golden Gate Bridge is an iconic landmark in San Francisco, known for its distinctive design and orange-red color.',
        'I visited the Golden Gate Bridge last summer.',
        'Bridges connect two pieces of land over water.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'sequencing-2-q2',
      questionNumber: 2,
      title: 'Topic Sentence Placement',
      instructions: 'Identify where the topic sentence should be placed',
      content: 'Where would the topic sentence be most effective in this paragraph?',
      type: 'multiple-choice',
      options: [
        'At the beginning of the paragraph',
        'In the middle of the paragraph',
        'At the end of the paragraph',
        'Topic sentences are optional in paragraphs'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'sequencing-2-q3',
      questionNumber: 3,
      title: 'Specific vs. General Topic Sentences',
      instructions: 'Choose the most effective topic sentence',
      content: 'Select the option that is neither too broad nor too narrow for a paragraph about healthy eating habits.',
      type: 'multiple-choice',
      options: [
        'Food is important for survival.',
        'Developing healthy eating habits can lead to improved physical health, increased energy levels, and better long-term wellness.',
        'I like to eat apples as a healthy snack in the afternoon.',
        'Vegetables contain many vitamins and minerals.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'sequencing-2-q4',
      questionNumber: 4,
      title: 'Focusing Topic Sentences',
      instructions: 'Identify the most focused topic sentence',
      content: 'Choose the topic sentence that best establishes a clear focus for a paragraph.',
      type: 'multiple-choice',
      options: [
        'There are many interesting things about dolphins.',
        'Animals are fascinating creatures that live on our planet.',
        'Dolphins are highly intelligent marine mammals known for their complex social structures and communication abilities.',
        'I saw dolphins at the aquarium last weekend and they were swimming around.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'sequencing-2-q5',
      questionNumber: 5,
      title: 'Controlling Idea in Topic Sentences',
      instructions: 'Select the topic sentence with the clearest controlling idea',
      content: 'Choose the option that best establishes a clear main idea that can be developed in a paragraph.',
      type: 'multiple-choice',
      options: [
        'Climate change is happening.',
        'Climate change is a complex global issue with environmental, economic, and social implications.',
        'The weather has been unusual lately in many places around the world.',
        'Many scientists study climate patterns and weather systems.'
      ],
      correctOptionIndex: 1
    }
  ],
  
  'sequencing-3': [
    {
      id: 'sequencing-3-q1',
      questionNumber: 1,
      title: 'Supporting Details',
      instructions: 'Choose the best supporting detail for this topic sentence',
      content: 'Topic sentence: "Renewable energy sources offer several environmental benefits." Which detail best supports this claim?',
      type: 'multiple-choice',
      options: [
        'Energy is important for modern life.',
        'Solar panels can be expensive to install initially.',
        'Wind power generates electricity without producing greenhouse gas emissions.',
        'Many countries still rely primarily on fossil fuels.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'sequencing-3-q2',
      questionNumber: 2,
      title: 'Paragraph Unity',
      instructions: 'Identify the sentence that does NOT belong in this paragraph',
      content: 'Which sentence does not support the main idea of this paragraph about exercise benefits?',
      type: 'multiple-choice',
      options: [
        'Regular exercise strengthens the cardiovascular system.',
        'Exercise helps maintain a healthy weight.',
        'My favorite exercise is swimming because I love being in water.',
        'Physical activity improves mood by releasing endorphins.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'sequencing-3-q3',
      questionNumber: 3,
      title: 'Logical Flow',
      instructions: 'Select the most logical order for these sentences',
      content: 'Which sequence creates the most logical paragraph flow?',
      type: 'multiple-choice',
      options: [
        'Despite these concerns, most experts agree that the benefits outweigh the risks. However, there are some potential side effects. The new medication shows promise for treating this condition.',
        'The new medication shows promise for treating this condition. However, there are some potential side effects. Despite these concerns, most experts agree that the benefits outweigh the risks.',
        'However, there are some potential side effects. The new medication shows promise for treating this condition. Despite these concerns, most experts agree that the benefits outweigh the risks.',
        'Despite these concerns, most experts agree that the benefits outweigh the risks. The new medication shows promise for treating this condition. However, there are some potential side effects.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'sequencing-3-q4',
      questionNumber: 4,
      title: 'Paragraph Development',
      instructions: 'Choose the best method to develop this paragraph',
      content: 'For a paragraph about the causes of climate change, which development method would be most effective?',
      type: 'multiple-choice',
      options: [
        'Narration (telling a story about one person\'s experience with climate change)',
        'Description (describing what climate change looks like visually)',
        'Process analysis (explaining the step-by-step process of how greenhouse gases trap heat)',
        'Classification (listing different types of weather patterns)'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'sequencing-3-q5',
      questionNumber: 5,
      title: 'Coherence',
      instructions: 'Select the sentence that best connects these ideas',
      content: 'Which sentence best connects these two ideas: "Electric cars produce zero tailpipe emissions" and "Some electricity is generated from fossil fuels"?',
      type: 'multiple-choice',
      options: [
        'Nevertheless, electric cars are expensive.',
        'Similarly, hybrid cars combine gas and electric power.',
        'Therefore, electric cars are completely carbon-neutral.',
        'However, the environmental impact of electric vehicles depends partly on the source of the electricity used to charge them.'
      ],
      correctOptionIndex: 3
    }
  ],
  
  'sequencing-4': [
    {
      id: 'sequencing-4-q1',
      questionNumber: 1,
      title: 'Time Transitions',
      instructions: 'Choose the best transition for this sequence',
      content: 'We mixed the ingredients. ________, we put the batter in the oven.',
      type: 'multiple-choice',
      options: [
        'However',
        'Next',
        'For example',
        'In contrast'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'sequencing-4-q2',
      questionNumber: 2,
      title: 'Contrast Transitions',
      instructions: 'Select the best transition showing contrast',
      content: 'Electric cars are better for the environment. ________, they currently have a limited driving range.',
      type: 'multiple-choice',
      options: [
        'Similarly',
        'Furthermore',
        'However',
        'Therefore'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'sequencing-4-q3',
      questionNumber: 3,
      title: 'Addition Transitions',
      instructions: 'Choose the best transition showing addition',
      content: 'Regular exercise improves physical health. ________, it also benefits mental wellbeing.',
      type: 'multiple-choice',
      options: [
        'Nevertheless',
        'Instead',
        'Additionally',
        'Meanwhile'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'sequencing-4-q4',
      questionNumber: 4,
      title: 'Cause-Effect Transitions',
      instructions: 'Identify the best transition showing cause and effect',
      content: 'The storm knocked out power lines. ________, the town was without electricity for three days.',
      type: 'multiple-choice',
      options: [
        'Similarly',
        'Nevertheless',
        'For instance',
        'As a result'
      ],
      correctOptionIndex: 3
    },
    {
      id: 'sequencing-4-q5',
      questionNumber: 5,
      title: 'Paragraph Transitions',
      instructions: 'Select the best transition between these paragraphs',
      content: 'Paragraph 1: [Discusses benefits of exercise]\nParagraph 2: [Discusses challenges of maintaining an exercise routine]\nWhich transition works best between these paragraphs?',
      type: 'multiple-choice',
      options: [
        'In addition to these benefits,',
        'Despite these advantages,',
        'As mentioned earlier,',
        'For example,'
      ],
      correctOptionIndex: 1
    }
  ],
  
  'sequencing-5': [
    {
      id: 'sequencing-5-q1',
      questionNumber: 1,
      title: 'Chronological Organization',
      instructions: 'Choose the best organizational structure',
      content: 'Which organizational structure would be most effective for an essay about the history of computers?',
      type: 'multiple-choice',
      options: [
        'Chronological order (events by time)',
        'Spatial order (by location)',
        'Order of importance',
        'Compare and contrast'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'sequencing-5-q2',
      questionNumber: 2,
      title: 'Cause and Effect Organization',
      instructions: 'Identify the best organizational structure',
      content: 'For an essay about how social media affects mental health, which organizational structure would be most effective?',
      type: 'multiple-choice',
      options: [
        'Classification (types of social media)',
        'Chronological order (history of social media)',
        'Cause and effect (how social media leads to certain mental health outcomes)',
        'Process analysis (how to use social media)'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'sequencing-5-q3',
      questionNumber: 3,
      title: 'Compare and Contrast Organization',
      instructions: 'Select the best organizational method',
      content: 'For an essay comparing online learning and traditional classroom learning, which organization would be most effective?',
      type: 'multiple-choice',
      options: [
        'Chronological order',
        'Order of importance',
        'Spatial organization',
        'Compare and contrast'
      ],
      correctOptionIndex: 3
    },
    {
      id: 'sequencing-5-q4',
      questionNumber: 4,
      title: 'Problem-Solution Organization',
      instructions: 'Choose the best organizational structure',
      content: 'For an essay about plastic pollution in oceans, which organizational structure would be most effective?',
      type: 'multiple-choice',
      options: [
        'Classification (types of plastic)',
        'Problem-solution (issue of plastic pollution and potential solutions)',
        'Chronological (history of plastic use)',
        'Spatial (oceans around the world)'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'sequencing-5-q5',
      questionNumber: 5,
      title: 'Essay Structure',
      instructions: 'Identify the best overall essay organization',
      content: 'Which structure represents the most common and effective organization for a standard academic essay?',
      type: 'multiple-choice',
      options: [
        'Body paragraphs, conclusion, introduction',
        'Introduction, conclusion, body paragraphs',
        'Introduction, body paragraphs, conclusion',
        'Body paragraphs only, with topic sentences highlighted'
      ],
      correctOptionIndex: 2
    }
  ],
  
  'voice-3': [
    {
      id: 'voice-3-q1',
      questionNumber: 1,
      title: 'Active Voice Identification',
      instructions: 'Identify the sentence written in active voice',
      content: 'Choose the option that uses active rather than passive voice.',
      type: 'multiple-choice',
      options: [
        'The essay was written by Maria.',
        'The recipe was followed precisely by the chef.',
        'Maria wrote the essay.',
        'The mistake was made by several students.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-3-q2',
      questionNumber: 2,
      title: 'Passive Voice Identification',
      instructions: 'Select the sentence written in passive voice',
      content: 'Choose the option that uses passive rather than active voice.',
      type: 'multiple-choice',
      options: [
        'The committee approved the proposal yesterday.',
        'The scientist conducted three experiments.',
        'The proposal was approved by the committee yesterday.',
        'The dog chased the cat around the yard.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-3-q3',
      questionNumber: 3,
      title: 'Converting to Active Voice',
      instructions: 'Choose the best active voice version',
      content: 'Passive: "The novel was read by the entire class." Which is the best active voice version?',
      type: 'multiple-choice',
      options: [
        'The entire class has read the novel.',
        'The entire class read the novel.',
        'Reading the novel was done by the entire class.',
        'The novel is what the entire class read.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'voice-3-q4',
      questionNumber: 4,
      title: 'Appropriate Passive Voice Use',
      instructions: 'Identify when passive voice is appropriate',
      content: 'In which situation would passive voice be most appropriate?',
      type: 'multiple-choice',
      options: [
        'Describing actions in a fast-paced sports narrative',
        'Explaining who is responsible for a political decision',
        'Describing a scientific process where the actor is less important than the action',
        'Telling a personal story about your vacation'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-3-q5',
      questionNumber: 5,
      title: 'Mixed Voice Paragraph',
      instructions: 'Identify the most effective paragraph',
      content: 'Choose the paragraph that uses a mix of active and passive voice appropriately.',
      type: 'multiple-choice',
      options: [
        'The experiment was conducted by scientists. The results were recorded carefully. The hypothesis was proven by the data. A paper was written by the research team.',
        'Scientists conducted the experiment. The results were carefully recorded. The data proved the hypothesis. The research team wrote a paper about their findings.',
        'Scientists conducted the experiment and recorded the results carefully. The data was proved by the hypothesis. The research team wrote a paper about their findings.',
        'The experiment was conducted. The results were recorded. The hypothesis was proven. A paper was written.'
      ],
      correctOptionIndex: 1
    }
  ],
  
  'voice-4': [
    {
      id: 'voice-4-q1',
      questionNumber: 1,
      title: 'Persuasive Language',
      instructions: 'Identify the most persuasive sentence',
      content: 'Choose the option that would be most persuasive in an argument.',
      type: 'multiple-choice',
      options: [
        'Some people think we should recycle more.',
        'It might be a good idea to recycle.',
        'Recycling is important to some environmentalists.',
        'Recycling is essential for protecting our planet\'s limited resources and ensuring a sustainable future for generations to come.'
      ],
      correctOptionIndex: 3
    },
    {
      id: 'voice-4-q2',
      questionNumber: 2,
      title: 'Rhetorical Questions',
      instructions: 'Select the most effective rhetorical question',
      content: 'Choose the rhetorical question that would be most effective in a persuasive essay about climate change.',
      type: 'multiple-choice',
      options: [
        'Do you know what climate change is?',
        'Have scientists studied climate change?',
        'How much longer can we ignore the devastating effects of climate change on our planet?',
        'Is climate change happening?'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-4-q3',
      questionNumber: 3,
      title: 'Call to Action',
      instructions: 'Choose the most powerful call to action',
      content: 'Select the option that most effectively motivates readers to take action.',
      type: 'multiple-choice',
      options: [
        'Perhaps consider donating to the cause if you have time.',
        'You might want to think about making a donation.',
        'Join us today! Your donation will immediately help save lives and create lasting change in these communities.',
        'Donations are accepted at our website.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-4-q4',
      questionNumber: 4,
      title: 'Appeal to Logic',
      instructions: 'Identify the strongest logical appeal',
      content: 'Choose the option that makes the strongest logical argument.',
      type: 'multiple-choice',
      options: [
        'Electric cars are cool and everyone likes them.',
        'Electric cars are probably better than gas cars.',
        'Research shows that electric vehicles produce 60% fewer emissions over their lifetime compared to gasoline vehicles, even when accounting for battery production and electricity generation.',
        'Electric cars have batteries and don\'t use gasoline.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-4-q5',
      questionNumber: 5,
      title: 'Emotional Appeal',
      instructions: 'Select the most effective emotional appeal',
      content: 'Choose the option that creates the strongest emotional connection.',
      type: 'multiple-choice',
      options: [
        'Many animals are in shelters.',
        'Animal shelters house dogs and cats.',
        'By adopting a shelter pet, you\'re not just bringing home a pet; you\'re saving a life and giving a deserving animal a second chance at happiness and love.',
        'The animal shelter is located downtown and is open from 9-5.'
      ],
      correctOptionIndex: 2
    }
  ],
  
  'voice-5': [
    {
      id: 'voice-5-q1',
      questionNumber: 1,
      title: 'Emotional Tone',
      instructions: 'Identify the sentence with the most emotional impact',
      content: 'Choose the option that evokes the strongest emotional response.',
      type: 'multiple-choice',
      options: [
        'The old dog died yesterday.',
        'The ownership of the canine ceased.',
        'After fifteen years of unwavering loyalty, Max took his final breath in his favorite spot under the oak tree, his tail wagging one last time as his family whispered tearful goodbyes.',
        'The dog passed away on June 15th.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-5-q2',
      questionNumber: 2,
      title: 'Empathy in Writing',
      instructions: 'Select the sentence that creates the most empathy',
      content: 'Choose the option that best helps readers connect emotionally with the subject.',
      type: 'multiple-choice',
      options: [
        'Some students struggle with math.',
        'Despite staying up late every night practicing equations and seeking extra help during lunch breaks, Sophia still felt her heart race with anxiety whenever a math test was placed on her desk.',
        'Mathematics can be difficult for certain individuals.',
        'Student performance in mathematics varies widely.'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'voice-5-q3',
      questionNumber: 3,
      title: 'Passionate Advocacy',
      instructions: 'Choose the most passionate statement',
      content: 'Select the option that conveys the strongest passion for a cause.',
      type: 'multiple-choice',
      options: [
        'Parks are nice public spaces.',
        'We should consider preserving green spaces.',
        'Our city parks are important to some residents.',
        'We must fight to protect every inch of our precious urban green spaces - these irreplaceable sanctuaries of nature provide not just beauty, but essential mental health benefits and crucial environmental services to our community!'
      ],
      correctOptionIndex: 3
    },
    {
      id: 'voice-5-q4',
      questionNumber: 4,
      title: 'Inspirational Language',
      instructions: 'Identify the most inspirational message',
      content: 'Choose the option most likely to inspire and motivate readers.',
      type: 'multiple-choice',
      options: [
        'Some people achieve their goals eventually.',
        'Working hard can lead to success in some cases.',
        'Every setback you face is not a dead end, but a detour guiding you toward your true path. Let your challenges become the fuel that ignites your determination to rise higher than you ever thought possible.',
        'Statistics show that persistence can increase success rates.'
      ],
      correctOptionIndex: 2
    },
    {
      id: 'voice-5-q5',
      questionNumber: 5,
      title: 'Connecting with Audience',
      instructions: 'Select the most relatable writing',
      content: 'Choose the option that creates the strongest connection with readers.',
      type: 'multiple-choice',
      options: [
        'Modern life includes technology use by many people.',
        'Some individuals report stress related to technology.',
        'Technology usage statistics indicate increased screen time across demographic groups.',
        'We\'ve all been there - that moment when your phone battery hits 1% during the most important call of your day, or when your computer crashes just before you save that report due in five minutes. Our relationship with technology is the ultimate love-hate relationship of our time.'
      ],
      correctOptionIndex: 3
    }
  ],
  
  'voice-writing-1': [
    {
      id: 'voice-writing-1-q1',
      questionNumber: 1,
      title: 'Personal Narrative: Introduction',
      instructions: 'Write an engaging introduction to a personal narrative',
      content: 'Create an introduction that engages readers and sets up your story.',
      type: 'writing',
      prompt: 'Write an engaging introduction paragraph (3-5 sentences) for a personal narrative about a time when you accomplished something difficult. Include descriptive language and set the scene for your story.',
      minWordCount: 50,
      exampleResponse: "My heart pounded against my chest as I stared up at the towering rock face before me. The summer sun beat down relentlessly, and drops of sweat trickled down my forehead. After months of training at the indoor climbing gym, I was finally attempting my first outdoor climb, but now that I stood at the base of the actual mountain, my confidence wavered. This was the moment I'd been working toward, yet I couldn't help wondering if I had set my sights too high."
    },
    {
      id: 'voice-writing-1-q2',
      questionNumber: 2,
      title: 'Personal Narrative: Character Development',
      instructions: 'Describe a key person in your narrative',
      content: 'Write a paragraph that introduces and describes an important person in your story.',
      type: 'writing',
      prompt: 'Write a paragraph describing a person who played an important role in your accomplishment. Use vivid details, specific actions, and dialogue to bring this person to life. How did they influence your experience?',
      minWordCount: 50,
      exampleResponse: "Coach Martinez stood at the edge of the climbing area, his weathered face creased with lines that spoke of decades in the sun. 'Remember your training,' he called up to me, his voice firm but encouraging. Unlike my previous instructors who had simply demonstrated techniques, Coach Martinez had a gift for understanding exactly when to push and when to step back. He'd spent countless hours teaching me how to read the rock, how to find hidden holds, and most importantly, how to trust my own instincts. 'The rock will tell you where to go,' he always said, 'but you have to be willing to listen.'"
    },
    {
      id: 'voice-writing-1-q3',
      questionNumber: 3,
      title: 'Personal Narrative: Conflict',
      instructions: 'Describe the main challenge in your narrative',
      content: 'Write a paragraph describing the central challenge or obstacle you faced.',
      type: 'writing',
      prompt: 'Write a paragraph describing the most difficult part of your accomplishment. What specific obstacle did you face? What thoughts and emotions did you experience? Use sensory details and strong verbs to convey the challenge.',
      minWordCount: 50,
      exampleResponse: "Halfway up the climb, I encountered a section with no obvious handholds. My fingers, already burning from exertion, clutched desperately at the smallest of crevices. Below me, the ground seemed dizzyingly far away, and my mouth went dry with fear. I froze, unable to move up or down, as my muscles began to tremble from the strain of maintaining my position. Panic surged through my body, threatening to overwhelm my rational thoughts. The voice in my head grew louder with each passing second: 'You're not ready for this. You should have started with something easier.' My water bottle, strapped to my harness, swung slightly in the breeze - a maddening reminder that I couldn't even free a hand to take a drink against my growing thirst."
    },
    {
      id: 'voice-writing-1-q4',
      questionNumber: 4,
      title: 'Personal Narrative: Turning Point',
      instructions: 'Describe the turning point in your narrative',
      content: 'Write a paragraph describing the moment when things changed or when you overcame your challenge.',
      type: 'writing',
      prompt: 'Write a paragraph describing the turning point in your story. What changed? Was there a moment of realization, a decision, or an action that helped you overcome the challenge? Use specific details and dialogue (if appropriate).',
      minWordCount: 50,
      exampleResponse: "I closed my eyes and took three deep breaths, just as Coach Martinez had taught me. 'The solution is there,' I whispered to myself, 'you just need to see it differently.' When I opened my eyes again, I forced myself to look not just straight ahead, but to scan the rock face more broadly. That's when I noticed a small ledge to my right that I hadn't seen before. It wasn't an obvious path—it required a sideways movement that felt counterintuitive—but it might work. With my heart still hammering, I made a decision: I would trust my training, trust my instincts, and most importantly, trust myself. I shifted my weight, stretched my right foot to the barely visible edge, and pushed off toward the new path."
    },
    {
      id: 'voice-writing-1-q5',
      questionNumber: 5,
      title: 'Personal Narrative: Conclusion',
      instructions: 'Write a meaningful conclusion for your narrative',
      content: 'Create a conclusion that reflects on what you learned from this experience.',
      type: 'writing',
      prompt: 'Write a conclusion paragraph for your personal narrative. Reflect on what you learned from this accomplishment. How did it change you? What lesson or insight did you gain that applies to other areas of your life?',
      minWordCount: 50,
      exampleResponse: "When I finally pulled myself over the top edge of the cliff, the sense of accomplishment was unlike anything I'd ever experienced. But the real victory wasn't just reaching the summit—it was discovering a strength within myself that I never knew existed. In the months since that climb, I've faced numerous challenges, both on and off the rock face. Each time, I return to the lesson I learned that day: that sometimes the path forward isn't obvious, and that growth happens precisely at the point where comfort ends. The mountain taught me that our limitations are often self-imposed, and that with patience, persistence, and a willingness to see things differently, we can overcome obstacles that once seemed insurmountable."
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
