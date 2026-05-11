"use client";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function MinusIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path d="M2 8h12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path
        d="M8 2v12M2 8h12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DeleteIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path
        d="M3 4h10l-1 8H4L3 4zm2-1h6v-1a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v1z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M6 6v4M10 6v4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ShoppingCartIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path
        d="M2 2h2l.4 2M6 2h8l-1 7H6L4 2H2"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="13.5" r="1" fill={color} />
      <circle cx="12.5" cy="13.5" r="1" fill={color} />
    </svg>
  );
}

export function DownIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path
        d="M2 4h12M2 8h12M2 12h12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path d="M8 0l2.5 5h5l-4 4 1.5 5-5-3-5 3 1.5-5-4-4h5z" fill={color} />
    </svg>
  );
}

export function LeftIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path
        d="M10 4l-4 4 4 4"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RightIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Лупа — поиск в фильтрах каталога */
export function SearchIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle
        cx="7"
        cy="7"
        r="4.25"
        stroke={color}
        strokeWidth="1.75"
      />
      <path
        d="M10 10l3.5 3.5"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Хэштег — теги в фильтрах */
export function HashtagIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M6 3L4 13M12 3l-2 10M3 6h10M2 10h10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Часы — время доставки */
export function ClockIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle
        cx="8"
        cy="8"
        r="5.75"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M8 5.25V8l2.25 1.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ресторан / заведение — поиск по ресторану */
export function StorefrontIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M3 6.5h10v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M2 6.5l1.5-3h9L14 6.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10h4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Город / локация */
export function MapPinIcon({
  size = 16,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M8 14s4-3.25 4-7a4 4 0 1 0-8 0c0 3.75 4 7 4 7z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="7" r="1.35" fill={color} />
    </svg>
  );
}
