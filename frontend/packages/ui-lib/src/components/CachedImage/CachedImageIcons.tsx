type IconBoxProps = {
  size?: number;
  className?: string;
  /** Родитель задаёт размер — SVG на 100% площади */
  fillSlot?: boolean;
};

export function CachedImageSpinnerIcon({
  size = 28,
  className,
  fillSlot,
}: IconBoxProps) {
  return (
    <svg
      className={className}
      {...(fillSlot
        ? {
            style: { width: "100%", height: "100%", display: "block" },
            preserveAspectRatio: "xMidYMid meet" as const,
          }
        : { width: size, height: size })}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="42 56"
      />
    </svg>
  );
}

export function CachedImageEmptyIcon({
  size = 28,
  className,
  fillSlot,
}: IconBoxProps) {
  return (
    <svg
      className={className}
      {...(fillSlot
        ? {
            style: { width: "100%", height: "100%", display: "block" },
            preserveAspectRatio: "xMidYMid meet" as const,
          }
        : { width: size, height: size })}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="9" cy="11" r="1.5" fill="currentColor" />
      <path
        d="M14 14l4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CachedImageBrokenIcon({
  size = 28,
  className,
  fillSlot,
}: IconBoxProps) {
  return (
    <svg
      className={className}
      {...(fillSlot
        ? {
            style: { width: "100%", height: "100%", display: "block" },
            preserveAspectRatio: "xMidYMid meet" as const,
          }
        : { width: size, height: size })}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 16l4.5-5 3 3L16 9l4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 5h16v14H4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M8 19L19 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CachedImageRetryIcon({
  size = 18,
  className,
  fillSlot,
}: IconBoxProps) {
  return (
    <svg
      className={className}
      {...(fillSlot
        ? {
            style: { width: "100%", height: "100%", display: "block" },
            preserveAspectRatio: "xMidYMid meet" as const,
          }
        : { width: size, height: size })}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 12a8 8 0 0 1 14.5-4M20 12a8 8 0 0 1-14.5 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M18 5v4h-4M6 19v-4h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
