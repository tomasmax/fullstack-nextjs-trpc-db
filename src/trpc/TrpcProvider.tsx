"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, getFetch, loggerLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { trpcReact } from "@/trpc/trpcReact";

export const TrpcProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            retry: false,
            retryOnMount: false,
            // cacheTime: 0, // avoid caching between resource views (possibly having different fields)
            // staleTime: 5000,
          },
        },
      })
  );

  const url = "/api/trpc";

  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [
        loggerLink({
          enabled: () => true,
        }),
        httpBatchLink({
          url,
          fetch: async (input, init?) => {
            const fetch = getFetch();
            return fetch(input, {
              ...init,
              credentials: "include",
            });
          },
        }),
      ],
      transformer: superjson,
    })
  );
  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcReact.Provider>
  );
};
