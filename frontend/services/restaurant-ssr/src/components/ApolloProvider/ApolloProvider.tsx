"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider as ApolloProviderBase } from "@apollo/client/react";
import type { ReactNode } from "react";
import { useMemo } from "react";

function graphqlUri(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/graphql`;
  }
  if (process.env['NEXT_PUBLIC_GRAPHQL_URL']) {
    return process.env['NEXT_PUBLIC_GRAPHQL_URL'];
  }
  const port = process.env['PORT'] ?? "3000";
  return `http://127.0.0.1:${port}/api/graphql`;
}

function createApolloClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: graphqlUri(), fetch }),
  });
}

let browserClient: ApolloClient | undefined;

export function ApolloProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    if (typeof window === "undefined") {
      return createApolloClient();
    }
    browserClient ??= createApolloClient();
    return browserClient;
  }, []);

  return <ApolloProviderBase client={client}>{children}</ApolloProviderBase>;
}
