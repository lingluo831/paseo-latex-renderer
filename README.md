# paseo-latex-renderer

Paseo 的高性能原生 LaTeX 公式渲染插件，适用于 Paseo Desktop（Windows / Electron）、Web 和 Mobile。

专为研究人员和工程师设计，帮助你在 Paseo Agent 对话中直接阅读数学公式、控制理论、机器人学和科学论文中的复杂表达式。

> English documentation: [README.en.md](README.en.md)

---

## 项目简介

`paseo-latex-renderer` 是一个用于 Paseo 的客户端插件，可以在聊天内容中优雅地渲染 LaTeX 数学公式。

它支持行内公式、块级公式、多行数学环境、复杂分式、积分、求和、希腊字母等内容，同时保持良好的视觉体验和多端兼容性。

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

## 目录结构

```text
paseo-latex-renderer/
├── paseo-plugin.json      # Paseo 清单（插件 ID、依赖和构建配置）
├── package.json           # 依赖项和构建/测试脚本
├── tsconfig.json          # TypeScript 配置
├── vitest.config.ts       # Vitest 单元测试配置
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

## 快速开始与安装

### 环境要求

- Node.js >= 18
- Paseo >= 0.8.0

### 安装依赖、构建和测试

```bash
cd paseo-latex-renderer
npm install
npm run build      # 将 KaTeX 字体内嵌到 client/katex-css.ts
npm run typecheck  # 对 TypeScript 代码进行类型检查
npm run test       # 使用 Vitest 运行 31 个单元测试
```

### Windows 桌面端安装

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

如果 daemon 尚未启用插件：

1. 确认 `~/.paseo/config.json` 中设置了：

   ```json
   {
     "pluginsEnabled": true
   }
   ```

2. 重新加载 daemon 配置：

   ```bash
   paseo reload
   ```

3. 插件状态应从 `disabled` 变为 `running`。

### 远程 Ubuntu Daemon 安装

如果远程 Ubuntu 服务器正在运行 Paseo Daemon，可以按以下步骤安装：

1. 将 `paseo-latex-renderer` 克隆或复制到 Ubuntu 主机，例如 `/home/user/paseo-latex-renderer`。
2. 安装依赖并构建：

   ```bash
   cd /home/user/paseo-latex-renderer
   npm install
   npm run build
   npm run typecheck
   ```

3. 将插件安装到 Ubuntu daemon：

   ```bash
   paseo plugin install /home/user/paseo-latex-renderer
   ```

4. 验证安装：

   ```bash
   paseo plugin ls
   ```

5. 当 Windows Paseo Desktop 连接到 Ubuntu Daemon 时，Windows 桌面端会自动接收并执行客户端包，从而提供原生 LaTeX 公式渲染能力。

## 常见操作与故障排除

### 更新 / 重新加载插件源码

修改插件代码后执行：

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

### 常见问题

- **插件状态显示为 `disabled`**：确认 `~/.paseo/config.json` 中设置了 `"pluginsEnabled": true`，然后执行 `paseo reload`。
- **公式显示为原始文本**：检查公式分隔符是否正确闭合，例如 `$` 或 `$$`。未闭合公式会暂时保留为原始文本，以避免流式输出时闪烁。
- **特定 LaTeX 命令无法渲染**：插件会安全回退，不会因为遇到不支持的命令而崩溃；如需更完整的支持，可以扩展解析规则。
- **主题或样式不一致**：插件会自动继承当前主题的前景色和表面色，通常不需要额外配置。

## 许可证

本项目采用 MIT License 开源。详细条款请参阅仓库根目录中的 `LICENSE` 文件。
