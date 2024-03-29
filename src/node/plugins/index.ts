import { Plugin } from "../plugin"
import { cssPlugin } from "./css"
import { esbuildTransformPlugin } from "./esbuild"
import { importAnalysisPlugin } from "./importAnalysis"
import { resolvePlugin } from "./resolve"
import { assetPlugin } from "./assets"
import { clientInjectPlugin } from "./clientInject"

export function resolvePlugins(): Plugin[] {
  return [
    clientInjectPlugin(),
    resolvePlugin(),
    esbuildTransformPlugin(),
    importAnalysisPlugin(),
    cssPlugin(),
    assetPlugin(),
  ]
}
