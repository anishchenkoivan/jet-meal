"use client";

import { ApolloProvider as ApolloProviderBase } from "@apollo/client/react";
import type { PropsWithChildren } from "react";
import { apolloClient } from "../../lib/apollo-client";

export function ApolloProvider({ children }: PropsWithChildren) {
  return (
    <ApolloProviderBase client={apolloClient}>
      {/* `as never`: Apollo 4 vs React 19 `ReactNode` mismatch in this monorepo */}
      {children as never}
    </ApolloProviderBase>
  );
}
