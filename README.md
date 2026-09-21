# paseo-latex-renderer

Paseo 的高性能原生 LaTeX 公式渲染插件，适用于 Paseo Desktop（Windows / Electron）、Web 和 Mobile。

它专为研究人员和工程师设计，能够在 Paseo Agent 对话中直接阅读数学公式、控制理论、机器人学和科学论文中的复杂表达式。

---

## 项目简介

`paseo-latex-renderer` 是一个用于 Paseo 的插件，用于在聊天内容中优雅地渲染 LaTeX 数学公式。它不仅支持行内公式和块级公式，还能处理多行数学环境、复杂分式、积分、求和、希腊字母等内容，并保持良好的视觉体验与兼容性。

它的核心目标是：

- 在 Paseo 中无缝渲染数学公式
- 不依赖外部 CDN 或在线资源
- 支持多端运行（桌面端 / Web / 移动端）
- 在聊天界面中保持自然排版与稳定交互

---

## 功能特性

- **行内公式**：支持 `$E=mc^2$` 和 `\(E=mc^2\)`
- **块级公式**：支持 `$$\dots$$` 和 `\[\dots\]`
- **数学代码块**：支持 fenced 代码块，��� ```` ```math ```` 和 ```` ```latex ````
- **复杂数学环境**：支持 `aligned`、`align`、`cases`、`matrix`、`bmatrix`、`pmatrix`、`\frac`、`\sum`、`\int`、`\partial`、下标、上标、希腊字母等
- **100% 离线且自包含**：所有 20 个 KaTeX WOFF2 字体都内嵌为 Base64 data URI，不依赖外部 CDN 或互联网连接
- **适配主题**：自动继承 Paseo 浅色/深色主题中的前景色和表面色
- **水平滚动保护**：宽公式和多行公式可平滑滚动，不会破坏聊天布局
- **复制原始 LaTeX**：显示公式支持点击复制按钮，行内公式支持点击复制
- **保留完整 Markdown**：标题、段落、列表、表格、引用块、代码块及语法高亮复制按钮均可正常保留
- **对边界情况做了强化处理**：
  - 例如 `$100` 和 `$100 and $200` 这样的金额不会误判为数学公式
  - `\$` 这样的转义符仍然按原始文本显示
  - 行内代码和编程代码块（如 `python`、`ts` 等）会保持原样，不被错误渲染
  - 流式输出时未闭合公式会保留为原始文本，等到结束符到来后再渲染
  - 不支持的 LaTeX 命令会优雅回退，不会导致聊天崩溃
- **零后台开销**：仅客户端插件，不额外启动后台 daemon 子进程

---

## 目录结构

```text
paseo-latex-renderer/
├── paseo-plugin.json      # Paseo 清单（插件 ID、依赖与构建配置）
├── package.json           # 依赖项和构建/测试脚本
├── tsconfig.json          # TypeScript 配置
├── vitest.config.ts       # Vitest 单元测试配置
├── index.client.tsx       # 插件客户端入口（Transformer & Renderer）
├── client/
│   ├── katex-css.ts       # KaTeX CSS，内嵌 Base64 WOFF2 字体
│   ├── math-parser.ts     # Markdown + LaTeX AST 分词器与语法检测
│   ├── math-renderer.tsx  # React Native 数学组件
│   ├── markdown-renderer.tsx # 完整 Markdown + Math 渲染器
│   └── web.tsx            # Web/Electron KaTeX DOM 桥接与安全移动端 fallback
├── scripts/
│   └── inline-fonts.mjs   # 将 KaTeX 字体内联进 CSS 的脚本
└── tests/
    ├── latex-renderer.test.ts # 31 个单元测试与集成测试
    └── react-native-mock.ts   # React Native 测试 mock
```

---

## 快速开始与安装

### 1. 环境要求

- Node.js >= 18
- Paseo >= 0.8.0

### 2. 安装依赖与构建

```bash
cd paseo-latex-renderer
npm install
npm run build      # 将 KaTeX 字体内联到 client/katex-css.ts
npm run typecheck  # 对 TypeScript 代码进行类型检查
npm run test       # 运行 31 个 Vitest 单元测试
```

### 3. Windows 桌面端安装

在运行 Paseo Daemon 的 Windows 主机上安装插件：

```bash
paseo plugin install "C:\path\to\paseo-latex-renderer"
```

也可以使用打包好的 CLI：

```bash
C:\ProgramData\paseo\resources\bin\paseo.cmd plugin install <path>
```

检查插件状态：

```bash
paseo plugin ls
```

如果 daemon 还没有启用插件：

1. 确认 `~/.paseo/config.json` 中已设置：`"pluginsEnabled": true`
2. 重载 daemon 配置：

```bash
paseo reload
```

3. 插件会从 `disabled` 转变为 `running`

### 4. Ubuntu 远程 daemon 安装

如果你的远程 Ubuntu 服务器运行着 Paseo Daemon，可以按以下步骤安装：

1. 克隆或复制 `paseo-latex-renderer` 到 Ubuntu 主机，例如 `/home/user/paseo-latex-renderer`
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

4. 验证安装：

```bash
paseo plugin ls
```

5. 当你的 Windows Paseo Desktop 连接到 Ubuntu Daemon 时，Windows 桌面端会自动接收并执行客户端包，从而提供完整的原生 LaTeX 公式渲染能力。

---

## 常见操作与故障排除

### 更新 / 重新加载插件源码

在修改插件代码后，可执行：

```bash
npm run typecheck
paseo plugin reload paseo-latex-renderer
```

### 启用 / 禁用插件

```bash
paseo plugin disable paseo-latex-renderer
paseo plugin enable paseo-latex-renderer
```

### 移除插件

```bash
paseo plugin remove paseo-latex-renderer
```

### 疑难问题排查

- **插件状态显示 `disabled`**：确保 `~/.paseo/config.json` 中设置了 `"pluginsEnabled": true`，然后执行 `paseo reload`
- **公式显示为原始文本**：检查公式分隔符是否正确闭合（例如 `$` 或 `$$`）。未闭合公式会保留为原始文本，以避免渲染过程中出现闪烁
- **特定 LaTeX 命令不渲染**：该插件会优雅回退，不会因为不支持命令而崩掉；如需更完整支持，可继续扩展解析规则
- **样式与主题不一致**：插件会自动继承当前主题的 foreground 与 surface 配色，通常无需额外配置

---

## 示例

以下是一些典型用法：

```markdown
$E = mc^2$

\[
\int_0^1 x^2 \, dx = \frac{1}{3}
\]

```math
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
```

```latex
\begin{aligned}
\dot{x} &= Ax + Bu \\
\dot{y} &= Cx + Du
\end{aligned}
```

---

## 适用场景

该插件特别适合以下场景：

- AI/LLM 对话中的数学推导展示
- 科学论文阅读和公式对照
- 控制理论、机器人学、机器学习研究
- 教学场景下的公式讲解
- 工程计算过程中的表达式和结果呈现

---

## 许可证

本项目采用与仓库配置一致的开源许可，如需详细信息，请查看仓库中的 `LICENSE` 文件（如存在）。

---

## 维护说明

如果你希望在 Paseo 中进一步增强此插件的能力，可以重点关注以下几个模块：

- `client/math-parser.ts`：用于识别与解析 LaTeX 语法
- `client/math-renderer.tsx`：用于构建数学公式展示组件
- `client/markdown-renderer.tsx`：用于整合 Markdown 与 LaTeX 的渲染流程
- `client/web.tsx`：负责 Web/Electron 环境下的桥接和兼容

这几个模块是实现公式解析和渲染的核心位置，若你计划二次开发，建议优先阅读它们。

---

## 结语

`paseo-latex-renderer` 致力于让数学表达式在 Paseo 中像自然文本一样容易阅读、无需额外网络依赖、并且在多端环境中保持稳定表现。对于需要在 AI 对话场景中展示公式的用户来说，它是一个非常实用的插件。

如果你在使用过程中遇到问题，建议先检查插件是否处于启用状态，再确认公式分隔符与数学环境语法是否正确。


