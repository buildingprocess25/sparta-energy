import { auth } from "./lib/auth";
import { setSessionCookie } from "better-auth/cookies";

async function test() {
  const ctx = await auth.$context;
  const users = await ctx.internalAdapter.listUsers();
  const user = users[0];
  const session = await ctx.internalAdapter.createSession(user.id);
  
  // Create a mock generic endpoint context
  const mockCtx = {
    context: ctx,
    responseHeaders: new Headers(),
    setSignedCookie: async (name, value, secret, options) => {
      const { serializeSignedCookie } = require("better-call");
      const signed = await serializeSignedCookie(name, value, secret, options);
      mockCtx.responseHeaders.append("Set-Cookie", signed);
    },
    getSignedCookie: async (name, secret) => null,
    setCookie: async (name, value, options) => {
      const { serializeCookie } = require("better-call");
      mockCtx.responseHeaders.append("Set-Cookie", serializeCookie(name, value, options));
    }
  };

  await setSessionCookie(mockCtx, { session, user });
  console.log("Set-Cookie header from better-auth:");
  console.log(mockCtx.responseHeaders.get("Set-Cookie"));
}
test();
