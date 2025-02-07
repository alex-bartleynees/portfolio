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
      filter: (req, res) => {
        if (req.headers["accept-encoding"]?.includes("gzip")) {
          return compression.filter(req, res);
        }
        return false;
      },
    }),
  );

  server.use(
    express.static("dist/client/", {
      setHeaders: (res, path) => {
        if (
          path.includes("._") ||
          path.match(/\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)
        ) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable"); // 1 year
        } else if (path.match(/\.(css|js)$/)) {
          res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day
        } else {
          res.setHeader("Cache-Control", "no-cache");
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
