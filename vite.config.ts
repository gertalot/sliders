/// <reference types="vitest" />
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"), // Specifies the entry point for building the library.
      name: "sliders", // Sets the name of the generated library.
      fileName: (format) => `index.${format}.js`, // Generates the output file name based on the format.
      formats: ["cjs", "es"] // Specifies the output formats (CommonJS and ES modules).
    },
    rollupOptions: {
      external: ["react", "react-dom", "typescript"]
    },
    sourcemap: true, // Generates source maps for debugging.
    emptyOutDir: true // Clears the output directory before building.
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.ts"
  }
});
