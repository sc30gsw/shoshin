import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeOutLeft, LinearTransition } from "react-native-reanimated";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { GoalListItem } from "./goal-list-item";
import { Colors } from "@/constants/colors";
import type { Goal } from "@/features/goal/types/goal";

interface GoalListProps {
  goals: Goal[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onDelete?: (goal: Goal) => void;
}

function EmptyState() {
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 32,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: Colors.secondarySystemBackground,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SymbolView
          name="heart.text.clipboard"
          size={36}
          tintColor={Colors.systemGray2}
        />
      </View>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Text
          style={{
            color: Colors.label,
            fontSize: 20,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {t("home.empty.title")}
        </Text>
        <Text
          style={{
            color: Colors.secondaryLabel,
            fontSize: 14,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          {t("home.empty.description")}
        </Text>
      </View>
    </View>
  );
}

export function GoalList({ goals, onRefresh, isRefreshing = false, onDelete }: GoalListProps) {
  return (
    <Animated.FlatList
      data={goals}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <Animated.View exiting={FadeOutLeft.duration(200)} layout={LinearTransition}>
          <GoalListItem goal={item} onDelete={() => onDelete?.(item)} />
        </Animated.View>
      )}
      itemLayoutAnimation={LinearTransition}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
      ListEmptyComponent={<EmptyState />}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
    />
  );
}
