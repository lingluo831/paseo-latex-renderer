import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PluginTheme } from "@getpaseo/plugin";
import type { Token, Tokens } from "marked";
import { MathBlock, MathInline } from "./math-renderer";
import { parseMarkdownWithMath, type MathToken } from "./math-parser";
import { copyRawLatex, openExternal } from "./web";

export interface MarkdownRendererProps {
  text: string;
  theme: PluginTheme;
  layout?: { compact: boolean };
}

/**
 * Renders inline tokens (text, bold, italic, code, links, inlineMath) inside Text components.
 */
function renderInlineTokens(
  tokens: Token[] | undefined,
  theme: PluginTheme,
  keyPrefix = "inline",
): React.ReactNode[] {
  if (!tokens || tokens.length === 0) return [];

  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    switch (token.type) {
      case "text": {
        const textToken = token as Tokens.Text;
        if (textToken.tokens && textToken.tokens.length > 0) {
          return (
            <React.Fragment key={key}>
              {renderInlineTokens(textToken.tokens, theme, key)}
            </React.Fragment>
          );
        }
        return (
          <Text key={key} selectable style={{ color: theme.colors.foreground }}>
            {textToken.text}
          </Text>
        );
      }

      case "strong": {
        const strongToken = token as Tokens.Strong;
        return (
          <Text
            key={key}
            selectable
            style={{ fontWeight: "bold", color: theme.colors.foreground }}
          >
            {renderInlineTokens(strongToken.tokens, theme, key)}
          </Text>
        );
      }

      case "em": {
        const emToken = token as Tokens.Em;
        return (
          <Text
            key={key}
            selectable
            style={{ fontStyle: "italic", color: theme.colors.foreground }}
          >
            {renderInlineTokens(emToken.tokens, theme, key)}
          </Text>
        );
      }

      case "codespan": {
        const codeToken = token as Tokens.Codespan;
        return (
          <Text
            key={key}
            selectable
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              backgroundColor: theme.colors.surface1,
              color: theme.colors.accent,
              paddingHorizontal: 4,
              borderRadius: 3,
            }}
          >
            {codeToken.text}
          </Text>
        );
      }

      case "inlineMath": {
        const mathToken = token as unknown as MathToken;
        return <MathInline key={key} tex={mathToken.text} theme={theme} />;
      }

      case "link": {
        const linkToken = token as Tokens.Link;
        return (
          <Text
            key={key}
            selectable
            accessibilityRole="link"
            onPress={() => openExternal(linkToken.href)}
            style={{
              color: theme.colors.accent,
              textDecorationLine: "underline",
            }}
          >
            {renderInlineTokens(linkToken.tokens, theme, key)}
          </Text>
        );
      }

      case "del": {
        const delToken = token as Tokens.Del;
        return (
          <Text
            key={key}
            selectable
            style={{
              textDecorationLine: "line-through",
              color: theme.colors.foregroundMuted,
            }}
          >
            {renderInlineTokens(delToken.tokens, theme, key)}
          </Text>
        );
      }

      case "escape": {
        const escapeToken = token as Tokens.Escape;
        return (
          <Text key={key} selectable style={{ color: theme.colors.foreground }}>
            {escapeToken.text}
          </Text>
        );
      }

      case "br":
        return "\n";

      default:
        return (
          <Text key={key} selectable style={{ color: theme.colors.foreground }}>
            {"raw" in token ? (token.raw as string) : ""}
          </Text>
        );
    }
  });
}

interface BlockTokenProps {
  token: Token;
  theme: PluginTheme;
  layout?: { compact: boolean };
  index: number;
}

/**
 * Code Block with language tag and copy button.
 */
function CodeBlockView({
  token,
  theme,
}: {
  token: Tokens.Code;
  theme: PluginTheme;
}): React.JSX.Element {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const ok = await copyRawLatex(token.text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View
      style={{
        marginVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface1,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: theme.colors.surface0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontFamily: "monospace",
            color: theme.colors.foregroundMuted,
          }}
        >
          {token.lang || "code"}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy code"
          onPress={handleCopy}
          style={{
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 4,
            backgroundColor: theme.colors.surface2,
          }}
        >
          <Text style={{ fontSize: 11, color: theme.colors.foregroundMuted }}>
            {copied ? "Copied" : "Copy"}
          </Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={{ padding: 12 }}
      >
        <Text
          selectable
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 18,
            color: theme.colors.foreground,
          }}
        >
          {token.text}
        </Text>
      </ScrollView>
    </View>
  );
}

/**
 * Renders individual top-level / block tokens.
 */
function BlockTokenComponent({
  token,
  theme,
  layout,
  index,
}: BlockTokenProps): React.JSX.Element | null {
  const isCompact = layout?.compact ?? false;

  switch (token.type) {
    case "heading": {
      const headingToken = token as Tokens.Heading;
      const sizeMap: Record<number, { fontSize: number; lineHeight: number }> = {
        1: { fontSize: isCompact ? 19 : 22, lineHeight: 28 },
        2: { fontSize: isCompact ? 17 : 19, lineHeight: 25 },
        3: { fontSize: isCompact ? 15 : 17, lineHeight: 22 },
        4: { fontSize: 15, lineHeight: 20 },
        5: { fontSize: 14, lineHeight: 19 },
        6: { fontSize: 13, lineHeight: 18 },
      };
      const { fontSize, lineHeight } = sizeMap[headingToken.depth] || sizeMap[3];

      return (
        <View
          key={index}
          style={{
            marginTop: headingToken.depth === 1 ? 14 : 10,
            marginBottom: 6,
          }}
        >
          <Text
            selectable
            style={{
              fontSize,
              lineHeight,
              fontWeight: "bold",
              color: theme.colors.foreground,
            }}
          >
            {renderInlineTokens(headingToken.tokens, theme, `h-${index}`)}
          </Text>
        </View>
      );
    }

    case "paragraph": {
      const pToken = token as Tokens.Paragraph;
      return (
        <View key={index} style={{ marginBottom: 8 }}>
          <Text
            selectable
            style={{
              fontSize: isCompact ? 13 : 14,
              lineHeight: isCompact ? 20 : 22,
              color: theme.colors.foreground,
            }}
          >
            {renderInlineTokens(pToken.tokens, theme, `p-${index}`)}
          </Text>
        </View>
      );
    }

    case "blockMath": {
      const mathToken = token as unknown as MathToken;
      return <MathBlock key={index} tex={mathToken.text} theme={theme} />;
    }

    case "code": {
      const codeToken = token as Tokens.Code;
      const lang = codeToken.lang?.toLowerCase().trim();
      if (lang === "math" || lang === "latex") {
        return <MathBlock key={index} tex={codeToken.text} theme={theme} />;
      }
      return <CodeBlockView key={index} token={codeToken} theme={theme} />;
    }

    case "blockquote": {
      const bqToken = token as Tokens.Blockquote;
      return (
        <View
          key={index}
          style={{
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.accent,
            paddingLeft: 12,
            marginVertical: 8,
          }}
        >
          {bqToken.tokens.map((subToken, subIdx) => (
            <BlockTokenComponent
              key={subIdx}
              token={subToken}
              theme={theme}
              layout={layout}
              index={subIdx}
            />
          ))}
        </View>
      );
    }

    case "list": {
      const listToken = token as Tokens.List;
      return (
        <View key={index} style={{ marginVertical: 6, paddingLeft: 8 }}>
          {listToken.items.map((item, itemIdx) => (
            <View
              key={itemIdx}
              style={{
                flexDirection: "row",
                marginBottom: 4,
                alignItems: "flex-start",
              }}
            >
              <Text
                selectable={false}
                style={{
                  width: listToken.ordered ? 22 : 14,
                  fontSize: 14,
                  lineHeight: 22,
                  color: theme.colors.foregroundMuted,
                  fontWeight: listToken.ordered ? "500" : "bold",
                }}
              >
                {listToken.ordered ? `${(listToken.start || 1) + itemIdx}.` : "•"}
              </Text>
              <View style={{ flex: 1 }}>
                {item.tokens && item.tokens.length > 0 ? (
                  item.tokens.map((sub, sIdx) => {
                    if (sub.type === "text") {
                      const textSub = sub as Tokens.Text;
                      return (
                        <Text
                          key={sIdx}
                          selectable
                          style={{
                            fontSize: 14,
                            lineHeight: 22,
                            color: theme.colors.foreground,
                          }}
                        >
                          {textSub.tokens
                            ? renderInlineTokens(
                                textSub.tokens,
                                theme,
                                `li-${itemIdx}-${sIdx}`,
                              )
                            : textSub.text}
                        </Text>
                      );
                    }
                    return (
                      <BlockTokenComponent
                        key={sIdx}
                        token={sub}
                        theme={theme}
                        layout={layout}
                        index={sIdx}
                      />
                    );
                  })
                ) : (
                  <Text
                    selectable
                    style={{
                      fontSize: 14,
                      lineHeight: 22,
                      color: theme.colors.foreground,
                    }}
                  >
                    {item.text}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      );
    }

    case "table": {
      const tableToken = token as Tokens.Table;
      return (
        <ScrollView
          key={index}
          horizontal
          showsHorizontalScrollIndicator={true}
          style={{ marginVertical: 8 }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            {/* Header row */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: theme.colors.surface1,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              {tableToken.header.map((col, colIdx) => (
                <View
                  key={colIdx}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRightWidth:
                      colIdx < tableToken.header.length - 1 ? 1 : 0,
                    borderRightColor: theme.colors.border,
                    minWidth: 80,
                  }}
                >
                  <Text
                    selectable
                    style={{
                      fontWeight: "600",
                      fontSize: 13,
                      color: theme.colors.foreground,
                      textAlign: col.align || "left",
                    }}
                  >
                    {renderInlineTokens(col.tokens, theme, `th-${colIdx}`)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Data rows */}
            {tableToken.rows.map((row, rowIdx) => (
              <View
                key={rowIdx}
                style={{
                  flexDirection: "row",
                  backgroundColor:
                    rowIdx % 2 === 0 ? "transparent" : theme.colors.surface0,
                  borderBottomWidth:
                    rowIdx < tableToken.rows.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.border,
                }}
              >
                {row.map((cell, cellIdx) => (
                  <View
                    key={cellIdx}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRightWidth: cellIdx < row.length - 1 ? 1 : 0,
                      borderRightColor: theme.colors.border,
                      minWidth: 80,
                    }}
                  >
                    <Text
                      selectable
                      style={{
                        fontSize: 13,
                        color: theme.colors.foreground,
                        textAlign: tableToken.align[cellIdx] || "left",
                      }}
                    >
                      {renderInlineTokens(
                        cell.tokens,
                        theme,
                        `td-${rowIdx}-${cellIdx}`,
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    case "hr":
      return (
        <View
          key={index}
          style={{
            height: 1,
            backgroundColor: theme.colors.border,
            marginVertical: 12,
          }}
        />
      );

    case "space":
      return null;

    default:
      return null;
  }
}

/**
 * Main Markdown and LaTeX Renderer.
 * Parses markdown into tokens including LaTeX math, and renders formatted UI.
 */
export function MarkdownRenderer({
  text,
  theme,
  layout,
}: MarkdownRendererProps): React.JSX.Element {
  const tokens = useMemo(() => parseMarkdownWithMath(text), [text]);

  return (
    <View style={styles.root}>
      {tokens.map((token, index) => (
        <BlockTokenComponent
          key={index}
          token={token}
          theme={theme}
          layout={layout}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
});
