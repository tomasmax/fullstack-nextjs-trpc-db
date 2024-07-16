"use client";

import { trpcReact } from "@/trpc/trpcReact";
import { Typography } from "@mui/material";

export default function Home() {
  // example query...
  // const { data } = trpcReact.getPosts.useQuery();

  return (
    <main>
      <Typography variant="h4" component={"h1"}>
        Posts
      </Typography>
    </main>
  );
}
