// ec.config.mjs
import { defineEcConfig } from "@astrojs/starlight/expressive-code";

export default defineEcConfig({
  themes: ["andromeeda", "everforest-light"],
  styleOverrides: {
    borderRadius: "0.5rem",
    codeFontSize: "0.75rem",
  },
});
