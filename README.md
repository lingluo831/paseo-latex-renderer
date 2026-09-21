# paseo-latex-renderer

Paseo 的高性能原生 LaTeX 公式渲染插件，适用于 Paseo Desktop（Windows / Electron）、Web 和 Mobile。

专为研究人员和工程师设计，帮助你在 Paseo Agent 对话中直接阅读数学公式、控制理论、机器人学和科学论文中的复杂表达式。

> English documentation: [README.en.md](README.en.md)

---

## 项目简介

`paseo-latex-renderer` 是一个用于 Paseo 的客户端插件，可以在聊天内容中优雅地渲染 LaTeX 数学公式。

它支持行内公式、块级公式、多行数学环境、复杂分式、积分、求和、希腊字母等内容，同时保持良好的视觉体验和多端兼容性。

## 快速安装（推荐）

> 面向普通用户：你**不需要**先克隆源码，也**不需要**先执行 `npm install`。

- npm 包主页：<https://www.npmjs.com/package/paseo-latex-renderer>
- GitHub 仓库：<https://github.com/lingluo831/paseo-latex-renderer>

### 方式 1：从 npm 安装（推荐）

```bash
paseo plugin add npm:paseo-latex-renderer
```

### 方式 2：从 GitHub 安装

```bash
paseo plugin add lingluo831/paseo-latex-renderer
```

### 方式 3：Paseo 图形界面安装

1. 打开 Paseo 客户端
2. 进入 **Settings → Plugins**
3. 在 **Plugin source** 输入：`npm:paseo-latex-renderer`（或 `lingluo831/paseo-latex-renderer`）
4. 点击 **Install plugin**
5. 安装完成后重启 Paseo

### 安装后验证

优先使用仓库中已验证的命令：

```bash
paseo plugin ls
```

你应看到 `paseo-latex-renderer`，且状态为 `running`。

如果状态是 `disabled`，请先执行：

```bash
paseo reload
```

并确认 `~/.paseo/config.json` 启用了插件：

```json
{
  "pluginsEnabled": true
}
```

## 功能特性

- **行内公式**：支持 `$E=mc^2$` 和 `\(E=mc^2\)`
- **块级公式**：支持 `$$\dots$$` 和 `\[\dots\]`
- **数学代码块**：支持 ```` ```math ```` 和 ```` ```latex ````
- **复杂数学环境**：支持 `aligned`、`align`、`cases`、`matrix`、`bmatrix`、`pmatrix`、`\frac`、`\sum`、`\int`、`\partial`、下标、上标和希腊字母等
- **100% 离线且自包含**：20 个 KaTeX WOFF2 字体均以 Base64 data URI 的形式内嵌，不依赖外部 CDN 或互联网连接
- **自动适配主题**：自动继承 Paseo 浅色和深色主题的前景色与表面色
- **水平滚动保护**：宽公式和多行公式可以平滑滚动，不会破坏聊天布局
- **复制原始 LaTeX**：显示公式支持点击复制，行内公式支持点击复制
- **保留完整 Markdown**：保留标题、段落、列表、表格、引用块以及带语法标签和复制按钮的代码块
- **强化边界情况处理**：
  - `$100`、`$100 and $200` 等金额不会被误判为数学公式
  - `\$` 等转义分隔符会保持为普通文本
  - 行内代码和 `python`、`ts` 等编程代码块不会被错误解析
  - 流式输出时，未闭合的公式会先以可读的原始文本显示
  - 不支持的 LaTeX 命令会优雅回退，不会导致聊天崩溃
- **零后台开销**：仅使用客户端插件，不额外启动后台 daemon 子进程

## Markdown 与公式写法示例

````markdown
行内公式：$E = mc^2$

块级公式：
\[
\int_0^1 x^2 \, dx = \frac{1}{3}
\]

math 代码块：
```math
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
```

latex 代码块：
```latex
\begin{aligned}
\dot{x} &= Ax + Bu \\
\dot{y} &= Cx + Du
\end{aligned}
```
````

边界行为说明：

- **公式未闭合**：例如只输入了一个起始 `$`，会先按普通文本显示，避免流式输出时闪烁
- **金额文本**：`$100`、`$100 and $200` 这类金额不会被当作数学公式
- **转义美元符号**：`\$` 保持美元符号文本含义，不触发公式解析

## 常见操作与故障排查

### 常见操作（开发与调试）

```bash
paseo plugin disable paseo-latex-renderer
paseo plugin enable paseo-latex-renderer
paseo plugin reload paseo-latex-renderer
paseo plugin remove paseo-latex-renderer
```

### 故障排查清单

1. **命令找不到（如 `paseo: command not found`）**
   - 确认 Paseo CLI 已正确安装并在 PATH 中
   - 在 Windows 可尝试使用打包 CLI：
     ```bash
     C:\ProgramData\paseo\resources\bin\paseo.cmd plugin ls
     ```

2. **插件状态是 `disabled`**
   - 检查 `~/.paseo/config.json`：`"pluginsEnabled": true`
   - 执行 `paseo reload`
   - 再次执行 `paseo plugin ls` 确认状态变为 `running`

3. **公式显示为原始文本**
   - 先检查公式分隔符是否闭合（`$...$`、`$$...$$`、`\(...\)`、`\[...\]`）
   - 确认消息内容不是代码块/行内代码（代码区域不会被当作公式）
   - 未闭合公式在流式输出期间显示原文属于预期保护行为

4. **某些命令在你的环境不可用**
   - 不同版本文档可能写法不同，建议优先使用本仓库已验证命令：`paseo plugin ls`、`paseo reload`

5. **远程 daemon 场景（Windows Desktop 连接 Ubuntu）**
   - 在远程 Ubuntu 上安装并启用插件后，Windows 端连接该 daemon 才会生效
   - 在 Ubuntu 上执行 `paseo plugin ls` 确认 `running`

6. **主题/样式显示不理想**
   - 插件会继承 Paseo 当前主题的前景色与表面色
   - 若显示异常，先切换主题并重启 Paseo，再复测同一公式

## 给开发者：源码构建、测试与本地安装

> 仅在你需要二次开发、调试或贡献代码时使用本节。

### 环境要求

- Node.js >= 18
- Paseo >= 0.8.0

### 克隆后安装依赖、构建与测试

```bash
cd paseo-latex-renderer
npm install
npm run build      # 将 KaTeX 字体内嵌到 client/katex-css.ts
npm run typecheck  # 对 TypeScript 代码进行类型检查
npm run test       # 使用 Vitest 运行 31 个单元测试
```

### Windows 本地源码安装

在运行 Paseo Daemon 的 Windows 主机上安装插件：

```bash
paseo plugin install "C:\path\to\paseo-latex-renderer"
```

也可以使用打包好的 CLI：

```bash
C:\ProgramData\paseo\resources\bin\paseo.cmd plugin install <path>
```

### 远程 Ubuntu Daemon 源码安装

1. 将 `paseo-latex-renderer` 克隆或复制到 Ubuntu 主机，例如 `/home/user/paseo-latex-renderer`
2. 安装依赖并构建：

   ```bash
   cd /home/user/paseo-latex-renderer
   npm install
   npm run build
   npm run typecheck
   ```

3. 安装到 Ubuntu daemon：

   ```bash
   paseo plugin install /home/user/paseo-latex-renderer
   ```

4. 验证状态：

   ```bash
   paseo plugin ls
   ```

5. 当 Windows Paseo Desktop 连接到 Ubuntu Daemon 时，Windows 桌面端会自动接收并执行客户端包，从而提供原生 LaTeX 公式渲染能力

## 目录结构

```text
paseo-latex-renderer/
├── paseo-plugin.json      # Paseo 清单（插件 ID、依赖和构建配置）
├── package.json           # 依赖项和构建/测试脚本
├── tsconfig.json          # TypeScript 配置
├── vitest.config.mjs      # Vitest 单元测试配置
├── index.client.tsx       # 插件客户端入口（Transformer 和 Renderer）
├── client/
│   ├── katex-css.ts       # 内嵌 Base64 WOFF2 字体的 KaTeX CSS
│   ├── math-parser.ts     # Markdown + LaTeX AST 分词器和语法检测器
│   ├── math-renderer.tsx  # React Native 数学组件
│   ├── markdown-renderer.tsx # 完整 Markdown + Math 渲染器
│   └── web.tsx            # Web/Electron KaTeX DOM 桥接和移动端安全回退
├── scripts/
│   └── inline-fonts.mjs   # 将 KaTeX 字体内嵌到 CSS 的脚本
└── tests/
    ├── latex-renderer.test.ts # 31 个单元测试和集成测试
    └── react-native-mock.ts   # React Native 测试 mock
```

## 适用场景

该插件特别适合以下场景：

- AI/LLM 对话中的数学推导展示
- 科学论文阅读和公式对照
- 控制理论、机器人学和机器学习研究
- 教学场景中的公式讲解
- 工程计算过程中的表达式和结果展示

## 许可证

本项目采用仓库中配置的开源许可证。详细信息请查看仓库中的 `LICENSE` 文件。
