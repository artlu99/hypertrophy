/**
 * Minimal Cloudflare Worker for Hypertrophy PWA
 * Handles SPA routing - serves index.html for all routes
 * Static files are automatically served via the site binding
 */

export interface Env {
  __STATIC_CONTENT: any;
  __STATIC_CONTENT_MANIFEST: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Parse manifest
    let manifest: Record<string, string> = {};
    try {
      manifest = JSON.parse(env.__STATIC_CONTENT_MANIFEST || '{}');
    } catch (e) {
      // Ignore manifest parse errors
    }

    // Check if it's a file request (has extension)
    const isFileRequest = /\.[\w]+$/.test(pathname);

    if (isFileRequest) {
      // Serve the file directly
      const assetKey = manifest[pathname] || pathname.replace(/^\//, '');
      const asset = await env.__STATIC_CONTENT.get(assetKey);
      
      if (asset) {
        return new Response(asset.body, {
          headers: {
            'Cache-Control': pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/i)
              ? 'public, max-age=31536000, immutable'
              : 'public, max-age=300',
          },
        });
      }
    }

    // For SPA routes, always serve index.html
    const indexKey = manifest['/index.html'] || 'index.html';
    const indexAsset = await env.__STATIC_CONTENT.get(indexKey);

    if (indexAsset) {
      return new Response(indexAsset.body, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=300, must-revalidate',
        },
      });
    }

    // Fallback 404
    return new Response('Not Found', { status: 404 });
  },
};

