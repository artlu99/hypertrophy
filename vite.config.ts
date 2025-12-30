import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon.svg"],
      manifest: {
        name: "Hypertrophy",
        short_name: "Hypertrophy",
        description:
          "Hypertrophy - Track your fitness progress and achievements",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icon-180x180.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "apple-touch-icon",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Handle skip waiting message for manual updates
        skipWaiting: false, // We'll handle this manually
        clientsClaim: false,
        // cleanupOutdatedCaches is true by default in Workbox
        // The service worker automatically gets a new hash on each build,
        // which triggers update detection and cache invalidation
      },
      // Custom service worker logic can be added via devOptions
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
