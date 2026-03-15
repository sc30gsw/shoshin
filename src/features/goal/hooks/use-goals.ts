import { useCallback } from "react";
import { Alert } from "react-native";
import { Result } from "better-result";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGoalRepository } from "@/features/goal/db/goal-repository";
import type { Goal, GoalFormData } from "@/features/goal/types/goal";
import {
  scheduleGoalReminder,
  cancelGoalReminder,
  rescheduleGoalReminder,
} from "@/features/notification/services/notification-service";
import type { DatabaseError, NotificationScheduleError } from "@/errors";

export function useGoals() {
  const { t } = useTranslation();
  const { findAll, create, update, remove } = useGoalRepository();
  const queryClient = useQueryClient();

  const { data: goals = [], isPending, isFetching, refetch } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const result = await findAll();
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

  const pullRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const createGoalMutation = useMutation({
    mutationFn: async ({
      data,
      notificationTitle,
      notificationBody,
    }: {
      data: GoalFormData;
      notificationTitle: string;
      notificationBody: string;
    }): Promise<Result<number, DatabaseError | NotificationScheduleError>> => {
      return Result.gen(async function* () {
        const notificationId = data.is_active
          ? yield* Result.await(scheduleGoalReminder(data, notificationTitle, notificationBody))
          : null;
        const id = yield* Result.await(create(data, notificationId));
        return Result.ok(id);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const createGoal = useCallback(
    (
      data: GoalFormData,
      notificationTitle: string,
      notificationBody: string
    ): Promise<Result<number, DatabaseError | NotificationScheduleError>> => {
      return createGoalMutation.mutateAsync({ data, notificationTitle, notificationBody });
    },
    [createGoalMutation]
  );

  const updateGoalMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      existingGoal,
      notificationTitle,
      notificationBody,
    }: {
      id: number;
      data: GoalFormData;
      existingGoal: Goal;
      notificationTitle: string;
      notificationBody: string;
    }): Promise<Result<void, DatabaseError | NotificationScheduleError>> => {
      return Result.gen(async function* () {
        const notificationId = yield* Result.await(
          rescheduleGoalReminder(existingGoal, data, notificationTitle, notificationBody)
        );
        yield* Result.await(update(id, data, notificationId));
        return Result.ok(undefined as void);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const updateGoal = useCallback(
    (
      id: number,
      data: GoalFormData,
      existingGoal: Goal,
      notificationTitle: string,
      notificationBody: string
    ): Promise<Result<void, DatabaseError | NotificationScheduleError>> => {
      return updateGoalMutation.mutateAsync({ id, data, existingGoal, notificationTitle, notificationBody });
    },
    [updateGoalMutation]
  );

  const deleteGoalMutation = useMutation({
    mutationFn: async (
      goal: Goal
    ): Promise<Result<void, DatabaseError | NotificationScheduleError>> => {
      return Result.gen(async function* () {
        yield* Result.await(cancelGoalReminder(goal.notification_id));
        yield* Result.await(remove(goal.id));
        return Result.ok(undefined as void);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const deleteGoal = useCallback(
    (goal: Goal): Promise<Result<void, DatabaseError | NotificationScheduleError>> => {
      return deleteGoalMutation.mutateAsync(goal);
    },
    [deleteGoalMutation]
  );

  return {
    goals,
    isLoading: isPending,
    isRefreshing: isFetching,
    refresh,
    pullRefresh,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}
