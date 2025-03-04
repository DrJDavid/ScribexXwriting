# ScribexX Technical Setup Guide

This guide will help you set up the initial project structure for ScribexX using React Native with Expo.

## Prerequisites

Before starting, ensure you have the following installed:
- Node.js (14.0 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Git

## Project Initialization

1. Create a new Expo project:

```bash
expo init ScribexX
```

When prompted, select the blank TypeScript template.

2. Navigate to the project directory:

```bash
cd ScribexX
```

3. Install essential dependencies:

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view
npm install react-native-vector-icons
npm install @react-native-async-storage/async-storage
npm install expo-linear-gradient
```

## Project Structure

Create the following folder structure:

```
scribexX/
├── assets/             # Images, fonts, and other static files
├── src/
│   ├── components/     # Reusable components
│   │   ├── common/     # Common UI components
│   │   ├── redi/       # REDI-specific components
│   │   └── owl/        # OWL-specific components 
│   ├── contexts/       # React Context definitions
│   ├── data/           # Mock data and data utilities
│   ├── hooks/          # Custom React hooks
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   │   ├── redi/       # REDI screens
│   │   ├── owl/        # OWL screens
│   │   ├── profile/    # Profile screens
│   │   └── teacher/    # Teacher screens
│   ├── styles/         # Style definitions and themes
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── App.tsx             # Main application component
└── app.json           # Expo configuration
```

## Theme Setup

Create a theme file for each aesthetic:

```typescript
// src/styles/rediTheme.ts
export const rediTheme = {
  colors: {
    primary: '#6320ee',
    secondary: '#1c77c3',
    accent: '#39ff14',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#cccccc',
    border: '#39ff14',
    success: '#00ff9d',
    error: '#ff3864',
  },
  fonts: {
    heading: 'System',
    body: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
};

// src/styles/owlTheme.ts
export const owlTheme = {
  colors: {
    primary: '#3cb371', // Medium sea green
    secondary: '#8b4513', // Saddle brown
    accent: '#ffd700', // Gold
    background: '#1a2f23', // Dark forest green
    surface: '#2d4438', // Medium forest green
    text: '#ffffff',
    textSecondary: '#cccccc',
    border: '#64dfdf',
    success: '#72efdd',
    error: '#ff5a5f',
  },
  fonts: {
    heading: 'System',
    body: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
};
```

## Context Setup

Create a theme context to manage the active theme:

```typescript
// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { rediTheme } from '../styles/rediTheme';
import { owlTheme } from '../styles/owlTheme';

export type ThemeType = 'redi' | 'owl';

interface ThemeContextType {
  theme: typeof rediTheme | typeof owlTheme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeType, setThemeType] = useState<ThemeType>('redi');
  
  const theme = themeType === 'redi' ? rediTheme : owlTheme;
  
  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

Create a user context to manage user state:

```typescript
// src/contexts/UserContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  isTeacher: boolean;
  progress: {
    rediLevels: {
      mechanics: number;
      sequencing: number;
      voice: number;
    };
    owlQuests: string[]; // IDs of completed quests
    currency: number;
  };
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateProgress: (progress: Partial<User['progress']>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = (userData: User) => {
    setUser(userData);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  const updateProgress = (progress: Partial<User['progress']>) => {
    if (user) {
      setUser({
        ...user,
        progress: {
          ...user.progress,
          ...progress,
        },
      });
    }
  };
  
  return (
    <UserContext.Provider value={{ user, login, logout, updateProgress }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

## Navigation Setup

Create the navigation configuration:

```typescript
// src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';

// Import placeholder screens
import REDIMapScreen from '../screens/redi/MapScreen';
import REDIExerciseScreen from '../screens/redi/ExerciseScreen';
import OWLTownScreen from '../screens/owl/TownScreen';
import OWLWritingScreen from '../screens/owl/WritingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TeacherDashboardScreen from '../screens/teacher/DashboardScreen';

const Tab = createBottomTabNavigator();
const REDIStack = createStackNavigator();
const OWLStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const REDIStackNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <REDIStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <REDIStack.Screen name="Map" component={REDIMapScreen} />
      <REDIStack.Screen name="Exercise" component={REDIExerciseScreen} />
    </REDIStack.Navigator>
  );
};

const OWLStackNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <OWLStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <OWLStack.Screen name="Town" component={OWLTownScreen} />
      <OWLStack.Screen name="Writing" component={OWLWritingScreen} />
    </OWLStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
    </ProfileStack.Navigator>
  );
};

export const AppNavigator = () => {
  const { theme, themeType, setThemeType } = useTheme();
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'REDI') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'OWL') {
              iconName = focused ? 'leaf' : 'leaf-outline';
              // Switch to OWL theme when navigating to OWL tab
              if (focused && themeType !== 'owl') {
                setThemeType('owl');
              }
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
          },
        })}
      >
        <Tab.Screen 
          name="REDI" 
          component={REDIStackNavigator} 
          listeners={{
            tabPress: () => {
              // Switch to REDI theme when navigating to REDI tab
              if (themeType !== 'redi') {
                setThemeType('redi');
              }
            },
          }}
        />
        <Tab.Screen name="OWL" component={OWLStackNavigator} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
```

## App.tsx Setup

Set up the main App component:

```typescript
// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './src/contexts/ThemeContext';
import { UserProvider } from './src/contexts/UserContext';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

## Placeholder Screens

Create placeholder screens for the initial navigation structure:

```typescript
// src/screens/redi/MapScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const MapScreen = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>REDI Map Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MapScreen;
```

Create similar placeholder screens for other routes.

## Next Steps

After completing this setup:

1. Test the navigation by running `expo start`
2. Verify that the theme switches when moving between REDI and OWL tabs
3. Begin implementing the REDI Map interface using the cyberpunk aesthetic
4. Start creating the OWL Town interface with the botanical futurism aesthetic

This setup provides the foundation for your 2-week MVP development, with the correct structure and theming approach to support your distinctive aesthetic zones.