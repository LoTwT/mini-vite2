import { NextHandleFunction } from "connect"
import { ServerContext } from ".."
import { cleanUrl, isJSRequest } from "../../utils"
import createDebug from "debug"

const debug = createDebug("dev")

export async function transformRequest(
  url: string,
  serverContext: ServerContext,
) {
  const { pluginContainer } = serverContext
  url = cleanUrl(url)

  // 依次调用插件容器的 resolveId 、load 、transform 方法
  const resolveResult = await pluginContainer.resolveId(url)
  let transformResult

  if (resolveResult?.id) {
    let code = await pluginContainer.load(resolveResult.id)

    if (typeof code === "object" && code !== null) code = code.code

    if (code) {
      transformResult = await pluginContainer.transform(code, resolveResult.id)
    }
  }

  return transformResult
}

export function transformMiddleware(
  serverContext: ServerContext,
): NextHandleFunction {
  return async (req, res, next) => {
    if (req.method !== "GET" || !req.url) return next()

    const url = req.url
    debug("transformMiddleware: %s", url)

    // transform JS request
    if (isJSRequest(url)) {
      // 核心编译函数
      let result = (await transformRequest(url, serverContext)) as any

      if (!result) return next()

      if (result && typeof result !== "string") result = result.code

      // 编译完成，返回响应给浏览器
      res.statusCode = 200
      res.setHeader("Content-Type", "application/javascript")
      return res.end(result)
    }

    next()
  }
}
