import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts", "src/index.ts"],
  format: ["esm"],
  dts: { entry: "src/index.ts" },
  clean: true,
  splitting: false,
  shims: true,
});
