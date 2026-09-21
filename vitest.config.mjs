import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    alias: {
      "react-native": path.resolve(__dirname, "tests/react-native-mock.ts"),
    },
  },
});
