# Development Guide

## Development Preferences

- Use `bun` instead of `npm` for package management
- Follow Biome linting rules
- TypeScript strict mode enabled
- Vue 3 Composition API with `<script setup>`
- Keep check boxes in `HIGH-LEVEL-PLAN.md` up to date with progress

## Code Style Guidelines

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

## Project Context

This is a Progressive Web App (PWA) for tracking a 12-week progressive strength training program. The app is optimized for mobile use in gym environments with poor connectivity.

### Key Design Principles

- **Thumb-Friendly**: Large buttons, minimal text entry, high contrast
- **Dark Mode First**: Saves battery on OLED screens, easier to read in gyms
- **Offline-First**: Works without internet connection
- **One-Item-Per-Screen**: Card-based design for small screens

### Core UX Features

- **No Typing**: Use `+` and `-` buttons for weight and reps
- **Large Numbers**: Weight and reps are the most important info
- **Simple Navigation**: Next/Previous buttons with keyboard support (Arrow keys)
- **Gym-Specific**: 
  - Wake Lock API to prevent screen sleep
  - Rest timer with vibration
  - Haptic feedback on button presses

## Reference

For detailed architecture, data models, progression algorithms, implementation phases, and feature specifications, see `HIGH-LEVEL-PLAN.md`.
