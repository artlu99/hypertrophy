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
   - Current week/day indicator (e.g., "Week 4 / 12", "Workout A")
   - Visual progress bar for 12-week cycle
   - Next workout preview (exercise list)
   - Big "START WORKOUT" button
   - History/Settings navigation

2. **Active Workout (`/workout`)** ✅
   - One exercise per screen (card-based design)
   - Shows target weight & reps (auto-calculated)
   - Weight adjustment buttons (`+` / `-`) with visual feedback
   - Set counter (e.g., "Set 1 / 3") with progress bar
   - "COMPLETE SET" button with haptic feedback
   - Rest timer (90s for accessory, 3min for main lifts, manual start)
   - Navigation: Next/Previous exercise buttons (keyboard support with Arrow keys)
   - Wake Lock API (keeps screen on during workout)
   - Workout completion flow with success screen
   - Auto-save progress to localStorage on set completion
   - Smooth transitions between exercises

3. **History & Settings (`/history` and `/settings`)** ✅
   - Workout history list with date formatting and stats
   - Detailed workout view with exercise breakdown
   - Settings page with unit preference toggle (kg/lbs)
   - Starting weights configuration for all exercises
   - Program management with reset functionality
   - Change detection and save/cancel actions

---

## Data Model

### State Structure (Pinia Store)

```typescript
interface WorkoutState {
  user: User
  program: Program
  exercises: Exercise[]
  workoutHistory: WorkoutSession[]
}

interface User {
  name: string
  unit: 'kg' | 'lbs'
}

interface Program {
  currentWeek: number // 1-12
  currentDay: 'A' | 'B' // Workout day (currently all exercises are in Workout A)
  lastWorkoutDate: string | null // ISO date string
  totalWorkoutsCompleted: number
}

interface Exercise {
  id: number
  name: string
  baseWeight: number
  currentWeight: number
  workoutDay: 'A' | 'B' // Which day this exercise belongs to
  trackingType?: 'weight' | 'reps' | 'time' // How this exercise is tracked (default: 'weight')
  baseTime?: number // Base time in seconds for time-based exercises (e.g., Plank)
  currentTime?: number // Current target time in seconds for time-based exercises
  baseReps?: number // Base/target reps for reps-based exercises (e.g., Push-Ups)
  currentReps?: number // Typical/average reps achieved for progression tracking
}

interface WorkoutSession {
  date: string // ISO date string
  week: number // 1-12
  day: 'A' | 'B'
  exercises: CompletedExercise[]
}

interface CompletedExercise {
  exerciseId: number
  sets: CompletedSet[]
}

interface CompletedSet {
  weight: number // For weight-based exercises
  reps: number // For reps-based exercises (or weight-based)
  time?: number // For time-based exercises (in seconds)
  completed: boolean
}
```

### Storage Strategy
- **Primary**: Pinia store (reactive state)
- **Persistence**: localStorage (auto-save on state changes)
- **Backup**: Export/import JSON functionality (implemented)

---

## Progression Algorithm

> **Note**: For detailed exercise descriptions, sets, reps, and progression guidance, see [`WORKOUT.md`](./WORKOUT.md).

### 12-Week Program Structure

| Week Block | Target Reps | Sets | Weight Calculation |
|-----------|-------------|------|-------------------|
| **Weeks 1-2** | 10 reps | 3 sets | `Base Weight` (focus on form, no weight increase) |
| **Weeks 3-12** | 11 reps (10-12 range) | 3 sets | `Base Weight + ((Week - 2) × 2.5kg)` |

### Calculation Functions

```typescript
// Core progression logic
function getTargetWeight(exercise: Exercise, week: number, unit: 'kg' | 'lbs'): number
function getTargetReps(week: number): number // Returns 10 for weeks 1-2, 11 for weeks 3-12
function getTargetSets(): number // Always 3
function shouldAdvanceWeek(currentDay: 'A' | 'B', workoutCompleted: boolean): boolean
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

### Phase 2: UI Foundation ✅ (Complete)
- [x] Dark mode theme system (CSS variables)
- [x] Typography system (large, high-contrast numbers)
- [x] Component library foundation:
  - `BigButton.vue` - Large action buttons
  - `ProgressBar.vue` - Week progress indicator
  - `WeightAdjuster.vue` - +/- weight controls
  - `RestTimer.vue` - Countdown timer component
- [x] Layout components:
  - `AppLayout.vue` - Main app container
  - `ScreenContainer.vue` - Full-height screen wrapper

### Phase 3: Dashboard View ✅ (Complete)
- [x] Week/Day display component
- [x] Progress bar visualization
- [x] Next workout preview
- [x] "START WORKOUT" button
- [x] Navigation to history/settings
- [x] Initial state setup (first-time user flow)

### Phase 4: Active Workout View ✅ (Complete)
- [x] Exercise card component (one per screen)
- [x] Exercise navigation (next/previous)
- [x] Weight display and adjustment
- [x] Set counter and completion tracking
- [x] "COMPLETE SET" button with haptic feedback
- [x] Rest timer integration
- [x] Workout completion flow
- [x] Auto-save on set completion

### Phase 5: History & Settings ✅ (Complete)
- [x] Workout history list view
- [x] Workout detail view
- [x] Settings page:
  - Starting weights configuration
  - Unit preference (kg/lbs)
  - Reset program

### Phase 6: PWA Enhancements ✅ (Complete)
- [x] Service worker (via vite-plugin-pwa)
- [x] Web manifest
- [x] Wake Lock API integration (prevent screen sleep)
- [x] Haptic feedback (`navigator.vibrate()`)
- [x] Offline detection and messaging
- [x] Install prompt handling

### Phase 7: Polish & Optimization ✅ (Complete)
- [x] Animation/transitions (exercise card transitions)
- [x] Error handling and edge cases
- [x] Performance optimization
- [x] Accessibility improvements

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

2. **Rest Timer**: Manual start after set completion
   - 90 seconds for accessory work
   - 3 minutes (180s) for main lifts
   - Vibration on completion

3. **Haptic Feedback**: Confirm button presses
   ```typescript
   navigator.vibrate(50) // Short vibration
   ```

4. **Offline Resilience**: 
   - Service worker caching
   - LocalStorage persistence
   - Graceful degradation
   - Offline indicator with user-friendly messaging
   - Install prompt for better PWA experience
   - Error handling with toast notifications

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

## Next Steps

1. **Immediate**: ✅ All Phases Complete - MVP is production-ready!
2. **Short-term**: Deploy to production and gather user feedback
3. **Medium-term**: Consider future enhancements based on user needs
4. **Long-term**: Future enhancements (multiple programs, charts, cloud sync, etc.)

---

*Last Updated: All Phases Complete - MVP Production Ready - December 2024*

