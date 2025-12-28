/**
 * Minimal Cloudflare Worker for Hypertrophy PWA
 * With assets.not_found_handling: "single-page-application" in wrangler.jsonc,
 * Cloudflare automatically serves index.html for non-file routes.
 * This worker can be used for additional logic if needed (e.g., API routes).
 */

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // With not_found_handling: "single-page-application" configured,
    // Cloudflare automatically handles SPA routing. We just need to
    // forward all requests to the ASSETS handler.
    return env.ASSETS.fetch(request);
  },
};

