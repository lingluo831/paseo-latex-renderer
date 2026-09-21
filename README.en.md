# paseo-latex-renderer

A high-performance, native LaTeX formula rendering plugin for Paseo Desktop (Windows / Electron), Web, and Mobile.

Designed specifically for researchers and engineers reading mathematics, control theory, robotics, and scientific papers directly in Paseo Agent conversations.

## Features

- **Inline Math**: `$E=mc^2$` and `\(E=mc^2\)`
- **Display Math**: `$$\dots$$` and `\[\dots\]`
- **Math Code Blocks**: Fenced blocks with ```` ```math ```` or ```` ```latex ````
- **Complex Environments**: `aligned`, `align`, `cases`, `matrix`, `bmatrix`, `pmatrix`, `\frac`, `\sum`, `\int`, `\partial`, subscripts, superscripts, and Greek letters
- **100% Offline & Self-Contained**: All 20 KaTeX WOFF2 fonts are embedded as Base64 data URIs. No external CDN or internet connection is required
- **Theme-Adaptive**: Automatically inherits foreground and surface colors across Paseo light and dark themes
- **Horizontal Scroll Protection**: Wide and multi-line equations scroll smoothly without breaking the chat layout
- **Copy Raw LaTeX**: Clickable copy buttons for display formulas and click-to-copy support for inline formulas
- **Preserves Full Markdown**: Headers, paragraphs, lists, tables, blockquotes, and code blocks with syntax tags and copy buttons
- **Edge-Case Hardened**:
  - Currency amounts such as `$100` and `$100 and $200` are not mistaken for math
  - Escaped delimiters such as `\$` remain literal text
  - Inline code spans and programming code blocks such as `python` and `ts` are left unchanged
  - Unclosed formulas during streaming remain readable raw text until the closing delimiter arrives
  - Unsupported LaTeX commands fall back gracefully without crashing the chat
- **Zero Daemon Overhead**: Client-only plugin with no unnecessary background daemon subprocess

## Directory Structure

```text
paseo-latex-renderer/
├── paseo-plugin.json      # Paseo manifest (id, requirements, and build configuration)
├── package.json           # Dependencies and build/test scripts
├── tsconfig.json          # TypeScript configuration
├── vitest.config.ts       # Vitest unit test configuration
├── index.client.tsx       # Plugin client entrypoint (Transformer & Renderer)
├── client/
│   ├── katex-css.ts       # KaTeX CSS with inlined Base64 WOFF2 fonts
│   ├── math-parser.ts     # Markdown + LaTeX AST tokenizer and syntax detector
│   ├── math-renderer.tsx  # React Native math components
│   ├── markdown-renderer.tsx # Complete Markdown + Math renderer
│   └── web.tsx            # Web/Electron KaTeX DOM bridge and safe mobile fallback
├── scripts/
│   └── inline-fonts.mjs   # Script to inline fonts from the KaTeX distribution
└── tests/
    ├── latex-renderer.test.ts # 31 unit and integration tests
    └── react-native-mock.ts   # React Native test mocks
```

## Quick Start & Installation

### Requirements

- Node.js >= 18
- Paseo >= 0.8.0

### Build & Test

```bash
cd paseo-latex-renderer
npm install
npm run build      # Inlines KaTeX fonts into client/katex-css.ts
npm run typecheck  # Type-check the TypeScript codebase
npm run test       # Run 31 unit tests with Vitest
```

### Windows Desktop Installation

Install the plugin on the Windows host running Paseo Daemon:

```bash
paseo plugin install "C:\path\to\paseo-latex-renderer"
```

You can also use the bundled CLI:

```bash
C:\ProgramData\paseo\resources\bin\paseo.cmd plugin install <path>
```

Check the plugin status:

```bash
paseo plugin ls
```

If plugins are not yet enabled on the daemon:

1. Ensure `"pluginsEnabled": true` is set in `~/.paseo/config.json`.
2. Reload the daemon configuration:

   ```bash
   paseo reload
   ```

3. The plugin should transition from `disabled` to `running`.

### Remote Ubuntu Daemon Installation

To install the plugin on a remote Ubuntu server running Paseo Daemon:

1. Clone or copy `paseo-latex-renderer` to the Ubuntu host, for example `/home/user/paseo-latex-renderer`.
2. Install dependencies and build:

   ```bash
   cd /home/user/paseo-latex-renderer
   npm install
   npm run build
   npm run typecheck
   ```

3. Install the plugin into the Ubuntu daemon:

   ```bash
   paseo plugin install /home/user/paseo-latex-renderer
   ```

4. Verify the installation:

   ```bash
   paseo plugin ls
   ```

5. When Windows Paseo Desktop connects to the Ubuntu Daemon, the Windows Desktop automatically receives and executes the client bundle, providing native LaTeX formula rendering.

## Management & Troubleshooting

### Update / Reload Plugin Source

After modifying the plugin code:

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

- **Plugin status is `disabled`**: Ensure `"pluginsEnabled": true` is set in `~/.paseo/config.json`, then run `paseo reload`.
- **Formulas appear as raw text**: Check that formula delimiters are properly closed, such as `$` or `$$`. Unclosed formulas intentionally remain raw text to avoid flickering during streaming.
- **Specific LaTeX commands do not render**: The plugin falls back gracefully without crashing. Parsing rules can be extended for broader command support.
- **Theme or style mismatches**: The plugin automatically inherits the current theme's foreground and surface colors, so additional configuration is usually unnecessary.

## Examples

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

## Use Cases

This plugin is especially useful for:

- Mathematical derivations in AI/LLM conversations
- Reading scientific papers and comparing formulas
- Control theory, robotics, and machine learning research
- Formula explanations in teaching scenarios
- Displaying expressions and results in engineering workflows

## License

This project uses the license configured in the repository. For details, see the repository's `LICENSE` file if present.

---

Chinese documentation: [README.md](README.md)
