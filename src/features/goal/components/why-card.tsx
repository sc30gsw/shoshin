import React from "react";
import { View, Text } from "react-native";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_TEXT_COLORS } from "@/constants";
import type { CategoryValue } from "@/constants";

interface WhyCardProps {
  why: string;
  goalName: string;
  category: CategoryValue;
}

export function WhyCard({ why, goalName, category }: WhyCardProps) {
  const { t } = useTranslation();
  const color = CATEGORY_COLORS[category];
  const textColor = CATEGORY_TEXT_COLORS[category];
  const icon = CATEGORY_ICONS[category];

  return (
    <View
      style={{
        borderRadius: 16,
        borderCurve: "continuous",
        backgroundColor: `${color}18`,
        padding: 16,
        gap: 12,
      }}
    >
      {/* アイコン + "{goalName}を始めた理由（WHY）" */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            borderCurve: "continuous",
            backgroundColor: `${color}18`,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SymbolView name={icon as any} size={16} tintColor={textColor} />
        </View>
        <Text
          style={{ flex: 1, color: textColor, fontWeight: "600", fontSize: 14, lineHeight: 20 }}
        >
          {t("goal.whyCardTitle", { name: goalName })}
        </Text>
      </View>

      {/* WHY 本文 */}
      <Text
        style={{
          color: textColor,
          fontSize: 16,
          fontWeight: "400",
          lineHeight: 26,
          paddingLeft: 42,
        }}
        selectable
      >
        {why}
      </Text>
    </View>
  );
}
