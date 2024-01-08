import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
  prefetch: true,
  site: "https://alex-bartleynees.github.io/",
  base: "/portfolio_v2",
  trailingSlash: "never",
});
