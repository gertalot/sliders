import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/__docs__/*.stories.tsx", "../src/**/__docs__/*.mdx"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  viteFinal: (config) => {
    return {
      ...config,
      build: {
        ...config.build,
        sourcemap: true
      }
    };
  }
};

export default config;