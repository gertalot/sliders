/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{src,docs}/**/*.{js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: ["class", '[data-theme="dark"]'],
  corePlugins: {
    preflight: false,
  },
  blocklist: ["container"],
};
