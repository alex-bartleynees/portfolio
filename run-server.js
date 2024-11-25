import express from "express";
import { handler as ssrHandler } from "./dist/server/entry.mjs";
import compression from "compression";

const logStatic = (prefix) => (req, res, next) => {
  // Log the request before trying to serve static file
  console.log(`[Static File Request] ${prefix}${req.path}`);

  // Capture the original end function
  const originalEnd = res.end;

  // Override end to log the response
  res.end = function (...args) {
    console.log(
      `[Static File Response] ${prefix}${req.path} - Status: ${res.statusCode}`,
    );

    // Call the original end function
    originalEnd.apply(res, args);
  };

  next();
};

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();

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

  const base = "/";
  server.use(
    base,
    logStatic(base),
    express.static("dist/client/", {
      // Optional: Add static serving options
      setHeaders: (res, path) => {
        console.log(`[Static File Served] ${path}`);
      },
    }),
  );
  server.use(ssrHandler);

  server.listen(4321);
}
app();
