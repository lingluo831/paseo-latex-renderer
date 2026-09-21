# paseo-latex-renderer

A high-performance, native LaTeX formula rendering plugin for Paseo Desktop (Windows / Electron), Web, and Mobile.

Designed specifically for researchers and engineers reading mathematics, control theory, robotics, and scientific papers directly in Paseo Agent conversations.

---

## Features

- **Inline Math**: `$E=mc^2$` and `\(E=mc^2\)`
- **Display Math**: `$$\dots$$` and `\[\dots\]`
- **Math Code Blocks**: Fenced blocks with ```` ```math ```` or ```` ```latex ````
- **Complex Environments**: `aligned`, `align`, `cases`, `matrix`, `bmatrix`, `pmatrix`, `\frac`, `\sum`, `\int`, `\partial`, subscripts, superscripts, Greek letters
- **100% Offline & Self-Contained**: All 20 KaTeX WOFF2 fonts are embedded as Base64 data URIs. No external CDN or internet connection required
- **Theme-Adaptive**: Automatically inherits foreground and surface colors across all Paseo light and dark themes
- **Horizontal Scroll Protection**: Wide and multi-line equations scroll smoothly without breaking the chat layout
- **Copy Raw LaTeX**: Clickable copy button on display formulas and click-to-copy on inline formulas
- **Preserves Full Markdown**: Headers, paragraphs, lists, tables, blockquotes, code blocks with syntax tags and copy buttons
- **Edge-Case Hardened**:
  - Currency amounts like `$100` and `$100 and $200` are never mistaken for math
  - Escaped delimiters `\$` remain literal text
  - Inline code spans and programming code blocks (`python`, `ts`, etc.) are left completely verbatim
  - Unclosed formulas during streaming display readable raw text until the closing delimiter arrives
  - Unsupported LaTeX commands fall back gracefully without crashing the chat
- **Zero Daemon Overhead**: Client-only plugin (no unnecessary background daemon subprocess)

---

## Directory Structure

```text
paseo-latex-renderer/
├── paseo-plugin.json      # Paseo manifest (id, requirements, build)
├── package.json           # Dependencies and build/test scripts
├── tsconfig.json          # TypeScript configuration
├── vitest.config.ts       # Vitest unit test configuration
├── index.client.tsx       # Plugin client entrypoint (Transformer & Renderer)
├── client/
│   ├── katex-css.ts       # KaTeX CSS with inlined Base64 WOFF2 fonts
│   ├── math-parser.ts     # Markdown + LaTeX AST tokenizer & syntax detector
│   ├── math-renderer.tsx  # React Native math components
│   ├── markdown-renderer.tsx # Complete Markdown + Math renderer
│   └── web.tsx            # Web/Electron KaTeX DOM bridge & safe mobile fallback
├── scripts/
│   └── inline-fonts.mjs   # Script to inline fonts from KaTeX dist
└── tests/
    ├── latex-renderer.test.ts # 31 unit & integration tests
    └── react-native-mock.ts   # React Native test mocks
```

---

## Quick Start & Installation

### 1. Requirements
- Node.js >= 18
- Paseo >= 0.8.0

### 2. Build & Test
```bash
cd paseo-latex-renderer
npm install
npm run build      # Inlines KaTeX fonts into client/katex-css.ts
npm run typecheck  # Type-check TypeScript codebase
npm run test       # Run 31 unit tests with Vitest
```

### 3. Windows Desktop Installation
To install on the Windows host running Paseo Daemon:
```bash
paseo plugin install "C:\path\to\paseo-latex-renderer"
```
*(Or use the bundled CLI: `C:\ProgramData\paseo\resources\bin\paseo.cmd plugin install <path>`)*

Check status:
```bash
paseo plugin ls
```

If plugins are not yet enabled on the daemon:
1. Ensure `"pluginsEnabled": true` is set in your `~/.paseo/config.json`.
2. Reload daemon configuration:
   ```bash
   paseo reload
   ```
3. The plugin will transition from `disabled` to `running`.

### 4. Remote Ubuntu Daemon Installation
To install on your remote Ubuntu server running Paseo Daemon:
1. Clone or copy `paseo-latex-renderer` to the Ubuntu host (e.g. `/home/user/paseo-latex-renderer`).
2. Install dependencies and build:
   ```bash
   cd /home/user/paseo-latex-renderer
   npm install
   npm run build
   npm run typecheck
   ```
3. Install into the Ubuntu daemon:
   ```bash
   paseo plugin install /home/user/paseo-latex-renderer
   ```
4. Verify:
   ```bash
   paseo plugin ls
   ```
5. When your Windows Paseo Desktop connects to the Ubuntu Daemon, the Windows Desktop automatically receives and executes the client bundle, providing full native LaTeX formula rendering.

---

## Management & Troubleshooting

### Update / Reload Plugin Source
When you make changes to the plugin code:
```bash
npm run typecheck
paseo plugin reload paseo-latex-renderer
```

### Disable / Enable Plugin
```bash
paseo plugin disable paseo-latex-renderer
paseo plugin enable paseo-latex-renderer
```

### Remove Plugin
```bash
paseo plugin remove paseo-latex-renderer
```

### Troubleshooting
- **Plugin status is `disabled`**: Ensure `"pluginsEnabled": true` is set in `~/.paseo/config.json` and run `paseo reload`.
- **Formulas appear as raw text**: Check that the formula delimiters are properly closed (e.g., closing `$` or `$$`). Unclosed formulas intentionally stay as raw text to avoid flickering during streaming.
