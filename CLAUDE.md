# General Instructions

## Development Preferences

- Use `bun` instead of `npm` where possible
- Depend on `biome` for linting
- Follow the detailed plan in `HIGH-LEVEL-PLAN.md` and keep the check boxes up to date with progress

## Project Context

This is a Progressive Web App (PWA) for tracking a 12-week progressive strength training program. The app is optimized for mobile use in gym environments with poor connectivity.

### Key Design Principles

- **Thumb-Friendly**: Large buttons, minimal text entry, high contrast
- **Dark Mode First**: Saves battery on OLED screens, easier to read in gyms
- **Offline-First**: Works without internet connection
- **One-Item-Per-Screen**: Card-swipe design for small screens

### Core UX Features

- **No Typing**: Use `+` and `-` buttons for weight and reps
- **Large Numbers**: Weight and reps are the most important info
- **Simple Navigation**: Just a "Next" button that swipes to the next exercise
- **Gym-Specific**: 
  - Wake Lock API to prevent screen sleep
  - Rest timer with vibration
  - Haptic feedback on button presses

## Reference

For detailed architecture, data models, progression algorithms, and implementation phases, see `HIGH-LEVEL-PLAN.md`.
