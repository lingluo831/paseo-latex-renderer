import React from "react";

export const Platform = {
  OS: "web",
  select: (obj: Record<string, unknown>) => obj.web || obj.default,
};

export const Linking = {
  openURL: async () => {},
};

export const View = "div";
export const Text = "span";
export const ScrollView = "div";
export const Pressable = "button";
export const StyleSheet = {
  create: <T>(styles: T): T => styles,
};
