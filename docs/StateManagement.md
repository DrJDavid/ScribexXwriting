# ScribexX State Management Documentation

This document provides a comprehensive overview of the state management approach for the ScribexX application, detailing how user progress, educational content, UI state, and other critical data are managed across the application.

## State Management Philosophy

ScribexX uses a hybrid state management approach that:

1. **Prioritizes data locality** - State is kept as close as possible to where it's used
2. **Follows a hierarchical structure** - State is organized in logical domains
3. **Separates concerns** - UI state, application state, and domain data are managed separately
4. **Optimizes for performance** - State updates are structured to minimize re-renders
5. **Ensures persistence** - Critical user data is reliably persisted

## State Management Architecture

ScribexX employs React Context API as the primary state management solution, with AsyncStorage for persistence, and component-level state for UI concerns. This architecture maintains simplicity while providing powerful state management capabilities.

### State Hierarchy

```
App State
├── User State
│   ├── Authentication
│   ├── Profile Information
│   └── Preferences
├── Educational State
│   ├── REDI Progress
│   ├── OWL Progress
│   ├── Achievements
│   └── Writing Portfolio
├── Content State
│   ├── REDI Map & Exercises
│   ├── OWL Town & Quests
│   └── NPC Data
├── UI State
│   ├── Theme
│   ├── Navigation
│   ├── Modal Management
│   └── Component-specific State
└── Network State
    ├── Connection Status
    ├── Sync Status
    └── Request States
```

## Core State Providers

### 1. User Context

Manages user identity, authentication, and personal settings.

```jsx
// src/contexts/UserContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserContextType } from '../types/user';

// Default initial state
const initialState: User | null = null;

// Create context
export const UserContext = createContext<UserContextType>({
  user: initialState,
  isLoading: true,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  updateProfile: () => Promise.resolve(),
  error: null,
});

// Create provider component
export const UserProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize: Load user data from storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@ScribexX:user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (userData: User) => {
    try {
      setIsLoading(true);
      setUser(userData);
      await AsyncStorage.setItem('@ScribexX:user', JSON.stringify(userData));
      setError(null);
    } catch (e) {
      setError('Failed to save user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setUser(null);
      await AsyncStorage.removeItem('@ScribexX:user');
    } catch (e) {
      setError('Failed to remove user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem('@ScribexX:user', JSON.stringify(updatedUser));
    } catch (e) {
      setError('Failed to update profile');
      throw e;
    }
  };

  return (
    <UserContext.Provider
      value={{ user, isLoading, login, logout, updateProfile, error }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for accessing the UserContext
export const useUser = () => useContext(UserContext);
```

### 2. Progress Context

Manages the student's educational progress, achievements, and portfolio.

```jsx
// src/contexts/ProgressContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { ProgressState, ProgressAction, ProgressContextType } from '../types/progress';

// Initial state
const initialState: ProgressState = {
  redi: {
    completedExercises: [],
    skillMastery: {
      mechanics: 0,
      sequencing: 0,
      voice: 0,
    },
  },
  owl: {
    completedQuests: [],
    unlockedLocations: ['townSquare'], // Starting location always unlocked
    portfolio: [],
    currency: 0,
  },
  achievements: [],
  isLoading: true,
};

// Progress reducer
const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
  switch (action.type) {
    case 'INITIALIZE_PROGRESS':
      return {
        ...action.payload,
        isLoading: false,
      };
    case 'COMPLETE_EXERCISE':
      // Add exercise to completed list if not already there
      if (state.redi.completedExercises.includes(action.payload.exerciseId)) {
        return state;
      }
      
      return {
        ...state,
        redi: {
          ...state.redi,
          completedExercises: [
            ...state.redi.completedExercises,
            action.payload.exerciseId,
          ],
          skillMastery: {
            ...state.redi.skillMastery,
            [action.payload.skillType]: calculateMastery(
              state.redi.skillMastery[action.payload.skillType],
              action.payload.masteryIncrease,
            ),
          },
        },
      };
    case 'COMPLETE_QUEST':
      return {
        ...state,
        owl: {
          ...state.owl,
          completedQuests: [
            ...state.owl.completedQuests,
            action.payload.questId,
          ],
          portfolio: [
            ...state.owl.portfolio,
            action.payload.submission,
          ],
          currency: state.owl.currency + action.payload.reward,
        },
      };
    case 'UNLOCK_LOCATION':
      if (state.owl.unlockedLocations.includes(action.payload.locationId)) {
        return state;
      }
      
      return {
        ...state,
        owl: {
          ...state.owl,
          unlockedLocations: [
            ...state.owl.unlockedLocations,
            action.payload.locationId,
          ],
        },
      };
    case 'EARN_ACHIEVEMENT':
      if (state.achievements.includes(action.payload.achievementId)) {
        return state;
      }
      
      return {
        ...state,
        achievements: [
          ...state.achievements,
          action.payload.achievementId,
        ],
      };
    default:
      return state;
  }
};

// Helper function to calculate new mastery level
const calculateMastery = (current: number, increase: number): number => {
  const newMastery = current + increase;
  return Math.min(100, newMastery); // Cap at 100%
};

// Create context
export const ProgressContext = createContext<ProgressContextType>({
  progress: initialState,
  completeExercise: () => {},
  completeQuest: () => {},
  unlockLocation: () => {},
  earnAchievement: () => {},
});

// Create provider component
export const ProgressProvider: React.FC = ({ children }) => {
  const { user } = useUser();
  const [progress, dispatch] = useReducer(progressReducer, initialState);

  // Load progress from storage when user changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
      try {
        const storedProgress = await AsyncStorage.getItem(`@ScribexX:progress:${user.id}`);
        
        if (storedProgress) {
          dispatch({
            type: 'INITIALIZE_PROGRESS',
            payload: JSON.parse(storedProgress),
          });
        } else {
          dispatch({
            type: 'INITIALIZE_PROGRESS',
            payload: initialState,
          });
        }
      } catch (e) {
        console.error('Failed to load progress', e);
      }
    };

    loadProgress();
  }, [user]);

  // Save progress to storage when it changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!user || progress.isLoading) return;
      
      try {
        await AsyncStorage.setItem(
          `@ScribexX:progress:${user.id}`,
          JSON.stringify(progress)
        );
      } catch (e) {
        console.error('Failed to save progress', e);
      }
    };

    saveProgress();
  }, [progress, user]);

  // Action creators
  const completeExercise = (exerciseId: string, skillType: string, masteryIncrease: number) => {
    dispatch({
      type: 'COMPLETE_EXERCISE',
      payload: { exerciseId, skillType, masteryIncrease },
    });
  };

  const completeQuest = (questId: string, submission: any, reward: number) => {
    dispatch({
      type: 'COMPLETE_QUEST',
      payload: { questId, submission, reward },
    });
  };

  const unlockLocation = (locationId: string) => {
    dispatch({
      type: 'UNLOCK_LOCATION',
      payload: { locationId },
    });
  };

  const earnAchievement = (achievementId: string) => {
    dispatch({
      type: 'EARN_ACHIEVEMENT',
      payload: { achievementId },
    });
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        completeExercise,
        completeQuest,
        unlockLocation,
        earnAchievement,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

// Custom hook for accessing the ProgressContext
export const useProgress = () => useContext(ProgressContext);
```

### 3. Content Context

Manages educational content, exercises, quests, and NPCs.

```jsx
// src/contexts/ContentContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ContentState, ContentContextType } from '../types/content';
import { loadREDIMap, loadREDIExercises } from '../data/rediContent';
import { loadOWLMap, loadOWLNPCs, loadOWLQuests } from '../data/owlContent';

// Initial state
const initialState: ContentState = {
  redi: {
    map: null,
    exercises: {},
  },
  owl: {
    map: null,
    npcs: {},
    quests: {},
  },
  isLoading: true,
};

// Create context
export const ContentContext = createContext<ContentContextType>({
  content: initialState,
  refreshContent: () => Promise.resolve(),
});

// Create provider component
export const ContentProvider: React.FC = ({ children }) => {
  const [content, setContent] = useState<ContentState>(initialState);

  // Load all content on initial mount
  useEffect(() => {
    loadAllContent();
  }, []);

  // Function to load all content
  const loadAllContent = async () => {
    try {
      // Load REDI content
      const rediMap = await loadREDIMap();
      const rediExercises = await loadREDIExercises();
      
      // Load OWL content
      const owlMap = await loadOWLMap();
      const owlNPCs = await loadOWLNPCs();
      const owlQuests = await loadOWLQuests();
      
      setContent({
        redi: {
          map: rediMap,
          exercises: rediExercises,
        },
        owl: {
          map: owlMap,
          npcs: owlNPCs,
          quests: owlQuests,
        },
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to load content', e);
      setContent(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Function to refresh content (used for updates or re-fetching)
  const refreshContent = async () => {
    setContent(prev => ({ ...prev, isLoading: true }));
    await loadAllContent();
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        refreshContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

// Custom hook for accessing the ContentContext
export const useContent = () => useContext(ContentContext);
```

### 4. Theme Context

Manages application themes and visual styles.

```jsx
// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rediTheme } from '../styles/rediTheme';
import { owlTheme } from '../styles/owlTheme';
import { Theme, ThemeType, ThemeContextType } from '../types/theme';

// Initial state
const initialState: {
  theme: Theme;
  themeType: ThemeType;
} = {
  theme: rediTheme,
  themeType: 'redi',
};

// Create context
export const ThemeContext = createContext<ThemeContextType>({
  ...initialState,
  setThemeType: () => {},
});

// Create provider component
export const ThemeProvider: React.FC = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>(initialState.themeType);
  const [theme, setTheme] = useState<Theme>(initialState.theme);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@ScribexX:themeType');
        if (savedTheme && (savedTheme === 'redi' || savedTheme === 'owl')) {
          setThemeType(savedTheme);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };

    loadThemePreference();
  }, []);

  // Update theme when themeType changes
  useEffect(() => {
    setTheme(themeType === 'redi' ? rediTheme : owlTheme);
    
    // Save theme preference
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem('@ScribexX:themeType', themeType);
      } catch (e) {
        console.error('Failed to save theme preference', e);
      }
    };

    saveThemePreference();
  }, [themeType]);

  // Theme change handler
  const handleThemeChange = (newTheme: ThemeType) => {
    setThemeType(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeType,
        setThemeType: handleThemeChange,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing the ThemeContext
export const useTheme = () => useContext(ThemeContext);
```

### 5. UI Context

Manages global UI state such as modals, alerts, and navigation state.

```jsx
// src/contexts/UIContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { UIState, Modal, Alert, UIContextType } from '../types/ui';

// Initial state
const initialState: UIState = {
  activeModals: [],
  currentAlert: null,
  isLoading: false,
  navigationHistory: [],
};

// Create context
export const UIContext = createContext<UIContextType>({
  uiState: initialState,
  showModal: () => {},
  hideModal: () => {},
  showAlert: () => {},
  hideAlert: () => {},
  setLoading: () => {},
  addToNavigationHistory: () => {},
});

// Create provider component
export const UIProvider: React.FC = ({ children }) => {
  const [uiState, setUIState] = useState<UIState>(initialState);

  // Modal management
  const showModal = (modal: Modal) => {
    setUIState(prevState => ({
      ...prevState,
      activeModals: [...prevState.activeModals, modal],
    }));
  };

  const hideModal = (modalId: string) => {
    setUIState(prevState => ({
      ...prevState,
      activeModals: prevState.activeModals.filter(modal => modal.id !== modalId),
    }));
  };

  // Alert management
  const showAlert = (alert: Alert) => {
    setUIState(prevState => ({
      ...prevState,
      currentAlert: alert,
    }));
  };

  const hideAlert = () => {
    setUIState(prevState => ({
      ...prevState,
      currentAlert: null,
    }));
  };

  // Loading state
  const setLoading = (isLoading: boolean) => {
    setUIState(prevState => ({
      ...prevState,
      isLoading,
    }));
  };

  // Navigation history
  const addToNavigationHistory = (screenName: string) => {
    setUIState(prevState => ({
      ...prevState,
      navigationHistory: [...prevState.navigationHistory, {
        screen: screenName,
        timestamp: new Date().toISOString(),
      }],
    }));
  };

  return (
    <UIContext.Provider
      value={{
        uiState,
        showModal,
        hideModal,
        showAlert,
        hideAlert,
        setLoading,
        addToNavigationHistory,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

// Custom hook for accessing the UIContext
export const useUI = () => useContext(UIContext);
```

## Provider Composition

State providers are composed to create a hierarchical state management system:

```jsx
// src/App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

// State Providers
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ContentProvider } from './contexts/ContentContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { UIProvider } from './contexts/UIContext';

// Navigation
import RootNavigator from './navigation';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ThemeProvider>
          <ContentProvider>
            <ProgressProvider>
              <UIProvider>
                <NavigationContainer>
                  <RootNavigator />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </UIProvider>
            </ProgressProvider>
          </ContentProvider>
        </ThemeProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
};

export default App;
```

## Local Component State

For UI-specific state that doesn't need to be shared, component-level state is used:

```jsx
// src/components/exercise/MultipleChoiceExercise.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Exercise } from '../../types/exercise';

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  onSubmit: (answer: number) => void;
}

const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({ 
  exercise, 
  onSubmit 
}) => {
  // Local component state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const { theme } = useTheme();
  
  const handleOptionSelect = (index: number) => {
    if (hasSubmitted) return;
    setSelectedOption(index);
  };
  
  const handleSubmit = () => {
    if (selectedOption === null || hasSubmitted) return;
    
    setHasSubmitted(true);
    onSubmit(selectedOption);
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: theme.colors.text }]}>
        {exercise.question}
      </Text>
      
      <View style={styles.optionsContainer}>
        {exercise.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              selectedOption === index && styles.selectedOption,
              { borderColor: theme.colors.border }
            ]}
            onPress={() => handleOptionSelect(index)}
            disabled={hasSubmitted}
          >
            <Text style={[
              styles.optionText,
              { color: theme.colors.text }
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.submitButton,
          selectedOption === null && styles.disabledButton,
          { backgroundColor: theme.colors.primary }
        ]}
        onPress={handleSubmit}
        disabled={selectedOption === null || hasSubmitted}
      >
        <Text style={styles.submitButtonText}>
          {hasSubmitted ? 'Submitted' : 'Submit Answer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
  },
  submitButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MultipleChoiceExercise;
```

## State Persistence Strategy

ScribexX employs a multi-layered persistence strategy to ensure user data is reliably saved:

### 1. Core Data Persistence

Critical user data is persisted to AsyncStorage:

- **User profile and authentication data**
- **Educational progress**
- **App preferences**
- **Completed exercises and quests**

```jsx
// Example persistence implementation in ProgressContext.tsx
useEffect(() => {
  const saveProgress = async () => {
    if (!user || progress.isLoading) return;
    
    try {
      await AsyncStorage.setItem(
        `@ScribexX:progress:${user.id}`,
        JSON.stringify(progress)
      );
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  };

  saveProgress();
}, [progress, user]);
```

### 2. Autosave for User-Generated Content

Writing activities implement autosave to prevent data loss:

```jsx
// src/components/owl/WritingInterface.tsx (partial)
const WritingInterface = ({ questId, initialContent = '', onSave }) => {
  const [content, setContent] = useState(initialContent);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Autosave effect
  useEffect(() => {
    const autosaveTimer = setTimeout(() => {
      saveContent();
    }, 5000); // Autosave every 5 seconds
    
    return () => clearTimeout(autosaveTimer);
  }, [content]);
  
  const saveContent = async () => {
    try {
      await AsyncStorage.setItem(`@ScribexX:draft:${questId}`, content);
      setLastSaved(new Date());
      onSave(content);
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  };
  
  // Component rendering...
};
```

### 3. Sync Strategy for Future Server Integration

While the MVP uses local storage, the architecture is designed to support future server synchronization:

```jsx
// src/services/syncService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Track pending changes
const pendingChanges = new Set();

// Add changes to sync queue
export const addToSyncQueue = async (key, data) => {
  try {
    // First save locally
    await AsyncStorage.setItem(key, JSON.stringify(data));
    
    // Add to pending changes
    pendingChanges.add(key);
    
    // Save pending changes list
    await AsyncStorage.setItem('@ScribexX:pendingChanges', 
      JSON.stringify(Array.from(pendingChanges)));
    
    // Try to sync immediately if online
    syncIfPossible();
  } catch (e) {
    console.error('Failed to add to sync queue', e);
  }
};

// Sync data if online
export const syncIfPossible = async () => {
  const netInfo = await NetInfo.fetch();
  
  if (netInfo.isConnected && pendingChanges.size > 0) {
    // Process sync queue
    for (const key of pendingChanges) {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          // In the future, this would call the server API
          // await apiClient.sync(key, JSON.parse(data));
          
          // For now, just remove from pending changes
          pendingChanges.delete(key);
        }
      } catch (e) {
        console.error(`Failed to sync ${key}`, e);
      }
    }
    
    // Update pending changes list
    await AsyncStorage.setItem('@ScribexX:pendingChanges', 
      JSON.stringify(Array.from(pendingChanges)));
  }
};

// Initialize by loading pending changes
export const initializeSyncService = async () => {
  try {
    const storedChanges = await AsyncStorage.getItem('@ScribexX:pendingChanges');
    if (storedChanges) {
      const changes = JSON.parse(storedChanges);
      changes.forEach(key => pendingChanges.add(key));
    }
    
    // Set up network change listener
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncIfPossible();
      }
    });
  } catch (e) {
    console.error('Failed to initialize sync service', e);
  }
};
```

## Performance Optimization Strategies

ScribexX implements several strategies to optimize state management performance:

### 1. Context Splitting

Contexts are split by domain to minimize re-renders:

```jsx
// Instead of one large context:
// ❌ const AppContext = createContext({ user, progress, content, theme, ui });

// Split into domain-specific contexts:
// ✅ 
const UserContext = createContext({ user, login, logout, ... });
const ProgressContext = createContext({ progress, complete..., ... });
const ContentContext = createContext({ content, ... });
const ThemeContext = createContext({ theme, ... });
const UIContext = createContext({ ui, ... });
```

### 2. Memoization

React's memoization features are used to prevent unnecessary re-renders:

```jsx
// Using React.memo for components
const REDIMapNode = React.memo(({ id, title, status, onPress }) => {
  // Component implementation...
});

// Using useMemo for expensive calculations
const getAvailableNodes = useMemo(() => {
  return map.nodes.filter(node => {
    // Filtering logic...
  });
}, [map.nodes, completedNodes]);

// Using useCallback for stable function references
const handleNodePress = useCallback((nodeId) => {
  // Handle node press...
}, [dependencies]);
```

### 3. Context Selectors

Custom hooks with selective context access to prevent unnecessary re-renders:

```jsx
// Instead of using the full context:
// ❌ const { progress, completeExercise, completeQuest, ... } = useProgress();

// Create selective hooks:
// ✅
export const useREDIProgress = () => {
  const { progress, completeExercise } = useContext(ProgressContext);
  return {
    rediProgress: progress.redi,
    completeExercise,
  };
};

export const useOWLProgress = () => {
  const { progress, completeQuest, unlockLocation } = useContext(ProgressContext);
  return {
    owlProgress: progress.owl,
    completeQuest,
    unlockLocation,
  };
};
```

### 4. Batch Updates

State updates are batched to minimize render cycles:

```jsx
// Instead of multiple separate updates:
// ❌
// setCompletedExercises([...completedExercises, exerciseId]);
// setSkillMastery({ ...skillMastery, [skill]: newMastery });
// setAchievements([...achievements, newAchievement]);

// Batch updates with reducer:
// ✅
dispatch({
  type: 'EXERCISE_COMPLETED',
  payload: {
    exerciseId,
    skill,
    newMastery,
    newAchievement,
  },
});
```

### 5. Lazy Loading

Content is loaded lazily to improve startup performance:

```jsx
const loadExerciseDetails = async (exerciseId) => {
  // Check if already loaded
  if (exercises[exerciseId]) {
    return exercises[exerciseId];
  }
  
  // Load exercise details
  const exerciseDetails = await fetchExerciseDetails(exerciseId);
  
  // Update state
  setExercises(prev => ({
    ...prev,
    [exerciseId]: exerciseDetails,
  }));
  
  return exerciseDetails;
};
```

## State Debugging and Monitoring

Tools and techniques for debugging state in the ScribexX application:

### 1. State Logging Middleware

A simple middleware pattern for logging state changes:

```jsx
// src/utils/stateLogger.js
const createLoggerMiddleware = (reducer, name) => {
  return (state, action) => {
    console.group(`${name}: ${action.type}`);
    console.log('Previous state:', state);
    console.log('Action:', action);
    const nextState = reducer(state, action);
    console.log('Next state:', nextState);
    console.groupEnd();
    return nextState;
  };
};

// Usage with a reducer
const loggingProgressReducer = __DEV__ 
  ? createLoggerMiddleware(progressReducer, 'Progress')
  : progressReducer;

const [progress, dispatch] = useReducer(loggingProgressReducer, initialState);
```

### 2. State Persistence Inspector

Tool for examining persisted state:

```jsx
// src/utils/stateInspector.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const inspectStoredState = async () => {
  try {
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter ScribexX keys
    const appKeys = keys.filter(key => key.startsWith('@ScribexX:'));
    
    // Get all values
    const result = {};
    for (const key of appKeys) {
      const value = await AsyncStorage.getItem(key);
      result[key] = value ? JSON.parse(value) : null;
    }
    
    console.log('Stored State:', result);
    return result;
  } catch (e) {
    console.error('Error inspecting state', e);
    return null;
  }
};

export const clearStoredState = async () => {
  try {
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter ScribexX keys
    const appKeys = keys.filter(key => key.startsWith('@ScribexX:'));
    
    // Clear all app data
    await AsyncStorage.multiRemove(appKeys);
    
    console.log('Cleared all stored state');
    return true;
  } catch (e) {
    console.error('Error clearing state', e);
    return false;
  }
};
```

### 3. State Visualization Component

A debug component for visualizing application state:

```jsx
// src/components/debug/StateVisualizer.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { useProgress } from '../../contexts/ProgressContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUI } from '../../contexts/UIContext';

const StateVisualizer: React.FC = () => {
  const { user } = useUser();
  const { progress } = useProgress();
  const { theme, themeType } = useTheme();
  const { uiState } = useUI();
  
  const [visible, setVisible] = useState(__DEV__);
  const [activeSection, setActiveSection] = useState('user');
  
  if (!visible) return null;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>State Visualizer</Text>
      
      <View style={styles.tabContainer}>
        <Button title="User" onPress={() => setActiveSection('user')} />
        <Button title="Progress" onPress={() => setActiveSection('progress')} />
        <Button title="Theme" onPress={() => setActiveSection('theme')} />
        <Button title="UI" onPress={() => setActiveSection('ui')} />
      </View>
      
      <ScrollView style={styles.stateContainer}>
        {activeSection === 'user' && (
          <Text style={styles.stateText}>
            {JSON.stringify(user, null, 2)}
          </Text>
        )}
        {activeSection === 'progress' && (
          <Text style={styles.stateText}>
            {JSON.stringify(progress, null, 2)}
          </Text>
        )}
        {activeSection === 'theme' && (
          <Text style={styles.stateText}>
            {`Theme Type: ${themeType}\n\n${JSON.stringify(theme, null, 2)}`}
          </Text>
        )}
        {activeSection === 'ui' && (
          <Text style={styles.stateText}>
            {JSON.stringify(uiState, null, 2)}
          </Text>
        )}
      </ScrollView>
      
      <Button title="Hide" onPress={() => setVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    maxHeight: 300,
    zIndex: 9999,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  stateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    marginBottom: 8,
  },
  stateText: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});

export default StateVisualizer;
```

## Type Definitions

TypeScript type definitions for the state management system:

```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email?: string;
  isTeacher: boolean;
  avatar?: string;
  classIds?: string[];
  createdAt: string;
}

export interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  error: string | null;
}

// src/types/progress.ts
export interface REDIProgress {
  completedExercises: string[];
  skillMastery: {
    mechanics: number;
    sequencing: number;
    voice: number;
  };
}

export interface OWLProgress {
  completedQuests: string[];
  unlockedLocations: string[];
  portfolio: any[]; // Writing submissions
  currency: number;
}

export interface ProgressState {
  redi: REDIProgress;
  owl: OWLProgress;
  achievements: string[];
  isLoading: boolean;
}

export type ProgressAction =
  | { type: 'INITIALIZE_PROGRESS'; payload: ProgressState }
  | { type: 'COMPLETE_EXERCISE'; payload: { exerciseId: string; skillType: string; masteryIncrease: number } }
  | { type: 'COMPLETE_QUEST'; payload: { questId: string; submission: any; reward: number } }
  | { type: 'UNLOCK_LOCATION'; payload: { locationId: string } }
  | { type: 'EARN_ACHIEVEMENT'; payload: { achievementId: string } };

export interface ProgressContextType {
  progress: ProgressState;
  completeExercise: (exerciseId: string, skillType: string, masteryIncrease: number) => void;
  completeQuest: (questId: string, submission: any, reward: number) => void;
  unlockLocation: (locationId: string) => void;
  earnAchievement: (achievementId: string) => void;
}

// src/types/content.ts
export interface REDIMap {
  nodes: REDINode[];
  connections: { from: string; to: string }[];
}

export interface REDINode {
  id: string;
  title: string;
  position: { x: number; y: number };
  exerciseId: string;
  dependencies: string[];
  skillType: 'mechanics' | 'sequencing' | 'voice';
  level: number;
}

export interface Exercise {
  id: string;
  type: string;
  title: string;
  question: string;
  options?: string[];
  text?: string;
  answers: any;
  explanation: string;
  skillType: 'mechanics' | 'sequencing' | 'voice';
  points: number;
}

export interface OWLMap {
  locations: OWLLocation[];
}

export interface OWLLocation {
  id: string;
  name: string;
  position: { x: number; y: number };
  npcIds: string[];
  requires?: {
    rediLevel?: { skill: string; level: number };
    completedQuests?: string[];
  };
}

export interface NPC {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  initialDialogueId: string;
  dialogues: Dialogue[];
}

export interface Dialogue {
  id: string;
  text: string;
  options?: DialogueOption[];
}

export interface DialogueOption {
  text: string;
  nextDialogueId?: string;
  questId?: string;
  isEnd?: boolean;
}

export interface Quest {
  id: string;
  type: string;
  title: string;
  npcId: string;
  description: string;
  requirements: {
    wordCount?: { min: number; max?: number };
    elements?: string[];
  };
  rewards: {
    currency: number;
    items?: string[];
  };
}

export interface ContentState {
  redi: {
    map: REDIMap | null;
    exercises: { [id: string]: Exercise };
  };
  owl: {
    map: OWLMap | null;
    npcs: { [id: string]: NPC };
    quests: { [id: string]: Quest };
  };
  isLoading: boolean;
}

export interface ContentContextType {
  content: ContentState;
  refreshContent: () => Promise<void>;
}

// src/types/theme.ts
export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
}

export interface Typography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

export type ThemeType = 'redi' | 'owl';

export interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (theme: ThemeType) => void;
}

// src/types/ui.ts
export interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
}

export interface Alert {
  title: string;
  message: string;
  buttons?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

export interface NavigationItem {
  screen: string;
  timestamp: string;
}

export interface UIState {
  activeModals: Modal[];
  currentAlert: Alert | null;
  isLoading: boolean;
  navigationHistory: NavigationItem[];
}

export interface UIContextType {
  uiState: UIState;
  showModal: (modal: Modal) => void;
  hideModal: (modalId: string) => void;
  showAlert: (alert: Alert) => void;
  hideAlert: () => void;
  setLoading: (isLoading: boolean) => void;
  addToNavigationHistory: (screenName: string) => void;
}
```

## Best Practices

Guidelines for maintaining and extending ScribexX's state management:

1. **Keep State Close to Usage**
   - Use component state for UI concerns
   - Use context state for shared data
   - Avoid lifting state higher than necessary

2. **Context Optimization**
   - Split contexts by domain
   - Create specific consumer hooks
   - Memoize expensive calculations
   - Use `React.memo` for pure components

3. **Persistence Strategy**
   - Save critical data immediately
   - Use throttling for frequent updates
   - Implement offline capability
   - Handle storage errors gracefully

4. **State Updates**
   - Use immutable update patterns
   - Batch related changes
   - Employ reducers for complex state
   - Consider the useReducer + context pattern

5. **Type Safety**
   - Define clear interfaces
   - Use TypeScript to enforce state shape
   - Document state structure
   - Validate data when loading from storage

6. **Performance Monitoring**
   - Measure render times
   - Watch for unnecessary re-renders
   - Profile large state operations
   - Test on target devices

## Future Enhancements

Plans for enhancing state management as ScribexX evolves:

1. **Server Synchronization**
   - Implement robust sync strategy
   - Add conflict resolution
   - Add offline-first capabilities
   - Support real-time collaboration

2. **State Persistence Improvements**
   - Add encryption for sensitive data
   - Implement data compression
   - Add version migration support
   - Add backup/restore functionality

3. **Analytics Integration**
   - Track state changes for analytics
   - Measure educational effectiveness
   - Monitor usage patterns
   - Support A/B testing

4. **Teacher Dashboard State**
   - Add classroom management state
   - Implement student progress aggregation
   - Support assignment creation and tracking
   - Enable real-time monitoring

5. **Extensible Content System**
   - Support dynamic content updates
   - Add content versioning
   - Enable custom content creation
   - Support content marketplace

By following this state management architecture, ScribexX maintains a clean, maintainable, and performant approach to managing application state while providing a solid foundation for future enhancements.