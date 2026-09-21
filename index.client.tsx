import React from "react";
import type {
  PluginClientContext,
  PluginTimelineItemProps,
} from "@getpaseo/plugin/client";
import { useRevealedText } from "@getpaseo/plugin/client/react-native";
import { z } from "zod";
import { MarkdownRenderer } from "./client/markdown-renderer";
import { containsMathSyntax } from "./client/math-parser";

const mathMessageSchema = z.object({
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
  messageId: z.string().nullable().optional(),
});

type MathMessageData = z.infer<typeof mathMessageSchema>;

/**
 * Custom Assistant Message component with native KaTeX formula rendering.
 */
function LatexAssistantMessage({
  item,
  theme,
  layout,
}: PluginTimelineItemProps<MathMessageData>): React.JSX.Element {
  // Pace streaming text smoothly during generation
  const revealedText = useRevealedText(item.data.text, item.data.phase);

  return (
    <MarkdownRenderer
      text={revealedText}
      theme={theme}
      layout={layout}
    />
  );
}

export default function contribute(client: PluginClientContext) {
  // 1. Transform assistant messages that contain LaTeX syntax
  const removeTransformer = client.addTimelineTransformer({
    id: "latex-renderer",
    query: { itemType: "assistant_message" },
    transform: ({ item, phase }) => {
      // If the message does not contain math syntax, leave it for native rendering
      if (!containsMathSyntax(item.text)) {
        return undefined;
      }

      return {
        items: [
          {
            type: "plugin",
            kind: "latex-assistant-message",
            version: 1,
            data: {
              text: item.text,
              phase,
              messageId: item.messageId ?? null,
            },
          },
        ],
      };
    },
  });

  // 2. Render claimed math assistant messages with KaTeX & Markdown
  const removeRenderer = client.addTimelineRenderer({
    kind: "latex-assistant-message",
    version: 1,
    schema: mathMessageSchema,
    Component: LatexAssistantMessage,
  });

  return () => {
    removeTransformer();
    removeRenderer();
  };
}
