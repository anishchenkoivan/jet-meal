import "../src/css/jet-meal-fonts.css";
import "../src/css/antdStorybook.css";

import type { Preview } from "@storybook/nextjs-vite";
import { AntdProvider } from "../src/components/AntdProvider/AntdProvider";

const preview: Preview = {
  decorators: [
    (Story) => (
      <AntdProvider>
        <Story />
      </AntdProvider>
    ),
  ],
};

export default preview;
