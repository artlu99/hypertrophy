# hypertrophy

Vue 3 PWA in Vite

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Project Setup

```sh
bun install
```

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Type-Check, Compile and Minify for Production

```sh
bun run build
```

### Credits

Photo by <a href="https://unsplash.com/@weareambitious?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Ambitious Studio* | Rick Barrett</a> on <a href="https://unsplash.com/photos/a-man-holding-a-gym-equipment-in-a-gym-IXPKJcrOZCI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
      