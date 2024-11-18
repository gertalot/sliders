# @gertalot/sliders

React custom hooks for sliders, knobs, and dials.

## What is this?

@gertalot/sliders is a small React library with a number of custom hooks that make it easy
to build sliders, dials, and other components that respond to dragging and sliding actions
from the user. The hooks take care of all user interaction, such as dragging, rotating,
using the mouse wheel, or two-finger scrolling.

## Why does it exist?

For a project involving a climate-controlled environment, I needed something to control temperature and
humidity, preferrably from my phone. This was an excellent excuse to put together this library.
Moving the code that handles the user's dragging, rotating, and scrolling actions out of my components
and into reusable hooks seemed sensible, and I am sharing this in the hope it might be useful or
educational for others.

## Disclaimer

This library has had limited testing so far, and may have bugs. The `package.json` scripts may
be a bit rough around the edges.

## Installation

Install the package using `yarn add @gertalot/sliders` or `npm install @gertalot/sliders`.

## Documentation

The documentation can be found [here](https://gertalot.github.io/sliders/).

## Development

Prerequisites: [Node.js](https://nodejs.org/en) 16 or later, and [yarn](https://yarnpkg.com/).

```sh
git clone https://github.com/gertalot/sliders.git
cd sliders
yarn install
yarn dev
```

### Guide to this repository

This is a monorepo, with the following packages:

- `packages/sliders`: The library itself.
- `packages/docs`: An [Astro](https://astro.build/) [Starlight](https://starlight.astro.build/)
  website that generates [the documentation](https://gertalot.github.io/sliders-docs/).

### Building

`yarn sliders:build` will create a `dist` directory with the compiled library. During development,
you can run `yarn dev` will run a local development server with hot loading, and Storybook to
preview components that use the custom hooks.

The custom hook sources are in `packages/sliders/src/hooks`. There are some [Storybook](https://storybook.js.org/) stories in `__docs__` directories next to the sources.

### Documentation

The docs are built with Astro, using the Starlight theme. Run the docs locally with `yarn docs:dev`,
and check the [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/) docs
for information on how to use this.
