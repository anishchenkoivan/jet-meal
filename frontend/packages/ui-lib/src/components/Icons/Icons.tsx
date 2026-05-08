"use client";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function MinusIcon({ size = 16, color = "currentColor", className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill={color} 
      className={className}
    >
      <path d="M2 8h12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function PlusIcon({ size = 16, color = "currentColor", className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill={color} 
      className={className}
    >
      <path d="M8 2v12M2 8h12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function DeleteIcon({ size = 16, color = "currentColor", className }: IconProps) {
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
      <path d="M6 6v4M10 6v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function ShoppingCartIcon({ size = 16, color = "currentColor", className }: IconProps) {
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
      <circle cx="6.5" cy="13.5" r="1" fill={color}/>
      <circle cx="12.5" cy="13.5" r="1" fill={color}/>
    </svg>
  );
}

export function DownIcon({ size = 16, color = "currentColor", className }: IconProps) {
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

export function CloseIcon({ size = 16, color = "currentColor", className }: IconProps) {
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

export function MenuIcon({ size = 16, color = "currentColor", className }: IconProps) {
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

export function StarIcon({ size = 16, color = "currentColor", className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill={color} 
      className={className}
    >
      <path 
        d="M8 0l2.5 5h5l-4 4 1.5 5-5-3-5 3 1.5-5-4-4h5z"
        fill={color}
      />
    </svg>
  );
}

export function LeftIcon({ size = 16, color = "currentColor", className }: IconProps) {
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

export function RightIcon({ size = 16, color = "currentColor", className }: IconProps) {
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