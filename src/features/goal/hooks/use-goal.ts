import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useGoalRepository } from "@/features/goal/db/goal-repository";

export function useGoal(id: number) {
  const { t } = useTranslation();
  const { findById } = useGoalRepository();

  const { data: goal = null, isPending, refetch } = useQuery({
    queryKey: ["goal", id],
    queryFn: async () => {
      const result = await findById(id);
      return result.unwrap();
    },
    throwOnError: () => {
      Alert.alert(t("error.loadFailed"));
      return false;
    },
  });

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return { goal, isLoading: isPending, refresh };
}
