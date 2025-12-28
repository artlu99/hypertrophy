# Hypertrophy

A Progressive Web App (PWA) for tracking progressive strength training over a 12-week program. Optimized for mobile use in gym environments with poor connectivity, featuring a thumb-friendly interface with large buttons and minimal text input.

## Features

- **Offline-First**: Works without internet connection (critical in gyms with bad signal)
- **Installable**: Can be installed on phone like a native app without App Store overhead
- **Thumb-Friendly**: Large buttons, minimal typing, high contrast for gym use
- **Progressive Tracking**: Automatically calculates weight and rep targets based on 12-week program
- **Dark Mode**: Saves battery on OLED screens, easier to read in gyms

## Tech Stack

- **Framework**: Vue 3 (Composition API) with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **PWA**: vite-plugin-pwa
- **Package Manager**: Bun

## Requirements

- Node.js 20+ (or Bun runtime)
- Bun (preferred) or npm

## Project Setup

```sh
bun install
```

## Development

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Type-Check, Compile and Minify for Production

```sh
bun run build
```

### Deploy

```sh
bun run deploy
```

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Documentation

- [`HIGH-LEVEL-PLAN.md`](./HIGH-LEVEL-PLAN.md) - Architecture, data models, progression algorithms, and implementation details
- [`WORKOUT.md`](./WORKOUT.md) - 12-week program structure and exercise descriptions
- [`CLAUDE.md`](./CLAUDE.md) - Development guide and code style guidelines

## Credits

Photo by <a href="https://unsplash.com/@pbulwan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Paweł Bulwan</a> on <a href="https://unsplash.com/photos/a-black-and-white-photo-of-a-dumbbell-JWK2H-2qz1Y?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
      
Photo by <a href="https://unsplash.com/@pbulwan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Paweł Bulwan</a> on <a href="https://unsplash.com/photos/a-black-and-white-photo-of-a-dumbbell-JWK2H-2qz1Y?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

Photo by <a href="https://unsplash.com/@weareambitious?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Ambitious Studio* | Rick Barrett</a> on <a href="https://unsplash.com/photos/a-man-holding-a-gym-equipment-in-a-gym-IXPKJcrOZCI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
