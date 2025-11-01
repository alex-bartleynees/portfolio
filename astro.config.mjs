import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";

import sitemap from "@astrojs/sitemap";

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap(), compress()],
  prefetch: true,
  site: "https://alexbartleynees.com",
  base: "/",
  output: "hybrid",
  adapter: node({
    mode: "server",
  }),
  server: {
    port: 4321,
  },
  trailingSlash: "always",
  compressHTML: false,
});

