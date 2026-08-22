# dsh-plugin-approval-alert

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

> DeepSeek Harness 审批提醒插件 · Approval Alert for DeepSeek Harness

当 Harness 需要你审批某个操作时，在**桌面右下角（浏览器外部）**弹出系统级通知，显示**所属工作区名称**，**点击即可跳转到对应工作区**；同时播放提示音，提醒不遗漏。

When DeepSeek Harness needs your approval, this plugin pops a **native OS notification in the bottom-right corner of your desktop** (outside the browser), shows **which workspace** needs attention, and **jumps to that workspace when you click it** — with a chime so you never miss a request.

---

## 功能特性 / Features

- 🔔 **系统级通知（Native notifications）**：显示在屏幕右下角、浏览器窗口之外；即使你切到其他窗口也能看到。
  OS-level toast on the desktop, visible even when you are in another window.
- ✅ **审批 + 选择方案全覆盖（Approval & decision prompts）**：需要审批（approval）或需要你选择方案/回答问题（ask_user_question、方案审阅）时都会弹出通知。
  Notifies on both approval requests and question/plan-choice prompts (ask_user_question, plan review).
- 🏷️ **内容简洁、显示工作区（Concise & workspace-aware）**：直接写明哪个工作区需要审批或选择方案（如 `工作区「E:\sign」需要审批`），不做冗余说明。
  The notification simply names the workspace that needs approval or your input.
- 🌐 **多语言通知（Bilingual by system language）**：跟随系统语言自动切换——简体中文 / 繁体中文 / 英文（其他语言一律英文）。
  Notification language follows the system: Simplified Chinese / Traditional Chinese / English (anything else falls back to English).
- 🖱️ **点击跳转（Click-to-jump）**：点击通知拉回浏览器并跳转到对应工作区/会话；若点击导致浏览器新开窗口/标签页，新页面加载后也会自动打开目标会话。
  Clicking the notification focuses the browser and navigates to the right workspace/session — even when the click opens a brand-new browser window, the fresh page auto-navigates.
- ⏱️ **默认停留时长（OS default duration）**：通知按操作系统的默认停留时间显示并自动收起，因此会播放系统自带的通知动画（Win10/Win11/macOS/Linux 各不相同）。
  Notifications linger for the OS's default duration and auto-dismiss, so the system's own notification animation plays (varies by OS).
- 🔊 **提示音（Chime）**：提醒到达瞬间播放双音上行提示音；首次交互自动解锁音频，规避浏览器自动播放策略，尽可能保证第一声就能听到。
  A two-tone chime plays on arrival; audio is unlocked on the first user gesture so the very first alert is audible.
- 📦 **多会话提醒（Multi-session aware）**：其他会话（如子代理）需要审批/选择方案时同样会弹通知，点击即可跳转。
  Prompts in other sessions (e.g. subagents) also raise notifications; click to jump.
- 🌐 **跨平台（Cross-platform）**：基于 Web Notifications API 与 Web Audio API，兼容 Win10 / Win11 / Linux / macOS（通知外观与动画由操作系统决定）。
  Built on the standard Web Notifications & Web Audio APIs; compatible with Win10 / Win11 / Linux / macOS (toast appearance & animation are OS-controlled).

---

## 工作原理 / How it works

纯浏览器端（Client-only）插件，不触碰审批流水线，对 Harness 零侵入：

- Harness 发起审批时，Web 客户端运行时会把该会话标记为 `pendingInteraction: "approval"`（响应式）。
- 插件在 `shell.overlay`（全屏浮层插槽，加法式、不影响任何现有 UI）注册一个"隐形"观察组件，通过标准的 `useSessions` / `useWorkspaces` 快照监听审批状态。
- 审批到达 → 通过 `sessionIds` 反查所属工作区 → 弹出系统通知 + 播放提示音。
- 点击通知 → 原页面存活时直接 `sessions.open(目标会话)`；否则把目标会话 id 暂存到 `localStorage`，新开的窗口/标签页加载后会等会话列表就绪再自动打开并清除标记。

A pure browser-client plugin with zero interference:

- When Harness raises an approval, the web client runtime marks that session as `pendingInteraction: "approval"` (reactively).
- The plugin registers an invisible watcher in the additive `shell.overlay` slot and observes the standard `useSessions` / `useWorkspaces` snapshots.
- On arrival it resolves the owning workspace via `sessionIds`, shows the OS notification and plays the chime.
- Clicking jumps directly via `sessions.open(sessionId)`; if the click opens a brand-new window, the target session id is staged in `localStorage` and the fresh page auto-navigates once the session list is ready.

---

## 使用说明 / Usage

1. 安装本插件（见下方"安装 / Install"）。
2. **首次使用请点击页面任意位置一次**：插件会在这次交互中自动请求浏览器"通知"权限并解锁音频。
3. 之后每次需要审批/选择方案：桌面右下角弹出通知（显示工作区名，按系统默认时长自动消失，播放系统通知动画）+ 提示音；**点击通知**即跳转到对应工作区。
4. 真正的"允许一次 / 拒绝"决策仍在浏览器内的审批卡片上完成。

Notes:

1. Install the plugin (see below).
2. **Click anywhere in the page once** on first use — the plugin asks for notification permission and unlocks audio on that gesture.
3. Every approval request then raises an OS toast (workspace name, OS default duration) plus a chime; **click the toast to jump** to the workspace.
4. The actual Allow-once / Reject decision stays on the in-browser approval card.

> 提示：若系统未弹出通知，请检查浏览器站点权限中的"通知"是否已允许。
> If no toast appears, check the site's notification permission in the browser.

---

## 安装 / Install

### 方式一：动态插件（当前会话，快速体验）

在 Harness 会话中通过 `cordis_define` / `cordis_run` 加载客户端插件（源码见 `src/client/index.js`），注册到 `shell.overlay` 插槽即可。

### 方式二：npm 安装（推荐，可持久化）

插件已发布到 npm（包名 `dsh-plugin-approval-alert`），一条命令装进你的 profile：

```bash
dsh plugin --profile web add dsh-plugin-approval-alert
```

命令会在 profile 目录执行 pnpm 安装，并自动把声明了 `dsh.bundle` 的插件加入 profile 的 bundles 层。国内网络建议为 npm 配置 npmmirror 镜像（`npm config set registry https://registry.npmmirror.com`），无需 VPN 即可安装；直接 `npm install dsh-plugin-approval-alert` 也可以。

具体接入方式请以官方文档为准：
- [deepseek-ai/deepseek-harness — docs/user/develop/basic/publish.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md)
- [docs/user/develop/basic/index.zh.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/index.zh.md)

---

## 兼容性 / Compatibility

| 平台 | 系统通知 | 提示音 | 备注 |
| --- | --- | --- | --- |
| Windows 10 | ✅ | ✅ | toast 外观/退出动画由系统决定 |
| Windows 11 | ✅ | ✅ | 圆角通知由系统提供 |
| Linux | ✅ | ✅ | 取决于桌面环境的通知服务 |
| macOS | ✅ | ✅ | 系统通知中心呈现 |

浏览器：Chrome / Edge / Firefox / Safari（需支持 Web Notifications 与 Web Audio API）。

---

## 许可 / License

[MIT](./LICENSE)
