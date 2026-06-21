import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "./core"

export const runtime = "nodejs"

// Route handler untuk menangani request GET/POST dari client UploadThing
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})
