import { JS_TYPES_RE, HASH_RE, QUERY_RE, CLIENT_PUBLIC_PATH } from "./constants"
import path from "node:path"

export const isJSRequest = (id: string): boolean => {
  id = cleanUrl(id)

  if (JS_TYPES_RE.test(id)) return true

  if (!path.extname(id) && !id.endsWith("/")) return true

  return false
}

export const isCSSRequest = (id: string) => cleanUrl(id).endsWith(".css")

export const isImportRequest = (url: string) => url.endsWith("?import")

const INTERNAL_LIST = [CLIENT_PUBLIC_PATH, "/@react-refresh"]
export const isInternalRequest = (url: string) => INTERNAL_LIST.includes(url)

export const cleanUrl = (url: string) =>
  url.replace(HASH_RE, "").replace(QUERY_RE, "")

export function removeImportQuery(url: string): string {
  return url.replace(/\?import$/, "")
}

export const getShortName = (file: string, root: string) =>
  file.startsWith(root + "/") ? path.posix.relative(root, file) : file
