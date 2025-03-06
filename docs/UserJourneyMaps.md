# ScribexX User Journey Maps

This document outlines the key user journeys through the ScribexX application, highlighting the interaction paths, decision points, and progression flows for both students and teachers.

## 1. Student Onboarding Journey

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Welcome    │────▶│  Account    │────▶│  Tutorial   │────▶│  Initial    │
│  Screen     │     │  Creation   │     │  Overview   │     │  Assessment │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                                                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  REDI Home  │◀───┤  Assessment  │◀────│  Skill      │◀────│  Assessment │
│  (Level Map)│     │  Results    │     │  Placement  │     │  Exercises  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Journey Stages:

1. **Welcome Screen**
   - User sees app introduction and value proposition
   - Options: Sign In (existing user) or Create Account (new user)
   - Goal: Create positive first impression and explain app purpose

2. **Account Creation**
   - User enters name, age, grade level
   - Optional teacher code for classroom connection
   - Goal: Gather minimal necessary information for personalization

3. **Tutorial Overview**
   - Brief introduction to REDI and OWL sections
   - Explanation of progression system and gamification elements
   - Goal: Set expectations and teach basic navigation

4. **Initial Assessment**
   - Brief explanation of assessment purpose
   - Series of 5-8 exercises across skill categories
   - Goal: Determine appropriate starting level for student

5. **Assessment Exercises**
   - Multiple choice and simple completion exercises
   - Progress indicator showing assessment completion
   - Goal: Gather data on student's current writing abilities

6. **Skill Placement**
   - System analyzes assessment results
   - Determines starting points for each skill layer
   - Goal: Create personalized learning path

7. **Assessment Results**
   - Visual representation of strengths and areas for improvement
   - Explanation of what the results mean
   - Goal: Provide transparency and motivation

8. **REDI Home (Level Map)**
   - Introduction to the level map interface
   - Highlighted first exercise based on assessment
   - Goal: Clear direction on where to begin

## 2. REDI Learning Journey

```
┌─────────────┐
│  REDI Map   │
│  Screen     │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Select     │────▶│  Exercise   │────▶│  Submit     │────▶│  Feedback   │
│  Exercise   │     │  Completion │     │  Answer     │     │  Screen     │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
       ┌────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Score      │────▶│  Map Update │────▶│  Achievement│────▶│  Unlocked   │
│  Summary    │     │  (Progress) │     │  (Optional) │     │  Content    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │
       │      Mastery < 90%                 Mastery ≥ 90%
       ├─────────────────────┐      ┌─────────────────────┐
       ▼                     │      │                     ▼
┌─────────────┐              │      │              ┌─────────────┐
│  Retry      │◀─────────────┴──────┴─────────────▶│  Next Level │
│  Exercise   │                                     │  Available  │
└─────────────┘                                     └─────────────┘
```

### Journey Stages:

1. **REDI Map Screen**
   - User views the current progression map
   - Available exercises are highlighted
   - Goal: Provide overview of learning path and progress

2. **Select Exercise**
   - User taps on available exercise node
   - Brief description and difficulty shown
   - Goal: User makes informed choice on next learning activity

3. **Exercise Completion**
   - Exercise content is presented based on type
   - Instructions and interactive elements provided
   - Goal: Student engages with learning content

4. **Submit Answer**
   - User completes required interactions
   - Reviews their work
   - Submits for evaluation
   - Goal: Complete learning interaction and initiate feedback loop

5. **Feedback Screen**
   - Immediate indication of correctness
   - Explanation of correct answer if wrong
   - Tips for improvement
   - Goal: Provide educational value through feedback

6. **Score Summary**
   - Points earned displayed
   - Current mastery percentage shown
   - Goal: Quantify progress and achievement

7. **Map Update**
   - Visual update of node status on map
   - Path illumination if applicable
   - Goal: Visualize progress within the larger learning context

8. **Achievement (Optional)**
   - Achievement notification if requirements met
   - Animation and reward indication
   - Goal: Provide additional motivation and recognition

9. **Unlocked Content**
   - Notification of newly unlocked content
   - Could be next level or OWL feature
   - Goal: Create sense of progression and reward

10. **Decision Point**
    - If mastery < 90%: Prompted to retry with new examples
    - If mastery ≥ 90%: Celebrate and encourage next level
    - Goal: Enforce mastery model while maintaining motivation

## 3. OWL Town Exploration Journey

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  OWL Town   │────▶│  Location   │────▶│  NPC        │
│  Map        │     │  Selection  │     │  Interaction│
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                                ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Quest      │◀────│  Quest      │◀────│  Quest      │◀────│  Dialogue   │
│  Completion │     │  Writing    │     │  Acceptance │     │  Options    │
└──────┬──────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Submission │────▶│  NPC        │────▶│  Reward     │────▶│  Town       │
│  Review     │     │  Feedback   │     │  Collection │     │  Update     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
┌─────────────┐     ┌─────────────┐                                 │
│  Portfolio  │◀────│  New Quests │◀────────────────────────────────┘
│  Update     │     │  Available  │
└─────────────┘     └─────────────┘
```

### Journey Stages:

1. **OWL Town Map**
   - Visual representation of the town environment
   - Available locations highlighted
   - Goal: Create engaging exploratory environment

2. **Location Selection**
   - User selects building or area to visit
   - Brief description of location purpose
   - Goal: Familiarize with town geography and purpose

3. **NPC Interaction**
   - Character appears with dialogue
   - Character background and role presented
   - Goal: Create narrative context for writing activities

4. **Dialogue Options**
   - User selects from conversation choices
   - NPC responds accordingly
   - Goal: Create immersive, interactive experience

5. **Quest Acceptance**
   - Writing assignment details presented
   - Requirements and rewards explained
   - Goal: Set clear expectations for the writing task

6. **Quest Writing**
   - Writing interface appears
   - Tools appropriate to the assignment available
   - Reference materials if applicable
   - Goal: Provide appropriate environment for creative writing

7. **Quest Completion**
   - User finalizes writing
   - Review option before submission
   - Goal: Encourage reflection and self-editing

8. **Submission Review**
   - System checks for basic requirements
   - Prompts if minimum requirements not met
   - Goal: Ensure meaningful submissions

9. **NPC Feedback**
   - Character provides feedback in context
   - Positive reinforcement with specific observations
   - Suggestions for improvement
   - Goal: Make feedback engaging and personalized

10. **Reward Collection**
    - Currency awarded
    - Items or unlocks granted
    - Goal: Provide tangible recognition of achievement

11. **Town Update**
    - Visual changes to reflect quest completion
    - New NPC dialogue available
    - Goal: Create sense of impact on the game world

12. **New Quests Available**
    - Notification of new writing opportunities
    - May be at same location or elsewhere
    - Goal: Guide to next activities

13. **Portfolio Update**
    - Writing sample added to student collection
    - Accessible for later review and sharing
    - Goal: Build pride in creative work over time

## 4. Teacher Dashboard Journey

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Teacher    │────▶│  Class      │────▶│  Student    │
│  Login      │     │  Overview   │     │  List       │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                                ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Assignment │◀────│  Class      │◀────│  Student    │
│  Creation   │     │  Management │     │  Details    │
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  Assignment │     │  Progress   │
│  Review     │     │  Reports    │
└─────────────┘     └─────────────┘
```

### Journey Stages:

1. **Teacher Login**
   - Teacher credentials verification
   - Option to create new class or access existing
   - Goal: Secure access to student data

2. **Class Overview**
   - Summary statistics for the entire class
   - Recent activity highlights
   - Alerts for items needing attention
   - Goal: Quick assessment of class progress

3. **Student List**
   - Roster of students with key metrics
   - Sortable by name, progress, recent activity
   - Goal: Easily find specific students or patterns

4. **Student Details**
   - Comprehensive view of individual progress
   - Skill breakdown across REDI areas
   - Portfolio of OWL writing submissions
   - Goal: In-depth understanding of student performance

5. **Class Management**
   - Add/remove students
   - Generate access codes
   - Adjust class settings
   - Goal: Administrative control over class structure

6. **Assignment Creation**
   - Create custom REDI exercises
   - Assign specific OWL quests
   - Set deadlines and requirements
   - Goal: Customize learning experience

7. **Assignment Review**
   - View submitted assignments
   - Provide feedback
   - Grade if applicable
   - Goal: Meaningful teacher input on student work

8. **Progress Reports**
   - Generate reports by student, skill, or time period
   - Export options for sharing
   - Visualization of trend data
   - Goal: Data-driven insights for instruction

## 5. Cross-System Progression Journey

```
┌─────────────┐
│  Initial    │
│  Assessment │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  REDI       │
│  Mechanics 1│
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  REDI       │────▶│  OWL        │
│  Mechanics 2│     │  Library    │
└──────┬──────┘     │  Unlocked   │
       │            └──────┬──────┘
       ▼                   │
┌─────────────┐            │
│  REDI       │            │
│  Mechanics 3│            │
└──────┬──────┘            │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  REDI       │────▶│  OWL        │
│  Sequencing1│     │  Gazette    │
└──────┬──────┘     │  Unlocked   │
       │            └──────┬──────┘
       ▼                   │
┌─────────────┐            │
│  REDI       │            │
│  Sequencing2│            │
└──────┬──────┘            │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  REDI       │────▶│  OWL        │
│  Voice 1    │     │Amphitheater │
└─────────────┘     │  Unlocked   │
                    └─────────────┘
```

### Journey Stages:

1. **Initial Assessment**
   - Determines starting point in REDI system
   - Basic writing skills evaluation
   - Goal: Appropriate skill placement

2. **REDI Mechanics Levels**
   - Focus on grammar, spelling, punctuation
   - Increasingly complex exercises
   - Goal: Build technical writing foundation

3. **Library Unlock in OWL**
   - First OWL location becomes available
   - Research-focused writing quests
   - Goal: Apply basic mechanics in creative context

4. **REDI Sequencing Levels**
   - Focus on paragraph structure, transitions
   - Logical flow and organization
   - Goal: Develop structural writing skills

5. **Gazette Unlock in OWL**
   - Journalism location becomes available
   - Reporting and interview quests
   - Goal: Apply sequencing skills in creative context

6. **REDI Voice Levels**
   - Focus on style, tone, word choice
   - Audience awareness and purpose
   - Goal: Develop advanced writing voice

7. **Amphitheater Unlock in OWL**
   - Creative writing location becomes available
   - Storytelling and performance quests
   - Goal: Apply voice skills in creative context

This integrated progression system ensures that skills learned in structured REDI exercises are immediately applicable in creative OWL projects, creating a cohesive learning experience.

## 6. Decision Points & Critical Interactions

### Key Decision Points

1. **Exercise Difficulty Selection**
   - When multiple exercises are available, students choose difficulty level
   - Easier exercises provide less reward but higher success chance
   - Higher difficulty offers greater rewards but higher challenge

2. **Retry vs. Move On**
   - When mastery is below threshold, students choose to retry or move on
   - Moving on leaves the level incomplete but allows progress
   - Incomplete levels can be revisited later

3. **Quest Selection in OWL**
   - Multiple quests may be available from different NPCs
   - Students choose based on interest, genre, or rewards
   - Different quests reinforce different skill areas

4. **Writing Tool Selection**
   - Different writing tools are available for different quests
   - Tool choice affects the writing process and outcome
   - Experimentation is encouraged

### Critical Interaction Points

1. **First Exercise Completion**
   - Critical for setting expectations and building confidence
   - Carefully designed to ensure high success rate
   - Extra guidance and scaffolding provided

2. **First Writing Submission**
   - First creative work submitted is a significant milestone
   - Positive, encouraging feedback is essential
   - Focus on strengths with gentle suggestions

3. **Achievement Unlocks**
   - Create significant moments of recognition
   - Visually and audibly distinctive
   - Connect to meaningful progress milestones

4. **Level Transitions**
   - Moving between REDI skill layers is a major progression
   - Celebration and acknowledgment of advancement
   - Clear explanation of new challenges and expectations

These user journeys provide a comprehensive view of how students and teachers will experience ScribexX, highlighting the key interaction paths, decision points, and progression frameworks that define the educational experience.