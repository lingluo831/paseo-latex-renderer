import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const katexDistDir = path.resolve(rootDir, "node_modules/katex/dist");

if (!fs.existsSync(katexDistDir)) {
  console.error("KaTeX dist directory not found at:", katexDistDir);
  process.exit(1);
}

let css = fs.readFileSync(path.join(katexDistDir, "katex.min.css"), "utf8");

// Inline all woff2 fonts as base64 data URIs
css = css.replace(/url\((fonts\/([^\)]+\.woff2))\)/g, (match, fontPath) => {
  const fullPath = path.join(katexDistDir, fontPath);
  if (fs.existsSync(fullPath)) {
    const data = fs.readFileSync(fullPath).toString("base64");
    return `url("data:font/woff2;base64,${data}")`;
  }
  return match;
});

// Remove unused ttf and woff references to keep bundle size tight
css = css.replace(/,url\([^\)]+\.woff\) format\(["'']woff["'']\)/g, "");
css = css.replace(/,url\([^\)]+\.ttf\) format\(["'']truetype["'']\)/g, "");

// Add custom plugin styles for desktop rendering, scrolling, and theme adaptation
const customCss = `
.katex {
  font-size: 1.05em;
  color: inherit;
  line-height: normal;
  text-rendering: auto;
}
.katex-display {
  margin: 0.5em 0;
  text-align: center;
}
.katex-display-container {
  display: block;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  padding: 8px 4px;
  margin: 8px 0;
  -webkit-overflow-scrolling: touch;
}
.katex-display-container::-webkit-scrollbar {
  height: 6px;
}
.katex-display-container::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.4);
  border-radius: 3px;
}
.katex-display-container::-webkit-scrollbar-track {
  background: transparent;
}
.katex-inline {
  display: inline-block;
  vertical-align: -0.1em;
  padding: 0 1px;
}
.katex-error {
  color: #e06c75;
  font-family: monospace;
  font-size: 0.9em;
}
.paseo-math-block {
  position: relative;
  margin: 6px 0;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}
.paseo-math-block:hover {
  background-color: rgba(128, 128, 128, 0.06);
}
.paseo-copy-math-btn {
  position: absolute;
  top: 4px;
  right: 6px;
  opacity: 0;
  transition: opacity 0.15s ease;
  cursor: pointer;
  padding: 2px 7px;
  font-size: 11px;
  font-family: sans-serif;
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, 0.35);
  background: rgba(128, 128, 128, 0.15);
  color: inherit;
  user-select: none;
}
.paseo-math-block:hover .paseo-copy-math-btn {
  opacity: 0.85;
}
.paseo-copy-math-btn:hover {
  opacity: 1;
  background: rgba(128, 128, 128, 0.25);
}
`;

const fullCss = css + "\n" + customCss;
const tsContent = `// Auto-generated KaTeX CSS with inlined woff2 fonts and plugin layout rules
export const KATEX_CSS = ${JSON.stringify(fullCss)};
`;

const outputPath = path.resolve(rootDir, "client/katex-css.ts");
fs.writeFileSync(outputPath, tsContent, "utf8");
console.log(`Generated ${outputPath} (${tsContent.length} bytes)`);
