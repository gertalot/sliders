import type { Meta, StoryObj } from "@storybook/react";
import Example from "./Example";

const meta: Meta<typeof Example> = {
  title: "Button",
  component: Example
};

export default meta;
type Story = StoryObj<typeof Example>;

export const Primary: Story = {
  args: {
    text: "Button",
    onClick: () => console.log("Button")
  }
};
export const Secondary: Story = {
  args: {
    text: "Another Button",
    onClick: () => console.log("Button")
  }
};
