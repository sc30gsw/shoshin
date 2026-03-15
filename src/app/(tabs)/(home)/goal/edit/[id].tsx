import React, { useTransition } from "react";
import { Alert, View, Text, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { GoalForm, goalToFormData } from "@/features/goal/components/goal-form";
import { useGoal } from "@/features/goal/hooks/use-goal";
import { useGoals } from "@/features/goal/hooks/use-goals";
import { Colors } from "@/constants/colors";
import type { GoalFormData } from "@/features/goal/types/goal";

export default function EditGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goalId = Number(id);
  const { t } = useTranslation();
  const { goal, isLoading } = useGoal(goalId);
  const { updateGoal } = useGoals();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (data: GoalFormData) => {
    if (!goal) return;
    startTransition(async () => {
      const title = t("reminder.notification.title");
      const body = t("reminder.notification.body", { name: data.name, why: data.why });
      const result = await updateGoal(goalId, data, goal, title, body);
      result.match({
        ok: () => router.back(),
        err: () => Alert.alert(t("error.saveFailed")),
      });
    });
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

  return (
    <GoalForm
      defaultValues={goalToFormData(goal)}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      isEditing
    />
  );
}
