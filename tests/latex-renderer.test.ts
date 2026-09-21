import { describe, expect, it } from "vitest";
import {
  containsMathSyntax,
  parseMarkdownWithMath,
  type MathToken,
} from "../client/math-parser";
import { renderKaTeXHtml } from "../client/web";
import { KATEX_CSS } from "../client/katex-css";

describe("Paseo LaTeX Renderer Plugin", () => {
  describe("1. Math Syntax Detection (containsMathSyntax)", () => {
    it("detects inline math with dollar delimiter", () => {
      expect(containsMathSyntax("Energy is $E=mc^2$")).toBe(true);
    });

    it("detects inline math with parenthesis delimiter", () => {
      expect(containsMathSyntax("Value \\(x = 1\\)")).toBe(true);
    });

    it("detects display math with double dollar delimiter", () => {
      expect(containsMathSyntax("$$\\int_0^1 f(x) dx$$")).toBe(true);
    });

    it("detects display math with bracket delimiter", () => {
      expect(containsMathSyntax("\\[\\sum_{i=1}^n i\\]")).toBe(true);
    });

    it("detects math code blocks", () => {
      expect(containsMathSyntax("```math\nJ\\ddot{\\theta}=\\tau\n```")).toBe(true);
      expect(containsMathSyntax("```latex\nE=mc^2\n```")).toBe(true);
    });

    it("does not false-positive on plain text without math", () => {
      expect(containsMathSyntax("Hello, this is a plain message.")).toBe(false);
      expect(containsMathSyntax("Just checking code: if (a && b) return;")).toBe(false);
    });
  });

  describe("2. Inline Math Parsing", () => {
    it("correctly parses $E=mc^2$ as inlineMath", () => {
      const tokens = parseMarkdownWithMath("The equation is $E=mc^2$ in physics.");
      const p = tokens[0] as { tokens: Array<{ type: string; text?: string }> };
      const math = p.tokens.find((t) => t.type === "inlineMath") as unknown as MathToken;
      expect(math).toBeDefined();
      expect(math.text).toBe("E=mc^2");
      expect(math.display).toBe(false);
    });

    it("correctly parses \\(a^2 + b^2 = c^2\\) as inlineMath", () => {
      const tokens = parseMarkdownWithMath("Pythagoras: \\(a^2 + b^2 = c^2\\).");
      const p = tokens[0] as { tokens: Array<{ type: string; text?: string }> };
      const math = p.tokens.find((t) => t.type === "inlineMath") as unknown as MathToken;
      expect(math).toBeDefined();
      expect(math.text).toBe("a^2 + b^2 = c^2");
      expect(math.display).toBe(false);
    });

    it("preserves underscores and control parameters without Markdown italic mangling", () => {
      const tokens = parseMarkdownWithMath("Observation: $J\\ddot{\\theta}_m + B\\dot{\\theta}_m = \\tau_m$.");
      const p = tokens[0] as { tokens: Array<{ type: string; text?: string }> };
      const math = p.tokens.find((t) => t.type === "inlineMath") as unknown as MathToken;
      expect(math).toBeDefined();
      expect(math.text).toBe("J\\ddot{\\theta}_m + B\\dot{\\theta}_m = \\tau_m");
      // Check that no italic token was created from the underscores
      const em = p.tokens.find((t) => t.type === "em");
      expect(em).toBeUndefined();
    });
  });

  describe("3. Display Math Parsing", () => {
    it("correctly parses $$...$$ as blockMath", () => {
      const markdown = `
Here is the system dynamic equation:

$$
J\\ddot{\\theta}+B\\dot{\\theta}+\\tau_f=\\tau_m-\\tau_L
$$

Next paragraph.
      `.trim();
      const tokens = parseMarkdownWithMath(markdown);
      const math = tokens.find((t) => t.type === "blockMath") as unknown as MathToken;
      expect(math).toBeDefined();
      expect(math.text).toBe("J\\ddot{\\theta}+B\\dot{\\theta}+\\tau_f=\\tau_m-\\tau_L");
      expect(math.display).toBe(true);
    });

    it("correctly parses \\[...\\] as blockMath", () => {
      const markdown = "Formula:\n\n\\[\n\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}\n\\]\n";
      const tokens = parseMarkdownWithMath(markdown);
      const math = tokens.find((t) => t.type === "blockMath") as unknown as MathToken;
      expect(math).toBeDefined();
      expect(math.text).toContain("\\frac{\\sqrt{\\pi}}{2}");
      expect(math.display).toBe(true);
    });
  });

  describe("4. Math Code Blocks", () => {
    it("converts ```math blocks to blockMath tokens", () => {
      const markdown = "```math\n\\begin{aligned}\nx &= r\\cos\\theta \\\\\ny &= r\\sin\\theta\n\\end{aligned}\n```";
      const tokens = parseMarkdownWithMath(markdown);
      const math = tokens[0] as unknown as MathToken;
      expect(math.type).toBe("blockMath");
      expect(math.display).toBe(true);
      expect(math.text).toContain("r\\cos\\theta");
    });

    it("converts ```latex blocks to blockMath tokens", () => {
      const markdown = "```latex\n\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J}\n```";
      const tokens = parseMarkdownWithMath(markdown);
      const math = tokens[0] as unknown as MathToken;
      expect(math.type).toBe("blockMath");
      expect(math.display).toBe(true);
      expect(math.text).toBe("\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J}");
    });

    it("leaves other code blocks (e.g. python, bash) untouched", () => {
      const markdown = "```python\nx = '$not_math$'\nprint(x)\n```";
      const tokens = parseMarkdownWithMath(markdown);
      expect(tokens[0].type).toBe("code");
      const code = tokens[0] as { lang?: string; text: string };
      expect(code.lang).toBe("python");
      expect(code.text).toContain("'$not_math$'");
    });
  });

  describe("5. Currency, Escaped Characters & Code Spans", () => {
    it("does not treat dollar amounts ($100 and $200) as math", () => {
      const tokens = parseMarkdownWithMath("The price is $100 and the other item is $200.");
      const p = tokens[0] as { tokens: Array<{ type: string }> };
      const math = p.tokens.find((t) => t.type === "inlineMath");
      expect(math).toBeUndefined();
    });

    it("does not treat single dollar amounts ($50) as math", () => {
      const tokens = parseMarkdownWithMath("Cost: $50 only.");
      const p = tokens[0] as { tokens: Array<{ type: string }> };
      const math = p.tokens.find((t) => t.type === "inlineMath");
      expect(math).toBeUndefined();
    });

    it("does not treat escaped \\$ as math delimiter", () => {
      const tokens = parseMarkdownWithMath("It costs \\$100 to enter.");
      const p = tokens[0] as { tokens: Array<{ type: string }> };
      const math = p.tokens.find((t) => t.type === "inlineMath");
      expect(math).toBeUndefined();
    });

    it("keeps LaTeX formulas in inline code spans untouched", () => {
      const tokens = parseMarkdownWithMath("Use `$E=mc^2$` as code.");
      const p = tokens[0] as { tokens: Array<{ type: string; text?: string }> };
      const code = p.tokens.find((t) => t.type === "codespan");
      expect(code).toBeDefined();
      expect(code?.text).toBe("$E=mc^2$");
      const math = p.tokens.find((t) => t.type === "inlineMath");
      expect(math).toBeUndefined();
    });
  });

  describe("6. Streaming & Unclosed Delimiters", () => {
    it("handles unclosed inline formula during streaming without error", () => {
      const tokens = parseMarkdownWithMath("Agent is generating: $x + y = ");
      const p = tokens[0] as { tokens: Array<{ type: string; text?: string }> };
      const math = p.tokens.find((t) => t.type === "inlineMath");
      expect(math).toBeUndefined();
      expect(p.tokens[0].text).toContain("$x + y = ");
    });

    it("handles unclosed display formula during streaming without error", () => {
      const tokens = parseMarkdownWithMath("$$ \\int_0^1 f(x) ");
      const p = tokens[0] as { tokens: Array<{ type: string; text?: string }> };
      const math = p.tokens.find((t) => t.type === "blockMath");
      expect(math).toBeUndefined();
    });

    it("renders smoothly once the closing delimiter arrives", () => {
      const completeTokens = parseMarkdownWithMath("Agent finished: $x + y = z$ and done.");
      const p = completeTokens[0] as { tokens: Array<{ type: string; text?: string }> };
      const math = p.tokens.find((t) => t.type === "inlineMath") as unknown as MathToken;
      expect(math).toBeDefined();
      expect(math.text).toBe("x + y = z");
    });
  });

  describe("7. KaTeX Mathematics Rendering & Environments", () => {
    it("renders matrices (matrix, bmatrix, pmatrix)", () => {
      const matrixTex = "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}";
      const { html, isError } = renderKaTeXHtml(matrixTex, true);
      expect(isError).toBe(false);
      expect(html).toContain("katex");
      expect(html).toContain("matrix");
    });

    it("renders piecewise cases", () => {
      const casesTex = "f(x) = \\begin{cases} x & x > 0 \\\\ -x & x \\le 0 \\end{cases}";
      const { html, isError } = renderKaTeXHtml(casesTex, true);
      expect(isError).toBe(false);
      expect(html).toContain("cases");
    });

    it("renders aligned multi-line equations", () => {
      const alignTex = "\\begin{aligned} \\dot{x} &= Ax + Bu \\\\ y &= Cx + Du \\end{aligned}";
      const { html, isError } = renderKaTeXHtml(alignTex, true);
      expect(isError).toBe(false);
      expect(html).toContain("katex");
    });

    it("renders fractions, sums, integrals, and partial derivatives", () => {
      const complexTex = "\\frac{\\partial V}{\\partial t} + \\sum_{i=1}^n \\int_0^T \\lambda_i dt";
      const { html, isError } = renderKaTeXHtml(complexTex, false);
      expect(isError).toBe(false);
      expect(html).toContain("katex");
    });

    it("gracefully catches invalid LaTeX commands without throwing", () => {
      const invalidTex = "\\nonExistentCommandForSure{123}";
      const { html } = renderKaTeXHtml(invalidTex, false);
      // Returns rendered error output with original text readable
      expect(html).toContain("nonExistentCommandForSure");
    });
  });

  describe("8. Offline & Self-Contained Assets", () => {
    it("has inlined base64 woff2 fonts in CSS without any external URL", () => {
      expect(KATEX_CSS).toContain("data:font/woff2;base64,");
      // Check that there are no external http/https font links
      const externalFontMatches = KATEX_CSS.match(/url\(["']?https?:\/\//g);
      expect(externalFontMatches).toBeNull();
    });

    it("contains responsive display and scrollbar styles", () => {
      expect(KATEX_CSS).toContain(".katex-display-container");
      expect(KATEX_CSS).toContain("overflow-x: auto");
      expect(KATEX_CSS).toContain(".paseo-copy-math-btn");
    });
  });

  describe("9. Markdown Integration (Tables, Lists, Quotes)", () => {
    it("correctly parses math inside Markdown tables", () => {
      const tableMd = `
| Symbol | Meaning | Value |
| :--- | :--- | :--- |
| $\\tau_m$ | Motor torque | $1.5\\,\\mathrm{N\\cdot m}$ |
| $\\theta$ | Position | $\\pi/2$ |
      `.trim();
      const tokens = parseMarkdownWithMath(tableMd);
      expect(tokens[0].type).toBe("table");
      const table = tokens[0] as {
        rows: Array<Array<{ tokens: Array<{ type: string; text?: string }> }>>;
      };
      const cellMath = table.rows[0][0].tokens.find((t) => t.type === "inlineMath");
      expect(cellMath).toBeDefined();
    });

    it("correctly parses math inside Markdown lists", () => {
      const listMd = `
1. Step one: initialize $x_0 = 0$
2. Step two: compute $\\Delta x$
      `.trim();
      const tokens = parseMarkdownWithMath(listMd);
      expect(tokens[0].type).toBe("list");
      const list = tokens[0] as { items: Array<{ tokens: Array<{ tokens?: Array<{ type: string }> }> }> };
      const itemMath = list.items[0].tokens[0].tokens?.find((t) => t.type === "inlineMath");
      expect(itemMath).toBeDefined();
    });

    it("correctly parses math inside Markdown blockquotes", () => {
      const quoteMd = "> Note that $E=mc^2$ holds universally.";
      const tokens = parseMarkdownWithMath(quoteMd);
      expect(tokens[0].type).toBe("blockquote");
    });
  });
});
