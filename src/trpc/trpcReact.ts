import { TrpcRouter } from "@/trpc/trpcRouter";
import { createTRPCReact } from "@trpc/react-query";

export const trpcReact = createTRPCReact<TrpcRouter>();
