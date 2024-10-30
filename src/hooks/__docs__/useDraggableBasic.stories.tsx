import type { Meta, StoryObj } from "@storybook/react";

import BasicDraggableDemo from "./BasicDraggableDemo";

const meta: Meta<typeof BasicDraggableDemo> = {
  title: "useDraggable Basic",
  component: BasicDraggableDemo
};

export default meta;

export const BasicDemo: StoryObj<typeof BasicDraggableDemo> = {
  args: {}
};
