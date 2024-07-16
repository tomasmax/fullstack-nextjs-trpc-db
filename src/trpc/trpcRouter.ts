import { prismaClient } from "../../prisma/prismaClient";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

const t = initTRPC.create({
  transformer: superjson,
});

export const trpcRouter = t.router({
  // example endpoint...
  getPosts: t.procedure.query(async ({ ctx, input }) => {
    return await prismaClient.post.findMany();
  }),
});

export type TrpcRouter = typeof trpcRouter;
