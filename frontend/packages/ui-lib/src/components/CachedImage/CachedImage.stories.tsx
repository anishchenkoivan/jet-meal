import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CachedImage } from "./CachedImage";
import { MOCK_OK_DATA_URL } from "./cachedImageMocks";

const meta = {
  title: "ui-lib/CachedImage",
  component: CachedImage,
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
          width: 320,
          height: 200,
          resize: "both",
          overflow: "hidden",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CachedImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://picsum.photos/seed/cached1/640/400",
    alt: "Пример фото",
    loading: "eager",
    fetchPriority: "high",
  },
};

export const SlowLoading: Story = {
  args: {
    ...Default.args,
    mockOptions: { kind: "slowOk", delayMs: 2000 },
  },
};

export const MockInlineOk: Story = {
  args: {
    src: "https://example.invalid/will-not-run",
    alt: "Мок без сети",
    mockOptions: { kind: "ok", delayMs: 400 },
  },
};

export const ErrorState: Story = {
  args: {
    src: "https://example.invalid/broken-image",
    alt: "Ошибка",
    mockOptions: { kind: "error", delayMs: 400 },
  },
};

export const WithFallback: Story = {
  args: {
    src: "https://example.invalid/primary",
    fallbackSrc: MOCK_OK_DATA_URL,
    alt: "С запасным",
  },
};

export const FillInBox: Story = {
  args: {
    src: "https://picsum.photos/seed/fillbox/800/600",
    alt: "Fill",
    fill: true,
    loading: "eager",
    fetchPriority: "high",
  },
  render: (args) => (
    <div style={{ position: "relative", width: 400, height: 240 }}>
      <CachedImage {...args} />
    </div>
  ),
};

export const EmptySrc: Story = {
  args: {
    src: "   ",
    alt: "Пусто",
  },
};
