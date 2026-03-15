import React from "react";
import { View, Text } from "react-native";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_TEXT_COLORS } from "@/constants";
import type { CategoryValue } from "@/constants";

interface CategoryBadgeProps {
  category: CategoryValue;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const { t } = useTranslation();
  const color = CATEGORY_COLORS[category];
  const textColor = CATEGORY_TEXT_COLORS[category];
  const icon = CATEGORY_ICONS[category];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: `${color}22`,
      }}
    >
      <SymbolView name={icon as any} size={12} tintColor={textColor} />
      <Text style={{ fontSize: 12, fontWeight: "500", color: textColor }}>
        {t(`category.${category}`)}
      </Text>
    </View>
  );
}
