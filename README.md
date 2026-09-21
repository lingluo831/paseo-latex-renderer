# paseo-latex-renderer

Paseo 的原生 LaTeX 公式渲染插件，适用于 Paseo Desktop、Web 和 Mobile。

它可以在聊天内容中优雅地渲染数学公式、科学符号与复杂表达式，帮助你直接阅读行内公式、块级公式、矩阵、积分、求和和多行数学环境等内容，适合研究、教学、工程与 AI 对话场景。

> GitHub: https://github.com/lingluo831/paseo-latex-renderer  
> npm: https://www.npmjs.com/package/paseo-latex-renderer

---

## 项目简介

`paseo-latex-renderer` 是一个用于 Paseo 的客户端插件，用于在消息中渲染 LaTeX 数学公式。

它支持：

- 行内公式
- 块级公式
- 多行数学环境
- 分式、积分、求和、下标、上标、希腊字母等
- 复杂矩阵和对齐环境
- 主题自适应渲染
- 大宽度公式的水平滚动保护
- 复制原始 LaTeX
- 离线渲染，无需外部 CDN

---

## 功能特性

- **行内公式**：支持 `$E=mc^2$` 和 `\(E=mc^2\)`
- **块级公式**：支持 `$$...$$` 和 `\[...\]`
- **数学代码块**：支持 ```` ```math ```` 和 ```` ```latex ````
- **复杂数学环境**：支持 `aligned`、`align`、`cases`、`matrix`、`bmatrix`、`pmatrix`、`\frac`、`\sum`、`\int`、`\partial` 等
- **100% 离线且自包含**：KaTeX 字体以 Base64 data URI 内嵌，不依赖外部 CDN
- **主题自适应**：自动继承 Paseo 浅色和深色模式
- **宽公式保护**：超长公式可水平滚动，不破坏聊天布局
- **复制原始 LaTeX**：支持点击复制公式源码
- **Markdown 兼容**：保留标题、段落、列表、表格、引用块等内容
- **边界情况处理**：
  - `$100`、`$100 and $200` 等金额不会被误判为公式
  - `\$` 等转义符会被保留为普通文本
  - 行内代码和 `python`、`ts` 等代码块不会被错误解析
  - 流式输出时，未闭合的公式会先以原始文本显示
  - 不支持的 LaTeX 命令会安全回退，不会导致聊天崩溃

---

## 安装

### 方式一：通过 npm 安装（推荐）

在运行 Paseo Daemon 的主机上执行：

```bash
paseo plugin install npm:paseo-latex-renderer
```

如果你喜欢也可以使用等价的别名命令：

```bash
paseo plugin add npm:paseo-latex-renderer
```

安装后，可以查看插件状态：

```bash
paseo plugin ls
```

如果插件状态为 `running`，说明插件已成功安装并启用。

---

### 方式二：通过 Paseo 图形界面安装

1. 打开 Paseo 客户端；
2. 进入 **Settings → Plugins**；
3. 在 **Plugin source** 中输入：

   ```text
   npm:paseo-latex-renderer
   ```

4. 点击 **Install plugin**；
5. 安装完成后，在插件列表中确认状态为 `running`。

---

### 方式三：通过 GitHub 安装

也可以直接从 GitHub 安装：

```bash
paseo plugin install lingluo831/paseo-latex-renderer
```

或者：

```bash
paseo plugin add lingluo831/paseo-latex-renderer
```

---

## 插件管理

查看已安装插件：

```bash
paseo plugin ls
```

重新加载插件：

```bash
paseo plugin reload paseo-latex-renderer
```

启用插件：

```bash
paseo plugin enable paseo-latex-renderer
```

禁用插件：

```bash
paseo plugin disable paseo-latex-renderer
```

移除插件：

```bash
paseo plugin remove paseo-latex-renderer
```

---

## 开发者说明

下面内容适合需要从源码构建、调试或二次开发的用户。

### 环境要求

- Node.js >= 18
- Paseo >= 0.8.0

### 安装依赖

```bash
cd paseo-latex-renderer
npm install
```

### 构建

```bash
npm run build
```

### 类型检查

```bash
npm run typecheck
```

### 运行测试

```bash
npm run test
```

---

## 常见问题与故障排除

### 1. `paseo` 命令找不到

确认你已经安装了 Paseo，并且当前终端中可访问该命令：

```bash
paseo --version
```

如果命令不可用，请重新打开终端，或确认 Paseo 已正确安装并加入到了 `PATH` 环境变量中。

---

### 2. 插件状态显示为 `disabled`

请先确认 Paseo 已经启用插件系统，然后重新加载配置：

```bash
paseo plugin ls
paseo reload
```

如果插件仍然未生效，可以再次查看插件列表并确认 `paseo-latex-renderer` 是否已成功安装。

---

### 3. 公式显示为原始文本

常见原因是公式分隔符没有闭合，例如：

- `$E = mc^2` 缺少结尾 `$`
- `$$ ... $$` 未正确闭合
- 行内数学与普通文本混用时出现转义问题

建议先检查原始文本是否为：

```text
$E = mc^2$
```

或：

```text
\[
\int_0^1 x^2 \, dx = \frac{1}{3}
\]
```

---

### 4. 某些 LaTeX 命令无法渲染

该插件会优雅回退，不会因为不支持的命令导致聊天崩溃。若某些命令无法渲染，通常是因为：

- 命令未被当前解析规则覆盖
- 语法存在少量缺失或边界问题
- 命令在 KaTeX 支持范围之外

这类情况通常会保留为普通文本，而不是让整个消息失效。

---

### 5. 主题出现样式不一致

插件会尽量自动继承 Paseo 当前的前景色和表面色，因此通常不需要额外配置。若样式异常，建议：

- 检查当前主题是否为浅色或深色模式
- 确认插件已正确启用
- 重载插件后再观察效果

---

### 6. 远程或多端环境问题

如果你在远程环境中使用 Paseo Daemon，请确认：

- Daemon 正在运行
- 目标主机上已安装插件
- 客户端与 Daemon 正在连接正常
- 插件状态可在 `paseo plugin ls` 中看到

---

## 目录结构

```text
paseo-latex-renderer/
├── paseo-plugin.json
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── index.client.tsx
├── client/
│   ├── katex-css.ts
│   ├── math-parser.ts
│   ├── math-renderer.tsx
│   ├── markdown-renderer.tsx
│   └── web.tsx
├── scripts/
│   └── inline-fonts.mjs
├── tests/
│   ├── latex-renderer.test.ts
│   └── react-native-mock.ts
└── README.md
```

---

## 许可证

本项目采用 MIT License 开源。详细条款请参阅仓库根目录中的 `LICENSE` 文件。

---

## 贡献

欢迎提交 Issue 和 Pull Request，帮助改进公式支持、解析边界处理和渲染体验。

如果你发现 LaTeX 语法无法正确渲染，建议附上最小复现用例，并说明预期效果与实际表现。
