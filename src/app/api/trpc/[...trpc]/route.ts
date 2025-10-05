import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/_app";
import { stackServerApp } from "@/stack";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const user = await stackServerApp.getUser({
        tokenStore: "nextjs-cookie",
      });
      return { user };
    },
    // Add development logging
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
    // Log successful requests in development
    responseMeta: () => {
      if (process.env.NODE_ENV === "development") {
        return {
          headers: {
            "Cache-Control": "no-cache",
          },
        };
      }
      return {};
    },
  });

export { handler as GET, handler as POST };
