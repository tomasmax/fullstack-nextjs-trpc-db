"use client";

import React from "react";
import PostList from "@/components/PostList";
import { trpcReact } from "@/trpc/trpcReact";
import { Typography, Box } from "@mui/material";

export default function Home() {
  // Use the `useInfiniteQuery` hook to fetch posts with pagination
  // https://trpc.io/docs/v10/client/react/useInfiniteQuery
  // https://tanstack.com/query/v4/docs/framework/react/reference/useInfiniteQuery
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = trpcReact.infinitePosts.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      retry: 2,
      retryDelay: 1000,
    }
  );

  if (error) {
    return (
      <main>
        <Typography variant="body1">
          {error.message || "An unexpected error occurred"}
        </Typography>
      </main>
    );
  }

  return (
    <main>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ marginBottom: 4, textAlign: "center" }}
        >
          Posts
        </Typography>

        <PostList
          postsData={data || { pages: [] }}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </Box>
    </main>
  );
}

// SSR/SSG: Server-Side Rendering can improve the first render loading performance, but it's not always necessary
// Benefits include:
// - Better SEO as search engines see fully rendered page
// - Faster Time to First Contentful Paint
// - Consistent rendering regardless of client capabilities

// For a feed page with user-specific content, SSR is appropriate
// For static content that rarely changes, consider SSG with revalidation:
