import { auth } from "./lib/auth";

async function test() {
  try {
    const ctx = await auth.$context;
    console.log("Keys in ctx:", Object.keys(ctx));
    console.log("Keys in internalAdapter:", Object.keys(ctx.internalAdapter));
  } catch (e) {
    console.error(e);
  }
}
test();
