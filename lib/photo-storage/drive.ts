// Google Drive storage under DOKUMEN SPARTA/<cabang>/Toko/<folder toko>.
const DRIVE_API = "https://www.googleapis.com/drive/v3/files"
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files"
const FOLDER_MIME = "application/vnd.google-apps.folder"

type DriveFile = { id: string; name: string }

let cachedToken: { value: string; expiresAt: number } | null = null
const folderCache = new Map<string, string>()

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is not set`)
  return value
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requiredEnv("DRIVE_CDN_CLIENT_ID"),
      client_secret: requiredEnv("DRIVE_CDN_CLIENT_SECRET"),
      refresh_token: requiredEnv("DRIVE_CDN_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  })
  if (!response.ok) {
    throw new Error(`Google OAuth request failed (${response.status})`)
  }
  const payload = (await response.json()) as {
    access_token?: string
    expires_in?: number
  }
  if (!payload.access_token) {
    throw new Error("Google OAuth response did not include an access token")
  }
  cachedToken = {
    value: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  }
  return cachedToken.value
}

async function driveFetch(url: string | URL, init: RequestInit = {}) {
  const token = await getAccessToken()
  const response = await fetch(url, {
    ...init,
    headers: { ...init.headers, authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(
      `Drive request failed (${response.status}): ${await response.text()}`
    )
  }
  return response
}

function escapeQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
}

async function listFolders(parentId: string, extraQuery = "") {
  const url = new URL(DRIVE_API)
  url.searchParams.set(
    "q",
    `'${parentId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false${extraQuery}`
  )
  url.searchParams.set("fields", "files(id,name)")
  url.searchParams.set("pageSize", "1000")
  url.searchParams.set("supportsAllDrives", "true")
  url.searchParams.set("includeItemsFromAllDrives", "true")
  const payload = (await (await driveFetch(url)).json()) as {
    files?: DriveFile[]
  }
  return payload.files ?? []
}

async function createFolder(parentId: string, name: string) {
  const url = new URL(DRIVE_API)
  url.searchParams.set("supportsAllDrives", "true")
  url.searchParams.set("fields", "id,name")
  const response = await driveFetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
  })
  return ((await response.json()) as DriveFile).id
}

async function ensureFolder(parentId: string, name: string) {
  const key = `${parentId}/${name}`
  const cached = folderCache.get(key)
  if (cached) return cached
  const [existing] = await listFolders(
    parentId,
    ` and name='${escapeQuery(name)}'`
  )
  const id = existing?.id ?? (await createFolder(parentId, name))
  folderCache.set(key, id)
  return id
}

// Branch names differ from folder names only in case, spaces and underscores
// (CILEUNGSI2 vs CILEUNGSI_2, Head Office vs HEAD OFFICE).
function normalizeName(value: string) {
  return value.toUpperCase().replace(/[\s_-]+/g, "")
}

async function findCityFolder(branch: string) {
  const rootId = requiredEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID")
  const cities = await listFolders(rootId)
  const match = cities.find(
    (city) => normalizeName(city.name) === normalizeName(branch)
  )
  return match?.id ?? createFolder(rootId, branch.toUpperCase())
}

// Store folders are named by another system, e.g. "BELUM DIISI - ABIAN SEKA - Q406"
// or "QZ01-2610-Q703-R - BY PASS SANUR - BELUM DIISI", so the code can sit in any segment.
async function findStoreFolder(tokoId: string, code: string, name: string) {
  const candidates = await listFolders(
    tokoId,
    ` and name contains '${escapeQuery(code)}'`
  )
  const upperCode = code.toUpperCase()
  const match = candidates.find((folder) =>
    folder.name
      .split(" - ")
      .some((part) => part.trim().toUpperCase() === upperCode)
  )
  return (
    match?.id ?? createFolder(tokoId, `${name.toUpperCase()} - ${upperCode}`)
  )
}

export async function resolveDriveFolder(
  store: { code: string; name: string; branch: string },
  path: string[]
) {
  const storeKey = `store:${normalizeName(store.branch)}:${store.code.toUpperCase()}`
  let folderId = folderCache.get(storeKey)
  if (!folderId) {
    const cityId = await findCityFolder(store.branch)
    const tokoId = await ensureFolder(cityId, "Toko")
    folderId = await findStoreFolder(tokoId, store.code, store.name)
    folderCache.set(storeKey, folderId)
  }
  for (const segment of path) {
    folderId = await ensureFolder(folderId, segment)
  }
  return folderId
}

export async function uploadDriveFile(
  folderId: string,
  name: string,
  contentType: string,
  body: Buffer
) {
  const boundary = `sparta-${crypto.randomUUID()}`
  const metadata = JSON.stringify({ name, parents: [folderId] })
  const multipart = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\ncontent-type: ${contentType}\r\n\r\n`
    ),
    body,
    Buffer.from(`\r\n--${boundary}--`),
  ])
  const url = new URL(UPLOAD_API)
  url.searchParams.set("uploadType", "multipart")
  url.searchParams.set("supportsAllDrives", "true")
  url.searchParams.set("fields", "id")
  const response = await driveFetch(url, {
    method: "POST",
    headers: { "content-type": `multipart/related; boundary=${boundary}` },
    body: multipart,
  })
  return ((await response.json()) as { id: string }).id
}

export async function readDriveFile(fileId: string) {
  const url = new URL(`${DRIVE_API}/${encodeURIComponent(fileId)}`)
  url.searchParams.set("alt", "media")
  url.searchParams.set("supportsAllDrives", "true")
  const response = await driveFetch(url)
  return {
    body: response.body,
    contentType: response.headers.get("content-type") ?? "image/jpeg",
  }
}

export async function trashDriveFile(fileId: string) {
  const url = new URL(`${DRIVE_API}/${encodeURIComponent(fileId)}`)
  url.searchParams.set("supportsAllDrives", "true")
  await driveFetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ trashed: true }),
  })
}
