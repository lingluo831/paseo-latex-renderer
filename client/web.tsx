import React, { useEffect, useState } from "react";
import { Linking, Platform, ScrollView, Text, View } from "react-native";
import katex from "katex";
import { KATEX_CSS } from "./katex-css";

// Declare only the DOM interfaces used by this module for web runtime
declare const document: {
  getElementById(id: string): unknown;
  createElement(tag: string): {
    id: string;
    textContent: string;
  };
  head: {
    appendChild(node: unknown): void;
  };
} | undefined;

declare const window: {
  open(url: string, target: string, features: string): unknown;
} | undefined;

declare const navigator: {
  clipboard?: {
    writeText(text: string): Promise<void>;
  };
} | undefined;

let stylesInjected = false;

/**
 * Injects KaTeX stylesheet with embedded woff2 fonts into document head.
 * Idempotent, safe on mobile / non-web runtimes.
 */
export function ensureKaTeXStyles(): void {
  if (Platform.OS !== "web" || stylesInjected || typeof document === "undefined") {
    return;
  }
  const styleId = "paseo-latex-renderer-styles";
  if (document.getElementById(styleId)) {
    stylesInjected = true;
    return;
  }
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = KATEX_CSS;
  document.head.appendChild(style);
  stylesInjected = true;
}

/**
 * Renders LaTeX TeX string to safe HTML using KaTeX.
 * Gracefully catches errors and returns readable fallback.
 */
export function renderKaTeXHtml(
  tex: string,
  displayMode: boolean,
): { html: string; isError: boolean } {
  try {
    const html = katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
    });
    return { html, isError: false };
  } catch (err) {
    const escaped = tex
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return {
      html: `<span class="katex-error" title="KaTeX parse error: ${String(err)}">${escaped}</span>`,
      isError: true,
    };
  }
}

/**
 * Copies raw LaTeX to clipboard.
 */
export async function copyRawLatex(tex: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(tex);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Opens external link safely.
 */
export async function openExternal(url: string): Promise<void> {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  await Linking.openURL(url);
}

export interface WebInlineMathProps {
  tex: string;
  color?: string;
}

/**
 * Inline Math Component.
 * On Web: renders HTML <span> with KaTeX HTML.
 * On Native: renders monospace styled Text fallback.
 */
export function WebInlineMath({ tex, color }: WebInlineMathProps): React.JSX.Element {
  useEffect(() => {
    ensureKaTeXStyles();
  }, []);

  if (Platform.OS === "web") {
    const { html } = renderKaTeXHtml(tex, false);
    return (
      <span
        className="katex-inline"
        style={{ color: color || "inherit" }}
        dangerouslySetInnerHTML={{ __html: html }}
        title={`LaTeX: $${tex}$ (Click to copy)`}
        onClick={(e) => {
          e.stopPropagation();
          copyRawLatex(tex);
        }}
      />
    );
  }

  return (
    <Text
      selectable
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        color: color || "#e0e0e0",
      }}
    >
      ${tex}$
    </Text>
  );
}

export interface WebBlockMathProps {
  tex: string;
  color?: string;
  onCopyNotice?: () => void;
}

/**
 * Display Math Component.
 * On Web: renders horizontal scroll container with KaTeX HTML and copy button.
 * On Native: renders horizontally scrollable native Text container.
 */
export function WebBlockMath({
  tex,
  color,
  onCopyNotice,
}: WebBlockMathProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ensureKaTeXStyles();
  }, []);

  const handleCopy = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const ok = await copyRawLatex(tex);
    if (ok) {
      setCopied(true);
      onCopyNotice?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (Platform.OS === "web") {
    const { html } = renderKaTeXHtml(tex, true);
    return (
      <div className="paseo-math-block">
        <button
          type="button"
          className="paseo-copy-math-btn"
          onClick={handleCopy}
          title="Copy LaTeX formula"
        >
          {copied ? "Copied!" : "Copy LaTeX"}
        </button>
        <div
          className="katex-display-container"
          style={{ color: color || "inherit" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  return (
    <View
      style={{
        marginVertical: 8,
        padding: 8,
        borderRadius: 6,
        backgroundColor: "rgba(128, 128, 128, 0.08)",
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <Text
          selectable
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            color: color || "#e0e0e0",
          }}
        >
          {tex}
        </Text>
      </ScrollView>
    </View>
  );
}
