// Resources
import baseConfig from "../../oxfmt.config.ts";
import { defineConfig } from "oxfmt";

const configuration = defineConfig({
  extends: [baseConfig],
  ignorePatters: ["**/public", "**/build", "routeTree.gen.ts"],
});

export default configuration;
