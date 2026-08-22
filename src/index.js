/**
 * dsh-plugin-approval-alert — Node half (server-side face)
 * ==========================================================
 * 这个文件是插件包的服务端半边，作用是让 profile 组合能挂载本插件行：
 * web loader 必须激活组合里的每一行，而 client-modules 服务只把"纤维
 * 处于活跃状态"的条目纳入浏览器 bundle 图（window.__DSH_BOOT__）。
 *
 * 本插件是纯浏览器端插件：全部行为都在浏览器半边
 * （src/client/index.js，构建产物为 lib/client.js，经 exports["./client"]
 * 提供给浏览器），服务端半边故意不做任何事。
 */

export const name = 'approval-alert';

/** 服务端半边为 no-op：不提供任何服务、不注册任何行为。 */
export function apply() {
  // Intentionally empty — this is a pure browser client plugin.
}
