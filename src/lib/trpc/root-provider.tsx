/** biome-ignore-all lint/style/noMagicNumbers: false positive for shared cache timings and reconnect intervals */
import { QueryCache, QueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { createIsomorphicFn, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
} from "@trpc/client";
import type { TRPCCombinedDataTransformer } from "@trpc/server";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson, { SuperJSON } from "superjson";

import { TRPCProvider } from "@/lib/trpc/react";
import type { TRPCRouter } from "@/server/router";

declare module "@tanstack/react-query" {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: module augmentation must use interface
  interface Register {
    defaultError: Error;
    mutationMeta: Record<string, unknown> & {
      errorMessage?: string;
      invalidatesQuery?: QueryKey[];
      successMessage?: string;
      toastOnError?: boolean;
      toastOnSuccess?: boolean;
    };
  }
}

export const transformer: TRPCCombinedDataTransformer = {
  input: {
    serialize: (obj) => {
      if (isNonJsonSerializable(obj)) {
        return obj;
      }
      return SuperJSON.serialize(obj);
    },
    deserialize: (obj) => {
      if (isNonJsonSerializable(obj)) {
        return obj;
      }
      return SuperJSON.deserialize(obj);
    },
  },
  output: SuperJSON,
};

const getRequestHeaders = createServerFn({ method: "GET" }).handler(() => {
  const request = getRequest();
  const headers = new Headers(request?.headers);

  return Object.fromEntries(headers);
});

const headers = createIsomorphicFn()
  .client(() => ({}))
  .server(() => getRequestHeaders());

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") {
      return "";
    }
    return `http://localhost:${process.env.PORT ?? 3000}`;
  })();
  return `${base}/api/trpc`;
}

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url: getUrl(),
        transformer,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
        headers,
      }),
      false: httpBatchLink({
        url: getUrl(),
        transformer,
        headers,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    }),
  ],
});

let browserQueryClient: QueryClient | undefined;

export const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
    queryCache: new QueryCache(),
  });

  return queryClient;
};

export const getQueryClient = createIsomorphicFn()
  .server(() => createQueryClient())
  .client(() => {
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient();
    }

    return browserQueryClient;
  });

export const createServerHelpers = ({ queryClient }: { queryClient: QueryClient }) => {
  const serverHelpers = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient,
  });
  return serverHelpers;
};

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
      {children}
    </TRPCProvider>
  );
}
