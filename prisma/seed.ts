import { prismaClient } from "./prismaClient";
import {
  array,
  cyclicalItem,
  incrementalId,
  randomBool,
  randomEmail,
  randomFirstName,
  randomParagraph,
  randomWord,
} from "deverything";

async function main() {
  await prismaClient.user.createMany({
    data: array(100, () => ({
      email: randomEmail({ handleSuffix: incrementalId().toString() }),
      name: randomFirstName(),
    })),
  });
  const users = await prismaClient.user.findMany({ select: { id: true } });

  await prismaClient.post.createMany({
    data: array(1000, (_, index) => ({
      title: randomWord(),
      content: randomParagraph(),
      published: randomBool(),
      authorId: cyclicalItem(users, index).id,
    })),
  });

  const posts = await prismaClient.post.findMany({ select: { id: true } });

  await prismaClient.comment.createMany({
    data: array(10000, (_, index) => ({
      content: randomParagraph(),
      postId: cyclicalItem(posts, index).id,
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
