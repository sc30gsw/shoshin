import React, { useLayoutEffect, useCallback } from "react";
import { Alert, Pressable } from "react-native";
import { router, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { GoalList } from "@/features/goal/components/goal-list";
import { useGoals } from "@/features/goal/hooks/use-goals";
import { Colors } from "@/constants/colors";
import type { Goal } from "@/features/goal/types/goal";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { goals, isRefreshing, refresh, pullRefresh, deleteGoal } = useGoals();
  const navigation = useNavigation();

  const handleDelete = useCallback(async (goal: Goal) => {
    const result = await deleteGoal(goal);
    result.match({
      ok: () => {},
      err: () => Alert.alert(t("error.deleteFailed")),
    });
  }, [deleteGoal, t]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push("/goal/create")}>
          <SymbolView name="plus" size={22} tintColor={Colors.systemBlue} />
        </Pressable>
      ),
    });
  }, [navigation]);

  // 画面フォーカス時はサイレントリフレッシュ（スピナーなし）
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <GoalList
      goals={goals}
      onRefresh={pullRefresh}
      isRefreshing={isRefreshing}
      onDelete={handleDelete}
    />
  );
}
