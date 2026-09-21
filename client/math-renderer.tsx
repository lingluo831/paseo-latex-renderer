import React from "react";
import type { PluginTheme } from "@getpaseo/plugin";
import { WebBlockMath, WebInlineMath } from "./web";

export interface MathInlineProps {
  tex: string;
  theme: PluginTheme;
}

export function MathInline({ tex, theme }: MathInlineProps): React.JSX.Element {
  return <WebInlineMath tex={tex} color={theme.colors.foreground} />;
}

export interface MathBlockProps {
  tex: string;
  theme: PluginTheme;
  onCopyNotice?: () => void;
}

export function MathBlock({
  tex,
  theme,
  onCopyNotice,
}: MathBlockProps): React.JSX.Element {
  return (
    <WebBlockMath
      tex={tex}
      color={theme.colors.foreground}
      onCopyNotice={onCopyNotice}
    />
  );
}
