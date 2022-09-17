import { LoadResult, PartialResolvedId, SourceDescription } from "rollup"
import { ServerContext } from "./server"
import { MayBePromise, Nullable } from "../types"

export type ServerHook = (
  server: ServerContext,
) => (() => void) | void | Promise<(() => void) | void>

// 只实现以下几个钩子
export interface Plugin {
  name: string
  configureServer?: ServerHook
  resolveId?: (
    id: string,
    importer?: string,
  ) => MayBePromise<Nullable<PartialResolvedId>>
  load?: (id: string) => MayBePromise<Nullable<LoadResult>>
  transform?: (
    code: string,
    id: string,
  ) => MayBePromise<Nullable<SourceDescription>>
  transformIndexHtml?: (raw: string) => MayBePromise<string>
}
