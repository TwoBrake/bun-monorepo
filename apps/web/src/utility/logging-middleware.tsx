// Resources
import { createMiddleware } from "@tanstack/react-start";

const preLogMiddleware = createMiddleware({ type: "function" })
  .client(async (ctx) => {
    const clientTime = new Date();

    return ctx.next({
      context: {
        clientTime,
      },
      sendContext: {
        clientTime,
      },
    });
  })
  .server(async (ctx) => {
    const serverTime = new Date();

    return ctx.next({
      sendContext: {
        durationToServer: serverTime.getTime() - ctx.context.clientTime.getTime(),
        serverTime,
      },
    });
  });

export const logMiddleware = createMiddleware({ type: "function" })
  .middleware([preLogMiddleware])
  .client(async (ctx) => {
    const res = await ctx.next();

    console.log("hello");

    return res;
  });
