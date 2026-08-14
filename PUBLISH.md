# 发布手册（GitHub 版）/ Publishing Playbook (GitHub-first)

> 本手册假设你**只有 GitHub 账号**：插件以公开 GitHub 仓库形式发布，社区目录按 `dsh-plugin`
> 话题自动收录，用户通过 `npm install github:<你>/dsh-plugin-approval-alert` 或仓库直达安装。
> 最后附"可选：再发布到 npm"小节（需要免费注册一个 npm 账号）。

当前状态：本地包已就绪，且你已经在 `E:\sign\dsh-plugin-approval-alert` 里执行过
`git init` 并暂存了文件。下面从"提交本地改动"继续。

---

## 第 0 步：提交本地改动（你已完成一半）

```bash
cd E:\sign\dsh-plugin-approval-alert

# 把最新同步的文件重新加入暂存（README / 客户端源码最近更新过）
git add README.md src/client/index.js package.json LICENSE

# 提交
git commit -m "feat: approval & question alerts with native notifications, workspace-aware click-to-jump, bilingual"

# 查看当前状态（应显示 working tree clean）
git status
```

> 提交前可以顺手把 `package.json` 里的 `repository.url` 占位符改成真实仓库地址
> （建好仓库后执行，见第 2 步末尾）。

---

## 第 1 步：在 GitHub 创建公开仓库

1. 打开 https://github.com/new
2. 按下面配置填写（**关键项**）：
   - **Repository name**：`dsh-plugin-approval-alert`（与包名一致，最好同名）
   - **Description**（一句话简介，直接抄 README 第一段）：
     `DeepSeek Harness 审批/选择方案系统级通知提醒，显示工作区名、点击跳转、多语言。Approval & decision alerts with native notifications for DeepSeek Harness.`
   - **Visibility**：选择 **Public**（公开，否则社区无法收录、别人无法安装）
   - **Add a README file**：**不要勾选**（本地已有 README，勾了推送时会冲突）
   - **Add .gitignore**：选 **Node**（可选；本地没有 .gitignore，加上更规范）
   - **Choose a license**：选 **MIT License**（本地 `LICENSE` 就是 MIT，保持一致；如果建空仓库此项可不选，本地 LICENSE 会一并推上去）
   - **Private/Public 确认无误后**，点 **Create repository**
3. 创建后会显示一个空仓库（只有你选的 .gitignore/LICENSE）。不要在此页面新建任何文件。

> 你问的"选什么协议"：**MIT**。它是宽松开源许可，允许任何人自由使用/修改/再分发（署名保留），
> 也是 dsh 社区插件的常见选择，与本地 `LICENSE` 文件一致。

---

## 第 2 步：把本地仓库推送上去

在本地包目录执行（把 `<你的GitHub用户名>` 换成真实用户名）：

```bash
cd E:\sign\dsh-plugin-approval-alert

# 关联远程仓库（在仓库主页 Code 按钮里也能复制地址，用 HTTPS 即可）
git remote add origin https://github.com/<你的GitHub用户名>/dsh-plugin-approval-alert.git

# 推送
git branch -M main
git push -u origin main
```

推送成功后可做两件小事：
- 把 `package.json` 的 `repository.url` 改成真实地址，再次 `git add package.json && git commit && git push`。
- 检查 GitHub 仓库页面：LICENSE、README、源码是否都显示正常。

---

## 第 3 步：给仓库打话题（topic）——社区收录的关键

1. 打开你的仓库主页 → 右侧 **About** 区域点 **⚙️（齿轮）** 或 **Edit repository details**
2. 在 **Topics** 里添加（回车逐个添加）：
   - `dsh-plugin`（**必加**：Oh-My-DSH 等聚合目录按此话题自动同步）
   - `deepseek-harness`
   - `approval`
   - `notification`
   - 可选：`dsh`、`agent`
3. 点 **Save changes**

---

## 第 4 步：收录进社区目录（各一个 PR）

### 4.1 awesome-dsh-plugin（精选列表）
1. 打开 https://github.com/awesome-dsh-plugin/awesome-dsh-plugin → 点 **Fork**
2. 在自己 Fork 的仓库里编辑 `README.md`（或列表文件），按现有条目格式加一行：
   `- [dsh-plugin-approval-alert](https://github.com/<你的用户名>/dsh-plugin-approval-alert) - 审批/选择方案系统级通知提醒，显示工作区、点击跳转、多语言。`
3. 提交到新分支 → 回原仓库点 **Contribute → Open pull request**，描述写"Add dsh-plugin-approval-alert"，创建 PR。

### 4.2 dsh-market（可视化插件市场）
1. 打开 https://github.com/dsh-market/dsh-market → 读它的 README（看提交方式，通常是往某个列表文件加你的仓库/包名）
2. 同样 Fork → 加条目 → 提 PR。

### 4.3 Oh-My-DSH（聚合目录）
- **无需手动操作**：它每 8 小时自动同步 GitHub `dsh-plugin` 话题，第 3 步打完话题即可。

### 4.4 awesome-deepseek-harness（生态清单，可选）
- https://github.com/0xsline/awesome-deepseek-harness ，同 4.1 的 Fork + PR 流程。

---

## 第 5 步：用户如何安装你的插件（README 里已说明）

- 从 GitHub 直接安装（无需 npm 账号）：
  ```bash
  npm install github:<你的GitHub用户名>/dsh-plugin-approval-alert
  # 或
  npm install https://github.com/<你的GitHub用户名>/dsh-plugin-approval-alert.git
  ```
- 然后按官方文档把插件接入 harness 的 `cordis.yml`：
  - https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md
  - https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/index.zh.md

---

## 第 6 步（可选）：再发布到 npm，扩大分发

npm 账号免费：https://www.npmjs.com/signup （约 1 分钟）。之后：

```bash
cd E:\sign\dsh-plugin-approval-alert
npm login
npm publish --access public
```

发布后 npm 包名 `dsh-plugin-approval-alert` 与 GitHub 仓库并行，用户两种方式都能装。
如果暂时不想注册 npm，跳过本步即可，GitHub 发布已经完全够用。

---

## 发布后自检 / Post-publish checklist

- [ ] 仓库是 **Public**，主页能看到 README 渲染、LICENSE（MIT）、`src/client/index.js`
- [ ] 已打 `dsh-plugin` 话题（可在仓库首页 About 区域看到 Topics）
- [ ] `package.json` 的 `repository.url` 是真实仓库地址
- [ ] 干净环境验证安装：`npm install github:<你>/dsh-plugin-approval-alert` 能成功
- [ ] 接入 harness 后触发一次审批/选择方案：右下角系统通知（含工作区名、按系统默认时长自然收起并播放系统动画）→ 点击跳转 → 提示音
- [ ] awesome-dsh-plugin / dsh-market 的 PR 已提交（等待合并）

---

## 常见问题 / FAQ

- **Q：创建仓库时选了什么协议？** A：**MIT**（与本地 LICENSE 一致；若建空仓库推送，本地 MIT LICENSE 会一起推上去）。
- **Q：推送时报 "remote origin already exists"？** A：说明之前已加过 remote，执行 `git remote set-url origin https://github.com/<你>/dsh-plugin-approval-alert.git` 再 push。
- **Q：推送被拒 "failed to push some refs"？** A：多半是仓库里被初始化了 README/LICENSE，与本地冲突。执行 `git pull --rebase origin main` 合并后再 `git push`。
- **Q：忘了打话题能补吗？** A：能，仓库 About → 齿轮随时可补。
