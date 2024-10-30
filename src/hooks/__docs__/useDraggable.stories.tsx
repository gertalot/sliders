import type { Meta, StoryObj } from "@storybook/react";
import BasicDraggableDemo from "./BasicDraggableDemo";

const meta: Meta<typeof BasicDraggableDemo> = {
  title: "Basic draggable demo",
  component: BasicDraggableDemo
};

export default meta;
type Story = StoryObj<typeof BasicDraggableDemo>;

export const Primary: Story = {
  args: {}
};
