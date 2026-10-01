// Resources
import { defineConfig } from "tsdown";

/** The base configuration for the bundler. */
const configuration = defineConfig({
  entry: ["./src/index.ts"],
});

export default configuration;
