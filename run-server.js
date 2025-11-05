import express from "express";
import { handler as ssrHandler } from "./dist/server/entry.mjs";
import compression from "compression";
import { trackPageView } from "./instrumentation.js";

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();

  // Add tracking middleware
  server.use((req, res, next) => {
    // Only track actual page views, not asset requests
    if (
      !req.path.match(
        /\.(jpg|jpeg|webp|png|gif|ico|svg|woff|woff2|ttf|eot|css|js)$/,
      )
    ) {
      trackPageView(req.path);
    }
    next();
  });

  server.use(
    compression({
      level: 6,
      threshold: 1000,
    }),
  );

  // Middleware to ensure Cloudflare caches SSR pages appropriately
  server.use((req, res, next) => {
    const originalSend = res.send.bind(res);

    res.send = function (body) {
      // Only add CDN headers if not already set and not a static file
      if (!res.getHeader("CDN-Cache-Control") && res.statusCode === 200) {
        const contentType = res.getHeader("Content-Type") || "";

        if (contentType.includes("text/html")) {
          // HTML pages get ISR treatment
          const browserCache = 60; // 1 minute
          const edgeCache = 300; // 5 minutes
          const staleTime = 604800; // 1 week

          res.setHeader(
            "Cache-Control",
            `public, max-age=${browserCache}, must-revalidate`,
          );
          res.setHeader(
            "CDN-Cache-Control",
            `public, s-maxage=${edgeCache}, stale-while-revalidate=${staleTime}`,
          );
        }
      }

      return originalSend(body);
    };

    next();
  });

  server.use(
    express.static("dist/client/", {
      setHeaders: (res, path) => {
        if (
          path.includes("._") ||
          path.match(/\.(jpg|jpeg|webp|png|gif|ico|svg|woff|woff2|ttf|eot)$/)
        ) {
          // Images and fonts - immutable, long cache
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable",
          );
          // Tell Cloudflare to cache for 1 year as well
          res.setHeader(
            "CDN-Cache-Control",
            "public, max-age=31536000, immutable",
          );
        } else if (path.match(/\.(css|js)$/)) {
          // CSS/JS with content hashes - cache aggressively
          // Astro typically generates hashed filenames like: main.a1b2c3d4.js
          if (path.match(/\.[a-zA-Z0-9]{8,}\.(css|js)$/)) {
            // Hashed assets - treat as immutable
            res.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable",
            );
            res.setHeader(
              "CDN-Cache-Control",
              "public, max-age=31536000, immutable",
            );
          } else {
            // Non-hashed CSS/JS - shorter cache with revalidation
            res.setHeader(
              "Cache-Control",
              "public, max-age=3600, must-revalidate",
            );
            res.setHeader("CDN-Cache-Control", "public, max-age=86400"); // Cloudflare can cache longer
          }
        } else if (path.match(/\.html$/)) {
          // HTML files - should rarely be served as static files with Astro SSR
          // But if they are, use short browser cache, longer edge cache
          res.setHeader(
            "Cache-Control",
            "public, max-age=60, must-revalidate",
          );
          res.setHeader(
            "CDN-Cache-Control",
            "public, max-age=3600, stale-while-revalidate=86400",
          );
        } else {
          // Other files (JSON, XML, etc.)
          res.setHeader(
            "Cache-Control",
            "public, max-age=300, must-revalidate",
          );
          res.setHeader("CDN-Cache-Control", "public, max-age=3600");
        }
      },
      etag: true,
      lastModified: true,
    }),
  );
  server.use(ssrHandler);

  server.listen(4321);
}
app();
