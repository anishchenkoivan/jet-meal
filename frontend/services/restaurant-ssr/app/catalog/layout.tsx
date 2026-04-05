import type { ReactNode } from "react";
import { CatalogPageLayout } from "../../src/containers/CatalogPageLayout/CatalogPageLayout";

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return <CatalogPageLayout>{children}</CatalogPageLayout>;
}
