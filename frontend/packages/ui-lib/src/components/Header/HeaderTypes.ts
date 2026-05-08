export type HeaderSubmenuItem = {
  key: string;
  label: string;
  href: string;
};

export type HeaderTab = {
  key: string;
  label: string;
  href: string;
  submenu?: HeaderSubmenuItem[];
  dividerBefore?: boolean;
};

export type LinkRenderProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};
