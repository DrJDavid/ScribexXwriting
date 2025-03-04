# ScribexX API Design Document

This document outlines the API design for ScribexX, including endpoints, request/response formats, authentication, and implementation guidance for both the MVP mock backend and future server-based backend.

## API Overview

The ScribexX API is organized into the following core service areas:

1. **Authentication** - User login, registration, and session management
2. **User Management** - Profile information and settings
3. **Content** - Exercise and quest data
4. **Progress** - Student activity tracking and performance data
5. **Achievements** - Awards and unlocks
6. **Teacher** - Classroom management and student monitoring

## Mock API Implementation (MVP)

For the 2-week MVP, we'll implement a mock API using AsyncStorage that mimics RESTful endpoints. This allows for future migration to a real backend while enabling full app functionality during initial development.

### Mock API Service Structure

```typescript
// src/services/api/index.ts
import AuthAPI from './auth';
import UserAPI from './user';
import ContentAPI from './content';
import ProgressAPI from './progress';
import AchievementAPI from './achievement';
import TeacherAPI from './teacher';

const API = {
  auth: AuthAPI,
  user: UserAPI,
  content: ContentAPI,
  progress: ProgressAPI,
  achievement: AchievementAPI,
  teacher: TeacherAPI,
};

export default API;
```

Each API module will implement the same interface as the future server API but will use AsyncStorage for data persistence.

### Mock API Implementation Example

```typescript
// src/services/api/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateToken, hashPassword } from '../utils/security';

const USERS_STORAGE_KEY = '@ScribexX:users';
const SESSIONS_STORAGE_KEY = '@ScribexX:sessions';

const AuthAPI = {
  login: async (email: string, password: string) => {
    try {
      const usersJSON = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      
      const user = users.find(u => u.email === email);
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      
      // In a real implementation, compare hashed passwords
      if (user.password !== hashPassword(password)) {
        return { success: false, error: 'Invalid password' };
      }
      
      const token = generateToken();
      
      // Store session
      const sessionsJSON = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
      const sessions = sessionsJSON ? JSON.parse(sessionsJSON) : [];
      sessions.push({
        token,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      
      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isTeacher: user.isTeacher,
          }
        }
      };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  },
  
  // Additional auth methods...
};

export default AuthAPI;
```

## API Endpoints (Future Implementation)

### 1. Authentication API

#### Register User

- **Endpoint:** `POST /api/auth/register`
- **Request:**
  ```json
  {
    "name": "Student Name",
    "email": "student@example.com",
    "password": "securepassword",
    "isTeacher": false,
    "classCode": "ABC123" // Optional
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": "user_id",
        "name": "Student Name",
        "email": "student@example.com",
        "isTeacher": false
      }
    }
  }
  ```

#### Login User

- **Endpoint:** `POST /api/auth/login`
- **Request:**
  ```json
  {
    "email": "student@example.com",
    "password": "securepassword"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": "user_id",
        "name": "Student Name",
        "email": "student@example.com",
        "isTeacher": false
      }
    }
  }
  ```

#### Logout User

- **Endpoint:** `POST /api/auth/logout`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true
  }
  ```

#### Validate Token

- **Endpoint:** `GET /api/auth/validate`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "valid": true,
      "user": {
        "id": "user_id",
        "name": "Student Name",
        "email": "student@example.com",
        "isTeacher": false
      }
    }
  }
  ```

### 2. User API

#### Get User Profile

- **Endpoint:** `GET /api/users/me`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "user_id",
      "name": "Student Name",
      "email": "student@example.com",
      "isTeacher": false,
      "avatar": "avatar_url",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "classIds": ["class_id_1", "class_id_2"]
    }
  }
  ```

#### Update User Profile

- **Endpoint:** `PUT /api/users/me`
- **Headers:** `Authorization: Bearer token`
- **Request:**
  ```json
  {
    "name": "Updated Name",
    "avatar": "new_avatar_url"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "user_id",
      "name": "Updated Name",
      "email": "student@example.com",
      "avatar": "new_avatar_url"
    }
  }
  ```

#### Join Class

- **Endpoint:** `POST /api/users/classes/join`
- **Headers:** `Authorization: Bearer token`
- **Request:**
  ```json
  {
    "classCode": "ABC123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "classId": "class_id",
      "className": "Class Name",
      "teacherName": "Teacher Name"
    }
  }
  ```

### 3. Content API

#### Get REDI Map

- **Endpoint:** `GET /api/content/redi/map`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "nodes": [
        {
          "id": "node_id_1",
          "title": "Basic Grammar",
          "description": "Learn fundamental grammar rules",
          "type": "mechanics",
          "difficulty": 1,
          "position": { "x": 100, "y": 150 },
          "dependencies": []
        },
        // More nodes...
      ],
      "connections": [
        { "from": "node_id_1", "to": "node_id_2" },
        // More connections...
      ]
    }
  }
  ```

#### Get REDI Exercise

- **Endpoint:** `GET /api/content/redi/exercises/:exerciseId`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "exercise_id",
      "type": "multipleChoice",
      "title": "Subject-Verb Agreement",
      "instructions": "Select the sentence with correct subject-verb agreement.",
      "content": {
        "options": [
          "The group of students are working on their projects.",
          "The group of students is working on their projects.",
          "The group of students was working on its projects.",
          "The group of students were working on its projects."
        ]
      },
      "points": 10,
      "timeLimit": 60
    }
  }
  ```

#### Get OWL Town Map

- **Endpoint:** `GET /api/content/owl/map`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "locations": [
        {
          "id": "location_id_1",
          "name": "Town Square",
          "description": "Central meeting point with the town bulletin board",
          "unlocked": true,
          "position": { "x": 200, "y": 200 },
          "npcIds": ["npc_id_1"]
        },
        // More locations...
      ]
    }
  }
  ```

#### Get NPC Data

- **Endpoint:** `GET /api/content/owl/npcs/:npcId`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "npc_id_1",
      "name": "Mayor Logophile",
      "description": "The town's enthusiastic mayor with a love for language",
      "avatar": "avatar_url",
      "dialogues": [
        {
          "id": "dialogue_id_1",
          "text": "Welcome to our town! Are you ready to become a master writer?",
          "options": [
            {
              "text": "Yes, I'm excited to learn!",
              "nextDialogueId": "dialogue_id_2"
            },
            {
              "text": "What kinds of writing will I learn?",
              "nextDialogueId": "dialogue_id_3"
            }
          ]
        },
        // More dialogues...
      ],
      "availableQuests": ["quest_id_1", "quest_id_2"]
    }
  }
  ```

#### Get Quest Data

- **Endpoint:** `GET /api/content/owl/quests/:questId`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "quest_id_1",
      "title": "Festival Headline News",
      "description": "The annual Digital Bloom Festival is happening in Town Square. Cover the event with a news article that includes all 5Ws.",
      "type": "journalism",
      "requirements": {
        "wordCount": { "min": 150, "max": 200 },
        "elements": ["headline", "5ws"]
      },
      "npcId": "npc_id_2",
      "rewards": {
        "currency": 50,
        "items": ["press_badge"],
        "experience": 100
      }
    }
  }
  ```

### 4. Progress API

#### Submit REDI Exercise

- **Endpoint:** `POST /api/progress/redi/exercises/:exerciseId`
- **Headers:** `Authorization: Bearer token`
- **Request:**
  ```json
  {
    "answer": 1, // For multiple choice
    "timeSpent": 45 // Seconds
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "correct": true,
      "score": 10,
      "feedback": "Correct! The subject 'group' is singular, so it takes the singular verb 'is'.",
      "mastery": 85, // Percentage for this skill area
      "unlockedNodeIds": ["node_id_3"], // Newly unlocked nodes
      "achievements": [] // Any new achievements earned
    }
  }
  ```

#### Get REDI Progress

- **Endpoint:** `GET /api/progress/redi`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "completedNodes": [
        {
          "nodeId": "node_id_1",
          "exerciseId": "exercise_id_1",
          "score": 10,
          "mastery": 100,
          "completedAt": "2023-01-01T12:00:00.000Z",
          "attempts": 1
        },
        // More completed nodes...
      ],
      "skillMastery": {
        "mechanics": 75,
        "sequencing": 40,
        "voice": 10
      },
      "totalPoints": 350
    }
  }
  ```

#### Submit OWL Quest

- **Endpoint:** `POST /api/progress/owl/quests/:questId`
- **Headers:** `Authorization: Bearer token`
- **Request:**
  ```json
  {
    "content": "The annual Digital Bloom Festival kicked off yesterday with...",
    "metadata": {
      "wordCount": 175,
      "headline": "Digital Bloom Festival Lights Up Town Square"
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "accepted": true,
      "feedback": {
        "strengths": ["Clear 5Ws coverage", "Engaging headline"],
        "suggestions": ["Consider adding more descriptive language"]
      },
      "rewards": {
        "currency": 50,
        "items": ["press_badge"],
        "experience": 100
      },
      "unlockedQuests": ["quest_id_3"],
      "achievements": ["achievement_id_2"]
    }
  }
  ```

#### Get OWL Progress

- **Endpoint:** `GET /api/progress/owl`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "completedQuests": [
        {
          "questId": "quest_id_1",
          "title": "Festival Headline News",
          "completedAt": "2023-01-02T14:30:00.000Z",
          "rating": 4 // 1-5 rating if applicable
        },
        // More completed quests...
      ],
      "unlockedLocations": ["location_id_1", "location_id_2"],
      "portfolio": [
        {
          "id": "submission_id_1",
          "questId": "quest_id_1",
          "title": "Digital Bloom Festival Lights Up Town Square",
          "content": "The annual Digital Bloom Festival kicked off yesterday with...",
          "submittedAt": "2023-01-02T14:30:00.000Z",
          "type": "journalism"
        },
        // More portfolio items...
      ],
      "currency": 150
    }
  }
  ```

### 5. Achievement API

#### Get Achievements

- **Endpoint:** `GET /api/achievements`
- **Headers:** `Authorization: Bearer token`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "earned": [
        {
          "id": "achievement_id_1",
          "title": "Grammar Master",
          "description": "Complete 10 grammar exercises",
          "icon": "icon_url",
          "earnedAt": "2023-01-05T10:15:00.000Z",
          "category": "mechanics"
        },
        // More earned achievements...
      ],
      "available": [
        {
          "id": "achievement_id_3",
          "title": "Journalist Extraordinaire",
          "description": "Complete 5 journalism quests",
          "icon": "icon_url",
          "category": "owl",
          "progress": {
            "current": 2,
            "total": 5
          }
        },
        // More available achievements...
      ]
    }
  }
  ```

### 6. Teacher API

#### Create Class

- **Endpoint:** `POST /api/teacher/classes`
- **Headers:** `Authorization: Bearer token` (teacher only)
- **Request:**
  ```json
  {
    "name": "English 101",
    "grade": 7,
    "description": "Introduction to English composition"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "class_id",
      "name": "English 101",
      "grade": 7,
      "description": "Introduction to English composition",
      "code": "XYZ789", // Generated access code
      "createdAt": "2023-01-10T08:00:00.000Z"
    }
  }
  ```

#### Get Class Students

- **Endpoint:** `GET /api/teacher/classes/:classId/students`
- **Headers:** `Authorization: Bearer token` (teacher only)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "students": [
        {
          "id": "user_id_1",
          "name": "Student Name",
          "joinedAt": "2023-01-11T09:30:00.000Z",
          "progress": {
            "redi": {
              "mechanics": 70,
              "sequencing": 45,
              "voice": 20
            },
            "owl": {
              "completedQuests": 5,
              "lastActive": "2023-01-15T14:20:00.000Z"
            }
          }
        },
        // More students...
      ]
    }
  }
  ```

#### Get Student Detail

- **Endpoint:** `GET /api/teacher/students/:studentId`
- **Headers:** `Authorization: Bearer token` (teacher only)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "user_id_1",
      "name": "Student Name",
      "email": "student@example.com",
      "progress": {
        "redi": {
          "completedExercises": [...],
          "skillMastery": {...},
          "recentActivity": [...]
        },
        "owl": {
          "completedQuests": [...],
          "portfolio": [...],
          "recentActivity": [...]
        }
      },
      "achievements": [...]
    }
  }
  ```

#### Create Assignment

- **Endpoint:** `POST /api/teacher/assignments`
- **Headers:** `Authorization: Bearer token` (teacher only)
- **Request:**
  ```json
  {
    "classId": "class_id",
    "title": "Grammar Review",
    "description": "Complete these exercises to review last week's grammar lessons",
    "type": "redi", // or "owl"
    "contentIds": ["exercise_id_1", "exercise_id_2"], // or quest IDs
    "dueDate": "2023-01-20T23:59:59.000Z",
    "points": 50
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "assignment_id",
      "title": "Grammar Review",
      "description": "Complete these exercises to review last week's grammar lessons",
      "type": "redi",
      "contentIds": ["exercise_id_1", "exercise_id_2"],
      "dueDate": "2023-01-20T23:59:59.000Z",
      "points": 50,
      "createdAt": "2023-01-15T10:00:00.000Z"
    }
  }
  ```

## Authentication and Security

### JWT Authentication

- All API requests (except registration and login) require authentication
- JWT tokens are used for authentication
- Tokens should be included in the Authorization header
- Tokens have an expiration time (default: 7 days)

### Security Considerations

- Passwords should be hashed using bcrypt before storage
- All API requests should use HTTPS in production
- Rate limiting should be implemented to prevent abuse
- Input validation should be performed on all requests
- Role-based access control ensures teachers can only access their own classes

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid or expired token"
  }
}
```

Common error codes include:
- `AUTHENTICATION_FAILED` - Authentication issues
- `AUTHORIZATION_FAILED` - Permission issues
- `VALIDATION_ERROR` - Invalid input data
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `SERVER_ERROR` - Internal server error

## Mock Backend Implementation (MVP)

For the 2-week MVP, the following storage structure will be used with AsyncStorage:

- `@ScribexX:users` - User account information
- `@ScribexX:sessions` - Active user sessions
- `@ScribexX:rediContent` - REDI exercises and map data
- `@ScribexX:owlContent` - OWL town, NPCs, and quests
- `@ScribexX:rediProgress` - User progress in REDI exercises
- `@ScribexX:owlProgress` - User progress in OWL quests
- `@ScribexX:achievements` - Achievement definitions and user achievements
- `@ScribexX:classes` - Teacher class information
- `@ScribexX:assignments` - Teacher-created assignments

The mock API service will simulate network delays and potential errors to provide a realistic API experience.

## API Client Implementation

A centralized API client will handle requests to the mock backend:

```typescript
// src/services/apiClient.ts
import API from './api';

const apiClient = {
  async request(method, endpoint, data = null, token = null) {
    // Add artificial delay to simulate network
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const [service, ...path] = endpoint.split('/');
    
    if (!API[service]) {
      return {
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: `Service '${service}' not found`
        }
      };
    }
    
    const serviceMethod = path.join('_');
    
    if (!API[service][serviceMethod]) {
      return {
        success: false,
        error: {
          code: 'METHOD_NOT_FOUND',
          message: `Method '${serviceMethod}' not found in service '${service}'`
        }
      };
    }
    
    try {
      return await API[service][serviceMethod](data, token);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message
        }
      };
    }
  },
  
  // Convenience methods
  get(endpoint, token = null) {
    return this.request('GET', endpoint, null, token);
  },
  
  post(endpoint, data, token = null) {
    return this.request('POST', endpoint, data, token);
  },
  
  put(endpoint, data, token = null) {
    return this.request('PUT', endpoint, data, token);
  },
  
  delete(endpoint, token = null) {
    return this.request('DELETE', endpoint, null, token);
  }
};

export default apiClient;
```

## Migration to Real Backend

When transitioning from the mock backend to a real server API:

1. Replace the API service implementations with fetch/axios calls to real endpoints
2. Maintain the same request/response structure for compatibility
3. Implement proper error handling for network issues
4. Add token refresh logic for expired authentication
5. Implement proper request queuing for offline support

This API design document provides a comprehensive blueprint for both the MVP mock implementation and future server-based backend, ensuring a smooth transition path as the project evolves.