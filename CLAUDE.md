# Development Guide

> **Note**: For project overview, architecture, data models, progression algorithms, implementation phases, and feature specifications, see [`HIGH-LEVEL-PLAN.md`](./HIGH-LEVEL-PLAN.md).

## Development Preferences

- Use `bun` instead of `npm` for package management (see `package.json` scripts)
- TypeScript strict mode enabled (via `@vue/tsconfig/tsconfig.dom.json` base config)
- Vue 3 Composition API with `<script setup lang="ts">` (all components use this pattern)
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
