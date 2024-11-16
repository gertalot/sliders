// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://gertalot.github.io",
  base: "/sliders",
  integrations: [
    starlight({
      title: "@gertalot/sliders",
      social: {
        github: "https://github.com/withastro/starlight",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Quickstart", slug: "quickstart" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      customCss: ["./src/custom.css"],
      components: {},
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
});
