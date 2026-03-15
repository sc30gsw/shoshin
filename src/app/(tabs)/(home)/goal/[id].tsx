import React, { useCallback, useLayoutEffect } from "react";
import { Alert, Pressable, View, Text, ActivityIndicator } from "react-native";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { GoalDetail } from "@/features/goal/components/goal-detail";
import { useGoal } from "@/features/goal/hooks/use-goal";
import { useGoals } from "@/features/goal/hooks/use-goals";
import { Colors } from "@/constants/colors";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goalId = Number(id);
  const { t } = useTranslation();
  const { goal, isLoading, refresh } = useGoal(goalId);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );
  const { deleteGoal } = useGoals();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (!goal) return;
    navigation.setOptions({
      title: goal.name,
      headerRight: () => (
        <Pressable onPress={() => router.push(`/goal/edit/${goalId}`)}>
          <SymbolView name="pencil" size={20} tintColor={Colors.systemBlue} />
        </Pressable>
      ),
    });
  }, [goal, goalId, navigation]);

  const handleDelete = () => {
    Alert.alert(t("goal.deleteConfirm"), t("goal.deleteConfirmMessage"), [
      { text: t("goal.cancel"), style: "cancel" },
      {
        text: t("goal.delete"),
        style: "destructive",
        onPress: async () => {
          if (!goal) return;
          const result = await deleteGoal(goal);
          result.match({
            ok: () => router.back(),
            err: () => Alert.alert(t("error.deleteFailed")),
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.secondarySystemBackground }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.secondarySystemBackground }}>
        <Text style={{ color: Colors.secondaryLabel }}>{t("error.loadFailed")}</Text>
      </View>
    );
  }

  return <GoalDetail goal={goal} onDelete={handleDelete} />;
}
