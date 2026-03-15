import React, { useRef } from "react";
import { Alert, View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Swipeable } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/constants";
import { CategoryBadge } from "@/features/goal/components/category-badge";
import type { Goal } from "@/features/goal/types/goal";
import { formatReminderLabel } from "@/features/goal/helpers/reminder-label";

interface GoalListItemProps {
  goal: Goal;
  onDelete?: () => void;
}

export function GoalListItem({ goal, onDelete }: GoalListItemProps) {
  const { t } = useTranslation();
  const categoryColor = CATEGORY_COLORS[goal.category];
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    Alert.alert(t("goal.deleteConfirm"), t("goal.deleteConfirmMessage"), [
      { text: t("goal.cancel"), style: "cancel" },
      { text: t("goal.delete"), style: "destructive", onPress: () => onDelete?.() },
    ]);
  };

  const renderRightActions = () => (
    <Pressable
      onPress={handleDelete}
      style={{
        backgroundColor: "#FF3B30",
        justifyContent: "center",
        alignItems: "center",
        width: 72,
        borderRadius: 16,
        borderCurve: "continuous",
        marginLeft: 8,
      }}
    >
      <SymbolView name="trash.fill" size={18} tintColor="white" />
      <Text style={{ color: "white", fontSize: 11, fontWeight: "600", marginTop: 4 }}>
        {t("goal.delete")}
      </Text>
    </Pressable>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: Colors.tertiarySystemBackground,
        borderRadius: 16,
        borderCurve: "continuous",
        overflow: "hidden",
        opacity: pressed ? 0.75 : 1,
        flexDirection: "row",
      })}
      onPress={() => router.push(`/goal/${goal.id}`)}
    >
      {/* Left accent bar */}

      <View style={{ width: 4, backgroundColor: categoryColor }} />

      <View style={{ flex: 1, padding: 14, gap: 6 }}>
        {/* Name row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              borderCurve: "continuous",
              backgroundColor: `${categoryColor}18`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SymbolView
              name={CATEGORY_ICONS[goal.category] as any}
              size={14}
              tintColor={categoryColor}
            />
          </View>
          <Text
            style={{ flex: 1, color: Colors.label, fontWeight: "600", fontSize: 15 }}
            numberOfLines={1}
          >
            {goal.name}
          </Text>
          <SymbolView name="chevron.right" size={12} tintColor={Colors.tertiaryLabel} />
        </View>

        {/* WHY hint */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingLeft: 36 }}>
          <Text
            style={{
              fontSize: 9,
              fontWeight: "700",
              color: categoryColor,
              letterSpacing: 0.5,
            }}
          >
            WHY
          </Text>
          <Text
            style={{
              flex: 1,
              color: Colors.secondaryLabel,
              fontSize: 12,
              lineHeight: 16,
              fontStyle: "italic",
            }}
            numberOfLines={1}
          >
            {goal.why}
          </Text>
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 36,
            paddingTop: 2,
          }}
        >
          <CategoryBadge category={goal.category} />

          {goal.is_active ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <SymbolView name="bell.fill" size={11} tintColor={Colors.systemBlue} />
              <Text style={{ fontSize: 11, color: Colors.secondaryLabel }}>
                {formatReminderLabel(t, goal.reminder_interval, goal.reminder_hour, goal.reminder_minute, goal.reminder_weekday, goal.reminder_day)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
    </Swipeable>
  );
}
