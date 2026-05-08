import "@jet-meal/ui-lib/src/css/jet-meal-fonts.css";
import "@jet-meal/ui-lib/src/css/antdStorybook.css";

import type { Preview } from "@storybook/nextjs-vite";
import { AntdProvider } from "../../../packages/ui-lib/src/components/AntdProvider/AntdProvider";
import { ApolloProvider } from "../src/components/ApolloProvider/ApolloProvider";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
  },
  decorators: [
    (Story) => (
      <AntdProvider>
        <ApolloProvider>
          <div style={{ minHeight: "100vh" }}>
            <Story />
          </div>
        </ApolloProvider>
      </AntdProvider>
    ),
  ],
};

export default preview;
