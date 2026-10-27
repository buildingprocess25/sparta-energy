import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

// Demo stores keep photos on this machine instead of Google Drive.
const BASE_DIR = path.join(process.cwd(), ".local-uploads", "energy-audit")

function resolveInside(ref: string) {
  const fullPath = path.resolve(BASE_DIR, ref)
  if (!fullPath.startsWith(BASE_DIR + path.sep)) {
    throw new Error("Photo path is outside the upload folder")
  }
  return fullPath
}

export async function saveLocalFile(ref: string, body: Buffer) {
  const fullPath = resolveInside(ref)
  await mkdir(path.dirname(fullPath), { recursive: true })
  await writeFile(fullPath, body)
}

export async function readLocalFile(ref: string) {
  return readFile(resolveInside(ref))
}

export async function deleteLocalFile(ref: string) {
  await rm(resolveInside(ref), { force: true })
}
