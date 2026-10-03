// Resources
import { defineConfig } from "tsdown";

/** The base configuration for the bundler. */
const configuration = defineConfig({
  banner: {
    js: "#!/usr/bin/env node"
  },

  deps: {
    alwaysBundle: [/^@repo\/utility(?:\/.*)?$/u]
  },

  entry: ["./src/index.ts"],

  format: "esm",

  outputOptions: {
    comments: false
  }
});

export default configuration;
