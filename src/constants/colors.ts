import { Platform, PlatformColor } from "react-native";

// PlatformColor on iOS for semantic system colors, hex fallback elsewhere.
const c = (semantic: string, fallback: string) =>
  Platform.OS === "ios"
    ? PlatformColor(semantic)
    : (fallback as unknown as ReturnType<typeof PlatformColor>);

export const Colors = {
  // Text
  label: c("label", "#000000"),
  secondaryLabel: c("secondaryLabel", "#3C3C4399"),
  tertiaryLabel: c("tertiaryLabel", "#3C3C432E"),
  // Backgrounds
  systemBackground: c("systemBackground", "#FFFFFF"),
  secondarySystemBackground: c("secondarySystemBackground", "#F2F2F7"),
  tertiarySystemBackground: c("tertiarySystemBackground", "#FFFFFF"),
  // Separator
  separator: c("separator", "#C6C6C8"),
  // Accent
  systemBlue: c("systemBlue", "#007AFF"),
  systemGreen: c("systemGreen", "#34C759"),
  systemRed: c("systemRed", "#FF3B30"),
  systemOrange: c("systemOrange", "#FF9500"),
  systemPurple: c("systemPurple", "#AF52DE"),
  systemIndigo: c("systemIndigo", "#5856D6"),
  systemYellow: c("systemYellow", "#FFCC00"),
  systemGray: c("systemGray", "#8E8E93"),
  systemGray2: c("systemGray2", "#AEAEB2"),
  systemGray3: c("systemGray3", "#C7C7CC"),
  systemGray4: c("systemGray4", "#D1D1D6"),
  systemGray5: c("systemGray5", "#E5E5EA"),
  systemGray6: c("systemGray6", "#F2F2F7"),
} as const;

// Plain hex values for use in rgba/opacity contexts (template literals, etc.)
export const HexColors = {
  systemBlue: "#007AFF",
  systemGreen: "#34C759",
  systemRed: "#FF3B30",
  systemOrange: "#FF9500",
  systemPurple: "#AF52DE",
  systemGray: "#8E8E93",
} as const;
