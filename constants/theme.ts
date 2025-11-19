import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "rgba(26, 26, 26, 0.7)",
    textTertiary: "rgba(26, 26, 26, 0.6)",
    textQuaternary: "rgba(26, 26, 26, 0.5)",
    buttonText: "#F8F6F0",
    tabIconDefault: "#F8F6F0",
    tabIconSelected: "#B8D4B8",
    link: "#2D5A3D",
    primary: "#2D5A3D",
    primaryLight: "#B8D4B8",
    accent: "#B8D4B8",
    backgroundRoot: "#F8F6F0",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F8F6F0",
    backgroundTertiary: "#F0EDE5",
    tabBar: "#2D5A3D",
    border: "rgba(45, 90, 61, 0.2)",
    shadow: "rgba(0, 0, 0, 0.05)",
  },
  dark: {
    text: "#F8F6F0",
    textSecondary: "rgba(248, 246, 240, 0.7)",
    textTertiary: "rgba(248, 246, 240, 0.6)",
    textQuaternary: "rgba(248, 246, 240, 0.5)",
    buttonText: "#F8F6F0",
    tabIconDefault: "#F8F6F0",
    tabIconSelected: "#B8D4B8",
    link: "#B8D4B8",
    primary: "#2D5A3D",
    primaryLight: "#B8D4B8",
    accent: "#B8D4B8",
    backgroundRoot: "#1A1A1A",
    backgroundDefault: "#2A2A2A",
    backgroundSecondary: "#1A1A1A",
    backgroundTertiary: "#333333",
    tabBar: "#2D5A3D",
    border: "rgba(184, 212, 184, 0.2)",
    shadow: "rgba(0, 0, 0, 0.3)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 44,
  buttonHeight: 48,
  tabBarHeight: 60,
  fabSize: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
