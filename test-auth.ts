import { auth } from "./lib/auth";

async function test() {
  console.log(Object.keys(auth.$context.internalAdapter));
}

test();
