import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

// Kita mendefinisikan router upload untuk Foto Brand (brandImage) dan Foto Name Plate (nameplateImage)
export const ourFileRouter = {
  brandImage: f(
    {
      image: {
        maxFileSize: "4MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: false }
  ).onUploadComplete(async ({ file }) => {
    console.log("🔥 [UploadThing Callback] brandImage berhasil diunggah:", file.url)
    return { url: file.url }
  }),
  nameplateImage: f(
    {
      image: {
        maxFileSize: "4MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: false }
  ).onUploadComplete(async ({ file }) => {
    console.log("🔥 [UploadThing Callback] nameplateImage berhasil diunggah:", file.url)
    return { url: file.url }
  }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
