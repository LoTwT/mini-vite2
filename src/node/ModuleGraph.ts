import { PartialResolvedId, TransformResult } from "rollup"
import { cleanUrl } from "./utils"
import { Nullable, MayBeUndefined } from "../types/index"

export class ModuleNode {
  // 资源绝对路径
  id: Nullable<string> = null

  importers = new Set<ModuleNode>()

  importedModules = new Set<ModuleNode>()

  transformResult: Nullable<TransformResult> = null

  lastHMRTimestamp = 0

  // 资源访问 url
  constructor(public url: string) {}
}

export class ModuleGraph {
  // 资源 url 到 ModuleNode 的映射表
  urlToModuleMap = new Map<string, ModuleNode>()

  // 资源绝对路径到 ModuleNode 的映射表
  idToModuleMap = new Map<string, ModuleNode>()

  constructor(
    private resolveId: (url: string) => Promise<Nullable<PartialResolvedId>>,
  ) {}

  getModuleById(id: string): MayBeUndefined<ModuleNode> {
    return this.idToModuleMap.get(id)
  }

  async getModuleByUrl(rawUrl: string): Promise<MayBeUndefined<ModuleNode>> {
    const { url } = await this._resolve(rawUrl)
    return this.urlToModuleMap.get(url)
  }

  async ensureEntryFromUrl(rawUrl: string): Promise<ModuleNode> {
    const { url, resolvedId } = await this._resolve(rawUrl)

    // 首先检查缓存
    if (this.urlToModuleMap.has(url)) return this.urlToModuleMap.get(url)!

    // 若无缓存，更新 urlToModuleMap 和 idToModuleMap
    const mod = new ModuleNode(url)
    mod.id = resolvedId
    this.urlToModuleMap.set(url, mod)
    this.idToModuleMap.set(resolvedId, mod)
    return mod
  }

  async updateModuleInfo(
    mod: ModuleNode,
    importedModules: Set<string | ModuleNode>,
  ) {
    const prevImports = mod.importedModules

    for (const curImports of importedModules) {
      const dep =
        typeof curImports === "string"
          ? await this.ensureEntryFromUrl(cleanUrl(curImports))
          : curImports

      if (dep) {
        mod.importedModules.add(dep)
        dep.importers.add(mod)
      }
    }

    // 清除已经不再被引用的依赖
    for (const prevImport of prevImports) {
      if (!importedModules.has(prevImport.url)) prevImport.importers.delete(mod)
    }
  }

  // HMR 触发时会执行这个方法
  invalidateModule(file: string) {
    const mod = this.idToModuleMap.get(file)

    if (mod) {
      // 更新时间戳
      mod.lastHMRTimestamp = Date.now()
      mod.transformResult = null
      mod.importers.forEach((importer) => this.invalidateModule(importer.id!))
    }
  }

  private async _resolve(
    url: string,
  ): Promise<{ url: string; resolvedId: string }> {
    const resolved = await this.resolveId(url)
    const resolvedId = resolved?.id || url
    return { url, resolvedId }
  }
}
