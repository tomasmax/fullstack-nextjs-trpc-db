import { prismaClient } from "../../prisma/prismaClient";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

const t = initTRPC.create({
  transformer: superjson,
});

export const trpcRouter = t.router({
  getPosts: t.procedure.query(async ({ ctx, input }) => {
    return await prismaClient.post.findMany({
      include: {
        comments: true,
      },
    });
  }),
  // Performance: comments count to have a more efficient query not joining all comments
  infinitePosts: t.procedure
    .input(
      z.object({
        cursor: z.number().nullish(),
        limit: z.number().min(1).max(100).nullish(),
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 10;
      const cursor = input.cursor ? { id: input.cursor } : undefined;

      const posts = await prismaClient.post.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        cursor,
        include: {
          _count: {
            select: { comments: true }
          },
          author: true
        },
        orderBy: {
          id: 'asc',
        },
        where: {
          published: true,
        },
      });

      return {
        posts,
        nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
      };
    }),
  // query comments of a certain post only when needed to reduce data transfer and improve performance
  getCommentsByPostId: t.procedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await prismaClient.comment.findMany({
        where: {
          postId: input.postId,
        },
        orderBy: {
          id: 'asc',
        },
      });
    }),
  addComment: t.procedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prismaClient.comment.create({
        data: {
          content: input.content,
          postId: input.postId,
        },
      });
    }),
});

export type TrpcRouter = typeof trpcRouter;