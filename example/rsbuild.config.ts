import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSass } from "@rsbuild/plugin-sass";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  html: {
    title: "jotai-idb example",
  },
  plugins: [pluginReact(), pluginSass()],
});
