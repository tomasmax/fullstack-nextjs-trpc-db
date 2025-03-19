import { Post, User } from '@prisma/client';

export type PostExtended = Post & {
  author: User | null;
  _count: {
    comments: number;
  };
};