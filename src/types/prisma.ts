import { Post } from '@prisma/client';

export type PostWithCommentsCount = Post & {
  _count: {
    comments: number;
  };
};