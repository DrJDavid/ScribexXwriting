// Define location and quest types
export interface TownLocation {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon identifier for rendering
  position: { x: number; y: number };
  status?: 'locked' | 'unlocked';
  quests: string[]; // Quest IDs available at this location
  type: 'argumentative' | 'informative' | 'narrative' | 'reflective' | 'descriptive';
}

export interface WritingQuest {
  id: string;
  locationId: string;
  title: string;
  description: string;
  tags: string[];
  minWordCount: number;
  skillFocus: 'mechanics' | 'sequencing' | 'voice';
  level: number;
  unlockRequirements: {
    skillMastery: { mechanics: number; sequencing: number; voice: number };
    completedQuests?: string[];
  };
}

// All locations in OWL town
export const TOWN_LOCATIONS: TownLocation[] = [
  {
    id: 'townHall',
    name: 'Town Hall',
    description: 'Perfect for persuasive and argumentative writing',
    icon: 'building',
    position: { x: 150, y: 150 },
    quests: ['town-hall-1', 'town-hall-2', 'town-hall-3'],
    type: 'argumentative'
  },
  {
    id: 'library',
    name: 'Library',
    description: 'Ideal for research-based and informative writing',
    icon: 'book',
    position: { x: 300, y: 80 },
    quests: ['library-1', 'library-2', 'library-3'],
    type: 'informative'
  },
  {
    id: 'amphitheater',
    name: 'Amphitheater',
    description: 'The place for narrative and creative storytelling',
    icon: 'theater',
    position: { x: 100, y: 280 },
    quests: ['music-hall-1', 'music-hall-2'],
    type: 'narrative'
  },
  {
    id: 'cafe',
    name: 'Café',
    description: 'A cozy spot for reflective and journal writing',
    icon: 'coffee',
    position: { x: 350, y: 220 },
    quests: ['cafe-1', 'cafe-2'],
    type: 'reflective'
  },
  {
    id: 'park',
    name: 'Nature Park',
    description: 'Inspiration for descriptive and nature writing',
    icon: 'tree',
    position: { x: 450, y: 120 },
    quests: ['park-1', 'park-2'],
    type: 'descriptive'
  }
];

// All quests in the game
export const WRITING_QUESTS: WritingQuest[] = [
  // Town Hall Quests
  {
    id: 'town-hall-1',
    locationId: 'townHall',
    title: 'Voice of the Community',
    description: 'Write a letter to the editor about an issue that matters to your community. Focus on making your argument persuasive using evidence and a strong voice.',
    tags: ['Persuasive', 'Community', 'Voice'],
    minWordCount: 150,
    skillFocus: 'voice',
    level: 1,
    unlockRequirements: {
      skillMastery: { mechanics: 0, sequencing: 0, voice: 0 }
    }
  },
  {
    id: 'town-hall-2',
    locationId: 'townHall',
    title: 'Town Improvement Proposal',
    description: 'Create a proposal for improving some aspect of the town. Include a clear problem statement, proposed solution, and expected benefits.',
    tags: ['Proposal', 'Problem-Solution', 'Sequencing'],
    minWordCount: 200,
    skillFocus: 'sequencing',
    level: 2,
    unlockRequirements: {
      skillMastery: { mechanics: 20, sequencing: 20, voice: 10 },
      completedQuests: ['town-hall-1']
    }
  },
  {
    id: 'town-hall-3',
    locationId: 'townHall',
    title: 'Historical Town Chronicle',
    description: 'Research and write about a (fictional) historical event in the town\'s past. Use descriptive language to bring the event to life.',
    tags: ['Historical', 'Narrative', 'Description'],
    minWordCount: 250,
    skillFocus: 'voice',
    level: 3,
    unlockRequirements: {
      skillMastery: { mechanics: 30, sequencing: 30, voice: 30 },
      completedQuests: ['town-hall-2']
    }
  },

  // Library Quests
  {
    id: 'library-1',
    locationId: 'library',
    title: 'Book Review',
    description: 'Write a thoughtful review of your favorite book. Include a summary, your opinion, and specific examples that support your assessment.',
    tags: ['Review', 'Analysis', 'Opinion'],
    minWordCount: 200,
    skillFocus: 'sequencing',
    level: 1,
    unlockRequirements: {
      skillMastery: { mechanics: 10, sequencing: 10, voice: 0 }
    }
  },
  {
    id: 'library-2',
    locationId: 'library',
    title: 'Character Analysis',
    description: 'Select a character from a story and analyze their motivations, actions, and development throughout the narrative.',
    tags: ['Analysis', 'Character', 'Evidence'],
    minWordCount: 250,
    skillFocus: 'sequencing',
    level: 2,
    unlockRequirements: {
      skillMastery: { mechanics: 20, sequencing: 30, voice: 10 },
      completedQuests: ['library-1']
    }
  },
  {
    id: 'library-3',
    locationId: 'library',
    title: 'Short Story',
    description: 'Create an original short story with a clear beginning, middle, and end. Include descriptive language and dialogue.',
    tags: ['Creative', 'Narrative', 'Fiction'],
    minWordCount: 300,
    skillFocus: 'voice',
    level: 3,
    unlockRequirements: {
      skillMastery: { mechanics: 40, sequencing: 40, voice: 30 },
      completedQuests: ['library-2']
    }
  },

  // Amphitheater Quests
  {
    id: 'music-hall-1',
    locationId: 'amphitheater',
    title: 'Short Story Beginning',
    description: 'Write the opening paragraph of a creative story. Focus on establishing character, setting, and an engaging hook.',
    tags: ['Creative', 'Narrative', 'Storytelling'],
    minWordCount: 150,
    skillFocus: 'voice',
    level: 1,
    unlockRequirements: {
      skillMastery: { mechanics: 10, sequencing: 0, voice: 10 }
    }
  },
  {
    id: 'music-hall-2',
    locationId: 'amphitheater',
    title: 'Character Monologue',
    description: 'Create a monologue for a character facing a difficult decision. Show their internal thoughts and emotional state.',
    tags: ['Narrative', 'Character', 'Drama'],
    minWordCount: 200,
    skillFocus: 'voice',
    level: 2,
    unlockRequirements: {
      skillMastery: { mechanics: 20, sequencing: 20, voice: 30 },
      completedQuests: ['music-hall-1']
    }
  },

  // Café Quests (Locked Initially)
  {
    id: 'cafe-1',
    locationId: 'cafe',
    title: 'Recipe Story',
    description: 'Write a personal narrative that incorporates a favorite recipe. Include both the recipe steps and the story behind why it\'s meaningful to you.',
    tags: ['Instructional', 'Narrative', 'Personal'],
    minWordCount: 250,
    skillFocus: 'sequencing',
    level: 2,
    unlockRequirements: {
      skillMastery: { mechanics: 40, sequencing: 30, voice: 20 }
    }
  },
  {
    id: 'cafe-2',
    locationId: 'cafe',
    title: 'Dialogue Scene',
    description: 'Create a scene with dialogue between two or more characters. Focus on realistic conversation that reveals character traits.',
    tags: ['Dialogue', 'Character', 'Scene'],
    minWordCount: 200,
    skillFocus: 'voice',
    level: 3,
    unlockRequirements: {
      skillMastery: { mechanics: 50, sequencing: 40, voice: 40 },
      completedQuests: ['cafe-1']
    }
  },

  // Park Quests (Locked Initially)
  {
    id: 'park-1',
    locationId: 'park',
    title: 'Nature Description',
    description: 'Write a detailed description of a natural setting, focusing on sensory details (sights, sounds, smells, textures).',
    tags: ['Descriptive', 'Nature', 'Sensory'],
    minWordCount: 200,
    skillFocus: 'voice',
    level: 2,
    unlockRequirements: {
      skillMastery: { mechanics: 30, sequencing: 20, voice: 30 }
    }
  },
  {
    id: 'park-2',
    locationId: 'park',
    title: 'Environmental Argument',
    description: 'Write a persuasive essay about an environmental issue. Include clear arguments, evidence, and a call to action.',
    tags: ['Persuasive', 'Environmental', 'Argument'],
    minWordCount: 300,
    skillFocus: 'sequencing',
    level: 3,
    unlockRequirements: {
      skillMastery: { mechanics: 50, sequencing: 50, voice: 40 },
      completedQuests: ['park-1']
    }
  }
];

// Helper functions for accessing town and quest data
export const getTownLocations = () => {
  return TOWN_LOCATIONS;
};

export const getLocationById = (id: string): TownLocation | undefined => {
  return TOWN_LOCATIONS.find(location => location.id === id);
};

export const getQuestsForLocation = (locationId: string): WritingQuest[] => {
  return WRITING_QUESTS.filter(quest => quest.locationId === locationId);
};

export const getQuestById = (id: string): WritingQuest | undefined => {
  return WRITING_QUESTS.find(quest => quest.id === id);
};