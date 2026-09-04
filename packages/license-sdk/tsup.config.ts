import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "middleware/express": "src/middleware/express.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  // Consumers must bring their own express install (optional peer dep) — don't bundle it.
  external: ["express"],
  target: "node18",
});
