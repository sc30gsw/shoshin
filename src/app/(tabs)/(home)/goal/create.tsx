import React, { useTransition } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { GoalForm } from "@/features/goal/components/goal-form";
import { useGoals } from "@/features/goal/hooks/use-goals";
import type { GoalFormData } from "@/features/goal/types/goal";

export default function CreateGoalScreen() {
  const { t } = useTranslation();
  const { createGoal } = useGoals();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (data: GoalFormData) => {
    startTransition(async () => {
      const title = t("reminder.notification.title");
      const body = t("reminder.notification.body", {
        name: data.name,
        why: data.why,
      });
      const result = await createGoal(data, title, body);
      result.match({
        ok: (id) => router.replace(`/goal/${id}`),
        err: () => Alert.alert(t("error.saveFailed")),
      });
    });
  };

  return <GoalForm onSubmit={handleSubmit} isSubmitting={isPending} />;
}
