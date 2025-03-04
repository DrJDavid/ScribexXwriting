# ScribexX Architecture Diagram & System Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ScribexX Application                        │
├─────────────┬─────────────────────────────────┬─────────────────────┤
│             │                                 │                     │
│  ┌─────────▼─────────┐         ┌─────────────▼───────────┐         │
│  │                   │         │                         │         │
│  │  REDI Subsystem   │         │    OWL Subsystem        │         │
│  │                   │         │                         │         │
│  └─────────┬─────────┘         └─────────────┬───────────┘         │
│            │                                 │                      │
├────────────┼─────────────────────────────────┼──────────────────────┤
│            │                                 │                      │
│  ┌─────────▼─────────────────────────────────▼───────────┐         │
│  │                                                       │         │
│  │                  Core Services                        │         │
│  │                                                       │         │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────────┐ │         │
│  │  │   Theme     │ │   User       │ │  Progress      │ │         │
│  │  │   Context   │ │   Context    │ │  Tracking      │ │         │
│  │  └─────────────┘ └──────────────┘ └────────────────┘ │         │
│  │                                                       │         │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────────┐ │         │
│  │  │  Navigation │ │ Local Storage│ │ Achievement    │ │         │
│  │  │  Service    │ │ Service      │ │ System         │ │         │
│  │  └─────────────┘ └──────────────┘ └────────────────┘ │         │
│  │                                                       │         │
│  └───────────────────────────────┬───────────────────────┘         │
│                                  │                                  │
├──────────────────────────────────┼──────────────────────────────────┤
│                                  │                                  │
│  ┌────────────────────────────────▼────────────────────────────┐   │
│  │                                                             │   │
│  │                     Data Layer                              │   │
│  │                                                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐ ┌──────────────┐ │   │
│  │  │  User Profile   │  │ Learning Content│ │  Progress    │ │   │
│  │  │  & Settings     │  │ & Exercises     │ │  Data        │ │   │
│  │  └─────────────────┘  └─────────────────┘ └──────────────┘ │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Relationships and Data Flow

### 1. Application Core

At the center of ScribexX is a set of core services that manage application state, user data, and provide shared functionality to both the REDI and OWL subsystems.

**Core Services:**
- **Theme Context**: Manages application-wide theming, switching between REDI and OWL aesthetics
- **User Context**: Handles user authentication, profile data, and role-based access
- **Progress Tracking**: Records and analyzes student performance across both subsystems
- **Navigation Service**: Manages transitions between application screens and subsystems
- **Local Storage Service**: Handles persistence of data to device storage
- **Achievement System**: Tracks and awards achievements based on student activities

### 2. REDI Subsystem

The REDI subsystem contains all components related to the structured learning experience with its Synthwave/Cyberpunk aesthetic.

**Key Components:**
- **Level Map**: Visual representation of the learning progression
- **Exercise Engine**: Renders different exercise types and records responses
- **Feedback System**: Provides immediate feedback on exercise performance
- **Progress Visualization**: Shows mastery levels and skill development

**Data Flow:**
1. Level Map loads exercise data from content repository
2. User interacts with exercises
3. Responses are evaluated by the Exercise Engine
4. Results are sent to Progress Tracking service
5. Feedback System presents results to user
6. Level Map updates to reflect new progress state
7. Achievement System checks for newly unlocked achievements

### 3. OWL Subsystem

The OWL subsystem manages the creative writing environment with its Botanical Futurism aesthetic.

**Key Components:**
- **Town Map**: Interactive environment with locations and NPCs
- **Quest System**: Manages writing assignments and their requirements
- **NPC Interaction**: Handles dialogue and quest distribution
- **Writing Interface**: Provides tools for creative writing tasks

**Data Flow:**
1. Town Map loads available locations based on user progress
2. NPC Interaction system presents dialogue and available quests
3. Quest System provides requirements and context for writing tasks
4. User completes writing in the Writing Interface
5. Submission is stored in Progress Data
6. Feedback is generated and presented to user
7. Town Map updates to reflect completion and unlocks new content

### 4. Data Layer

The data layer manages all persistent information needed by the application.

**Key Data Stores:**
- **User Profile & Settings**: Personal information, preferences, and app settings
- **Learning Content & Exercises**: Educational content for both REDI exercises and OWL quests
- **Progress Data**: History of completed activities, scores, and mastery levels

**Data Persistence Strategy (MVP):**
- AsyncStorage for local persistence
- JSON structure for data serialization
- Periodic data validation to prevent corruption

## State Management Architecture

ScribexX uses React Context API as the primary state management solution:

```
┌─────────────────────────────────────────────────────┐
│                Application State                    │
├─────────────────────┬───────────────────────────────┤
│                     │                               │
│  ┌─────────────┐    │     ┌─────────────────────┐   │
│  │ Theme       │    │     │ User                │   │
│  │ Context     │    │     │ Context             │   │
│  └─────────────┘    │     └─────────────────────┘   │
│                     │                               │
│  ┌─────────────┐    │     ┌─────────────────────┐   │
│  │ Progress    │    │     │ Content             │   │
│  │ Context     │    │     │ Context             │   │
│  └─────────────┘    │     └─────────────────────┘   │
│                     │                               │
└─────────────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               Component Local State                 │
├─────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌────────────┐ ┌─────────────────┐  │
│ │ UI State    │ │ Form State │ │ Animation State │  │
│ └─────────────┘ └────────────┘ └─────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               Persistent Storage                    │
├─────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌────────────┐ ┌─────────────────┐  │
│ │ User Data   │ │ Progress   │ │ Settings        │  │
│ └─────────────┘ └────────────┘ └─────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### State Management Guidelines:

1. **Global State** (Context API)
   - User information and authentication state
   - Theme selection and configuration
   - Progress tracking across the application
   - Content and exercise data

2. **Local Component State**
   - UI state (expanded/collapsed, selected items)
   - Form inputs and validation
   - Animation states
   - Component-specific temporary data

3. **Persistent Storage**
   - User profiles and authentication tokens
   - Progress history and achievements
   - Settings and preferences
   - Cached content for offline use

## Initialization and Bootstrapping Sequence

```
1. App loads
   ├─> Initialize core services
   │   ├─> Set up Theme Provider
   │   ├─> Set up User Provider
   │   └─> Set up Progress Provider
   │
   ├─> Check for existing user data
   │   ├─> If found: Restore previous session
   │   └─> If not found: Present onboarding
   │
   ├─> Load initial content data
   │   ├─> Load REDI exercise metadata
   │   └─> Load OWL quest metadata
   │
   └─> Initialize navigation
       ├─> If new user: Navigate to onboarding
       └─> If returning user: Navigate to last screen
```

## Mock Backend Architecture (MVP)

For the 2-week MVP, a mock backend will be implemented using local storage:

```
┌────────────────────────────────────────────────────────┐
│                   Mock Backend Service                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Auth Service   │  │ User Service│  │Data Service │  │
│  └────────┬───────┘  └──────┬──────┘  └──────┬──────┘  │
│           │                 │                │         │
│  ┌────────▼─────────────────▼────────────────▼───────┐ │
│  │                                                   │ │
│  │              Local Storage Adapter               │ │
│  │                                                   │ │
│  └───────────────────────┬───────────────────────────┘ │
│                          │                             │
└──────────────────────────┼─────────────────────────────┘
                           │
                 ┌─────────▼──────────┐
                 │                    │
                 │   AsyncStorage     │
                 │                    │
                 └────────────────────┘
```

This architecture provides a foundation that can be extended to connect to a real backend API in future iterations while allowing for full functionality in the MVP.