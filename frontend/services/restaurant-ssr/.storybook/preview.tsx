import type { Preview } from "@storybook/nextjs-vite";
import { AntdProvider } from "../../../packages/ui-lib/src/components/AntdProvider/AntdProvider";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
  },
  decorators: [
    (Story) => (
      <AntdProvider>
        <Story />
      </AntdProvider>
    ),
  ],
};

export default preview;
