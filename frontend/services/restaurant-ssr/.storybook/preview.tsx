import "../app/globals.css";

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
          <div className="min-h-screen">
            <Story />
          </div>
        </ApolloProvider>
      </AntdProvider>
    ),
  ],
};

export default preview;
