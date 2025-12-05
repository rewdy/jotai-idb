// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";

// https://astro.build/config
export default defineConfig({
  base: "/jotai-idb/",
  integrations: [
    starlight({
      title: "jotai-idb",
      customCss: ["./src/custom.css"],
      favicon: "/favicon.png",
      plugins: [starlightLinksValidator()],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/rewdy/jotai-idb",
        },
      ],
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Getting started", slug: "start/getting-started" },
            {
              label: "Configuration guide",
              slug: "start/configuration-guide",
            },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Basic CRUD", slug: "guides/basic-crud" },
            { label: "Range Queries", slug: "guides/range-queries" },
            { label: "Composite Indexes", slug: "guides/composite-indexes" },
            { label: "Advanced Patterns", slug: "guides/advanced-patterns" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "JotaiIDB Class", slug: "reference/jotaidb" },
            { label: "Configuration", slug: "reference/configuration" },
            { label: "Indexes", slug: "reference/indexes" },
            { label: "Range Queries", slug: "reference/range-queries" },
            { label: "Exports", slug: "reference/exports" },
            { label: "Types", slug: "reference/types" },
          ],
        },
      ],
    }),
  ],
});
