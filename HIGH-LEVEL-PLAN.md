# High-Level Plan: Hypertrophy - Progressive Strength Tracker PWA

## Project Overview

**Hypertrophy** is a Progressive Web App (PWA) designed for tracking progressive strength training over a 12-week program. The app is optimized for mobile use in gym environments with poor connectivity, featuring a thumb-friendly interface with large buttons and minimal text input.

### Core Value Propositions
- **Offline-First**: Works without internet connection (critical in gyms with bad signal)
- **Installable**: Can be installed on phone like a native app without App Store overhead
- **Thumb-Friendly**: Large buttons, minimal typing, high contrast for gym use
- **Progressive Tracking**: Automatically calculates weight and rep targets based on 12-week program

---

## Tech Stack

### Current Setup
- **Framework**: Vue 3 (Composition API) with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **PWA**: vite-plugin-pwa (configured with trophy-themed assets)
- **Package Manager**: Bun (preferred over npm)
- **Linting**: Biome
- **Icons**: Custom trophy SVG/PNG assets

### Design Decisions
- **Dark Mode First**: Saves battery on OLED screens, easier to read in gyms
- **No External UI Libraries**: Keep bundle size minimal for PWA
- **LocalStorage**: No backend required, all data stored locally
- **TypeScript**: Type safety for progression calculations

---

## Application Architecture

### Three Main Views (Routes)

1. **Dashboard (`/`)**
   - Current week/day indicator (e.g., "Week 4 / 12", "Day 2 - Workout B")
   - Visual progress bar for 12-week cycle
   - Next workout preview (exercise list)
   - Big "START WORKOUT" button
   - History/Settings navigation

2. **Active Workout (`/workout`)**
   - One exercise per screen (card-swipe design)
   - Shows target weight & reps (auto-calculated)
   - Weight adjustment buttons (`+` / `-`)
   - Set counter (e.g., "Set 1 / 3")
   - "COMPLETE SET" button
   - Rest timer (90s or 3min countdown)
   - Navigation: Next exercise / Back

3. **History & Settings (`/history` or `/settings`)**
   - Past workout history list
   - Starting weights configuration
   - Unit preference (kg/lbs)
   - Reset program option

---

## Data Model

### State Structure (Pinia Store)

```typescript
interface UserState {
  user: {
    name: string
    unit: 'kg' | 'lbs'
  }
  program: {
    currentWeek: number // 1-12
    currentDay: number // 1-2 (alternating A/B)
    lastWorkoutDate: string | null
    totalWorkoutsCompleted: number
  }
  exercises: Exercise[]
  workoutHistory: WorkoutSession[]
}

interface Exercise {
  id: number
  name: string
  baseWeight: number
  currentWeight: number
  workoutDay: 'A' | 'B' // Which day this exercise belongs to
}

interface WorkoutSession {
  date: string
  week: number
  day: 'A' | 'B'
  exercises: CompletedExercise[]
}

interface CompletedExercise {
  exerciseId: number
  sets: CompletedSet[]
}

interface CompletedSet {
  weight: number
  reps: number
  completed: boolean
}
```

### Storage Strategy
- **Primary**: Pinia store (reactive state)
- **Persistence**: localStorage (auto-save on state changes)
- **Backup**: Export/import JSON functionality (future)

---

## Progression Algorithm

### 12-Week Program Structure

| Week Block | Target Reps | Sets | Weight Calculation |
|-----------|-------------|------|-------------------|
| **Weeks 1-4** | 3 reps | 3 sets | `Base Weight + ((Week - 1) × Increment)` |
| **Weeks 5-8** | 5 reps | 3 sets | Maintain Week 4 weight, optional deload, then resume |
| **Weeks 9-12** | 5 reps | 3 sets | `Week 8 Weight + ((Week - 8) × Larger Increment)` |

### Exercise Configuration

**Workout A:**
1. Squat
2. Overhead Press
3. Deadlift

**Workout B:**
1. Squat
2. Bench Press
3. Barbell Row

*Note: Squat appears in both days (3x/week frequency)*

### Calculation Functions

```typescript
// Core progression logic
function getTargetWeight(exercise: Exercise, week: number): number
function getTargetReps(week: number): number
function getTargetSets(): number // Always 3
function shouldAdvanceWeek(workoutCompleted: boolean): boolean
```

---

## Implementation Phases

### Phase 1: Foundation & Data Layer ✅ (Complete)
- [x] Vue 3 + TypeScript + Vite setup
- [x] Pinia store structure
- [x] Vue Router configuration
- [x] PWA configuration (vite-plugin-pwa)
- [x] Trophy-themed assets
- [x] Pinia store for workout state
- [x] Progression calculation utilities
- [x] LocalStorage persistence layer

### Phase 2: UI Foundation
- [ ] Dark mode theme system (CSS variables)
- [ ] Typography system (large, high-contrast numbers)
- [ ] Component library foundation:
  - `BigButton.vue` - Large action buttons
  - `ProgressBar.vue` - Week progress indicator
  - `WeightAdjuster.vue` - +/- weight controls
  - `RestTimer.vue` - Countdown timer component
- [ ] Layout components:
  - `AppLayout.vue` - Main app container
  - `ScreenContainer.vue` - Full-height screen wrapper

### Phase 3: Dashboard View
- [ ] Week/Day display component
- [ ] Progress bar visualization
- [ ] Next workout preview
- [ ] "START WORKOUT" button
- [ ] Navigation to history/settings
- [ ] Initial state setup (first-time user flow)

### Phase 4: Active Workout View
- [ ] Exercise card component (one per screen)
- [ ] Exercise navigation (next/previous)
- [ ] Weight display and adjustment
- [ ] Set counter and completion tracking
- [ ] "COMPLETE SET" button with haptic feedback
- [ ] Rest timer integration
- [ ] Workout completion flow
- [ ] Auto-save on set completion

### Phase 5: History & Settings
- [ ] Workout history list view
- [ ] Workout detail view
- [ ] Settings page:
  - Starting weights configuration
  - Unit preference (kg/lbs)
  - Reset program
- [ ] Data export/import (future)

### Phase 6: PWA Enhancements
- [x] Service worker (via vite-plugin-pwa)
- [x] Web manifest
- [ ] Wake Lock API integration (prevent screen sleep)
- [ ] Haptic feedback (`navigator.vibrate()`)
- [ ] Offline detection and messaging
- [ ] Install prompt handling

### Phase 7: Polish & Optimization
- [ ] Animation/transitions (exercise card swipe)
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Testing (unit tests for progression logic)

---

## Key Features & UX Patterns

### Thumb-Friendly Design
- **Large Touch Targets**: Minimum 44×44px, preferably larger
- **Bottom Placement**: Primary actions at bottom of screen
- **High Contrast**: Dark background, bright text/buttons
- **Minimal Typing**: All inputs via +/- buttons or large number pads

### Gym-Specific Features
1. **Wake Lock**: Keep screen on during workout
   ```typescript
   navigator.wakeLock?.request('screen')
   ```

2. **Rest Timer**: Auto-start after set completion
   - 90 seconds for accessory work
   - 3 minutes for main lifts
   - Vibration on completion

3. **Haptic Feedback**: Confirm button presses
   ```typescript
   navigator.vibrate(50) // Short vibration
   ```

4. **Offline Resilience**: 
   - Service worker caching
   - LocalStorage persistence
   - Graceful degradation

---

## File Structure

```
src/
├── assets/
│   └── main.css (dark theme, typography)
├── components/
│   ├── workout/
│   │   ├── ExerciseCard.vue
│   │   ├── WeightAdjuster.vue
│   │   ├── SetCounter.vue
│   │   └── RestTimer.vue
│   ├── dashboard/
│   │   ├── WeekProgress.vue
│   │   ├── NextWorkoutPreview.vue
│   │   └── StartWorkoutButton.vue
│   ├── common/
│   │   ├── BigButton.vue
│   │   └── ProgressBar.vue
│   └── layout/
│       └── AppLayout.vue
├── stores/
│   ├── workout.ts (main workout state)
│   ├── program.ts (program configuration)
│   └── history.ts (workout history)
├── utils/
│   ├── progression.ts (calculation logic)
│   ├── storage.ts (localStorage helpers)
│   └── workout.ts (workout utilities)
├── views/
│   ├── DashboardView.vue
│   ├── WorkoutView.vue
│   └── HistoryView.vue
├── router/
│   └── index.ts
└── main.ts
```

---

## Development Guidelines

### Code Style
- Use `bun` instead of `npm` for package management
- Follow Biome linting rules
- TypeScript strict mode enabled
- Vue 3 Composition API with `<script setup>`

### State Management
- Pinia stores for global state
- Reactive state updates
- Auto-persist to localStorage on changes
- Computed properties for derived state

### Component Design
- Single Responsibility Principle
- Props for configuration, emits for events
- Scoped styles (avoid global CSS pollution)
- Composition functions for reusable logic

---

## Success Metrics

### Functional Requirements
- ✅ PWA installable on mobile devices
- ✅ Works offline (service worker)
- ✅ Accurate progression calculations
- ✅ Persistent workout data
- ✅ Thumb-friendly navigation

### Performance Targets
- First Contentful Paint < 1s
- Time to Interactive < 2s
- Bundle size < 200KB (gzipped)
- Offline functionality 100%

### UX Goals
- Zero typing required during workout
- One-tap set completion
- Clear visual feedback on all actions
- Intuitive navigation (no menus needed)

---

## Future Enhancements (Post-MVP)

- [ ] Multiple program templates
- [ ] Plate calculator (suggest plate combinations)
- [ ] Volume tracking and charts
- [ ] Social sharing of achievements
- [ ] Cloud sync (optional)
- [ ] Exercise form tips/videos
- [ ] Custom exercise library
- [ ] Deload week suggestions
- [ ] PR (Personal Record) tracking and celebrations

---

## Next Steps

1. **Immediate**: ✅ Phase 1 Complete - Data layer and stores are ready
2. **Short-term**: Build dashboard view with week/day display (Phase 2 & 3)
3. **Medium-term**: Implement active workout flow (Phase 4)
4. **Long-term**: Add history, settings, and polish (Phase 5 & 7)

---

*Last Updated: Based on CLAUDE.md and current project structure*

