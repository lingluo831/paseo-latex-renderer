import { Marked, type Token, type Tokens } from "marked";

export interface MathToken {
  type: "blockMath" | "inlineMath";
  raw: string;
  text: string;
  display: boolean;
}

/**
 * Checks if a character at index is preceded by an odd number of backslashes (i.e. is escaped).
 */
export function isEscaped(src: string, index: number): boolean {
  let count = 0;
  for (let i = index - 1; i >= 0 && src[i] === "\\"; i--) {
    count++;
  }
  return count % 2 === 1;
}

/**
 * Rapid heuristic to check whether text might contain LaTeX math.
 * Used by Timeline Transformer to avoid claiming messages without math.
 */
export function containsMathSyntax(text: string): boolean {
  if (!text) return false;
  if (text.includes("$$")) return true;
  if (text.includes("\\[")) return true;
  if (text.includes("\\(")) return true;
  if (text.includes("```math")) return true;
  if (text.includes("```latex")) return true;

  // Check for inline $ that is not solely currency or escaped
  if (text.includes("$")) {
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "$" && !isEscaped(text, i)) {
        // Must not be followed by space, tab, newline
        if (
          i + 1 < text.length &&
          text[i + 1] !== " " &&
          text[i + 1] !== "\t" &&
          text[i + 1] !== "\n"
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Inline Math tokenizer extension for Marked.
 * Supports $...$ and \(...\).
 */
const inlineMathExtension = {
  name: "inlineMath",
  level: "inline" as const,
  start(src: string): number | undefined {
    const d = src.indexOf("$");
    const p = src.indexOf("\\(");
    if (d === -1) return p === -1 ? undefined : p;
    if (p === -1) return d;
    return Math.min(d, p);
  },
  tokenizer(src: string): MathToken | undefined {
    // 1. \( ... \)
    if (src.startsWith("\\(")) {
      let brace = 0;
      for (let i = 2; i < src.length - 1; i++) {
        if (src[i] === "{" && !isEscaped(src, i)) brace++;
        else if (src[i] === "}" && !isEscaped(src, i)) brace--;
        else if (brace === 0 && src[i] === "\\" && src[i + 1] === ")") {
          const content = src.slice(2, i).trim();
          if (!content) return undefined;
          return {
            type: "inlineMath",
            raw: src.slice(0, i + 2),
            text: content,
            display: false,
          };
        }
      }
      return undefined;
    }

    // 2. $ ... $
    if (src.startsWith("$") && !src.startsWith("$$")) {
      // Must not start with space/tab/newline
      if (src[1] === " " || src[1] === "\t" || src[1] === "\n") return undefined;

      let brace = 0;
      for (let i = 1; i < src.length; i++) {
        // Double newline aborts inline math (CommonMark rule)
        if (src[i] === "\n" && src[i - 1] === "\n") return undefined;

        if (src[i] === "{" && !isEscaped(src, i)) brace++;
        else if (src[i] === "}" && !isEscaped(src, i)) brace--;
        else if (brace === 0 && src[i] === "$" && !isEscaped(src, i)) {
          // Closing $ must not be preceded by space or tab
          if (src[i - 1] === " " || src[i - 1] === "\t") continue;

          const content = src.slice(1, i);
          // Currency heuristic: $100 and $200 (both ends adjacent to digits)
          if (/^\d+/.test(content) && /^\d/.test(src.slice(i + 1))) {
            continue;
          }
          if (!content.trim()) return undefined;

          return {
            type: "inlineMath",
            raw: src.slice(0, i + 1),
            text: content.trim(),
            display: false,
          };
        }
      }
    }
    return undefined;
  },
};

/**
 * Block Math tokenizer extension for Marked.
 * Supports $$...$$ and \[...\].
 */
const blockMathExtension = {
  name: "blockMath",
  level: "block" as const,
  start(src: string): number | undefined {
    const d = src.indexOf("$$");
    const b = src.indexOf("\\[");
    if (d === -1) return b === -1 ? undefined : b;
    if (b === -1) return d;
    return Math.min(d, b);
  },
  tokenizer(src: string): MathToken | undefined {
    // 1. \[ ... \]
    if (src.startsWith("\\[")) {
      let brace = 0;
      for (let i = 2; i < src.length - 1; i++) {
        if (src[i] === "{" && !isEscaped(src, i)) brace++;
        else if (src[i] === "}" && !isEscaped(src, i)) brace--;
        else if (brace === 0 && src[i] === "\\" && src[i + 1] === "]") {
          return {
            type: "blockMath",
            raw: src.slice(0, i + 2),
            text: src.slice(2, i).trim(),
            display: true,
          };
        }
      }
      return undefined;
    }

    // 2. $$ ... $$
    if (src.startsWith("$$")) {
      let brace = 0;
      for (let i = 2; i < src.length - 1; i++) {
        if (src[i] === "{" && !isEscaped(src, i)) brace++;
        else if (src[i] === "}" && !isEscaped(src, i)) brace--;
        else if (
          brace === 0 &&
          src[i] === "$" &&
          src[i + 1] === "$" &&
          !isEscaped(src, i)
        ) {
          return {
            type: "blockMath",
            raw: src.slice(0, i + 2),
            text: src.slice(2, i).trim(),
            display: true,
          };
        }
      }
    }
    return undefined;
  },
};

// Create a dedicated Marked instance with our math extensions
const markedInstance = new Marked({
  gfm: true,
  breaks: false,
});

markedInstance.use({
  extensions: [blockMathExtension, inlineMathExtension],
  walkTokens(token: Token) {
    // Convert code blocks with language "math" or "latex" into blockMath tokens
    if (token.type === "code") {
      const codeToken = token as Tokens.Code;
      const lang = codeToken.lang?.toLowerCase().trim();
      if (lang === "math" || lang === "latex") {
        const mathToken = token as unknown as MathToken;
        mathToken.type = "blockMath";
        mathToken.display = true;
        mathToken.text = codeToken.text.trim();
      }
    }
  },
});

/**
 * Parses a markdown string containing LaTeX math into an AST of Marked tokens.
 */
export function parseMarkdownWithMath(markdown: string): Token[] {
  if (!markdown) return [];
  const tokens = markedInstance.lexer(markdown);
  markedInstance.walkTokens(tokens, (token: Token) => {
    if (token.type === "code") {
      const codeToken = token as Tokens.Code;
      const lang = codeToken.lang?.toLowerCase().trim();
      if (lang === "math" || lang === "latex") {
        const mathToken = token as unknown as MathToken;
        mathToken.type = "blockMath";
        mathToken.display = true;
        mathToken.text = codeToken.text.trim();
      }
    }
  });
  return tokens;
}
