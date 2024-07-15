import {
  FetchCreateContextFnOptions,
  fetchRequestHandler,
} from "@trpc/server/adapters/fetch";
import { trpcRouter } from "../../../../trpc/trpcRouter";

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: trpcRouter,
    createContext: function (
      opts: FetchCreateContextFnOptions
    ): object | Promise<object> {
      return {};
    },
  });
};

export { handler as GET, handler as POST };
