/* eslint-disable @typescript-eslint/no-require-imports */
import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import path from "path";

const config: Config = {
  title: "@gertalot/sliders",
  tagline: "React (headless) components with custom hooks to build all kinds of sliders, knobs, and dials",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://gertalot.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/sliders/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "gertalot", // Usually your GitHub org/user name.
  projectName: "sliders", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  staticDirectories: ["static"],

  themes: ["@docusaurus/theme-live-codeblock"],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",

          remarkPlugins: [require("remark-mdx")],
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    async function resolveAliasesPlugin(_context, _options) {
      return {
        name: "resolve-aliases",
        configureWebpack(_config, _isServer, _utils) {
          return {
            cache: false,
            resolve: {
              alias: {
                "@gertalot/sliders": path.resolve(__dirname, "../sliders/src"),
              },
            },
          };
        },
      };
    },
    async function tailwindCssPlugin(_context, _options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
  ],

  themeConfig: {
    navbar: {
      title: "@gertalot/sliders",
      logo: {
        alt: "Sliders Logo",
        src: "img/sliders-logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/gertalot/sliders",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    liveCodeBlock: {
      /**
       * The position of the live playground, above or under the editor
       * Possible values: "top" | "bottom"
       */
      playgroundPosition: "top",
    },
    footer: {
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} Gert Verhoog. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
