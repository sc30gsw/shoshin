import { useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Result } from "better-result";
import type { Goal, GoalFormData } from "@/features/goal/types/goal";
import { DatabaseError } from "@/errors";
import { nowISO } from "@/libs/date";

export function useGoalRepository() {
  const db = useSQLiteContext();

  const mapGoal = (row: Goal): Goal => ({ ...row, goal: row.goal || null });

  const findAll = useCallback(async (): Promise<Result<Goal[], DatabaseError>> => {
    return Result.tryPromise({
      try: async () => {
        const rows = await db.getAllAsync<Goal>("SELECT * FROM goals ORDER BY created_at DESC");
        return rows.map(mapGoal);
      },
      catch: (cause) => new DatabaseError({ operation: "findAll", cause }),
    });
  }, [db]);

  const findById = useCallback(async (id: number): Promise<Result<Goal | null, DatabaseError>> => {
    return Result.tryPromise({
      try: async () => {
        const row = await db.getFirstAsync<Goal>("SELECT * FROM goals WHERE id = ?", [id]);
        return row ? mapGoal(row) : null;
      },
      catch: (cause) => new DatabaseError({ operation: "findById", cause }),
    });
  }, [db]);

  const create = useCallback(async (
    data: GoalFormData,
    notificationId: string | null
  ): Promise<Result<number, DatabaseError>> => {
    return Result.tryPromise({
      try: async () => {
        const now = nowISO();
        const result = await db.runAsync(
          `INSERT INTO goals (
            name, goal, why, category, target_date,
            reminder_interval, reminder_hour, reminder_minute,
            reminder_weekday, reminder_day,
            is_active, notification_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          data.name,
          data.goal ?? "",
          data.why,
          data.category,
          data.target_date ?? null,
          data.reminder_interval,
          data.reminder_hour,
          data.reminder_minute,
          data.reminder_weekday,
          data.reminder_day,
          data.is_active ? 1 : 0,
          notificationId,
          now,
          now
        );
        return result.lastInsertRowId;
      },
      catch: (cause) => new DatabaseError({ operation: "create", cause }),
    });
  }, [db]);

  const update = useCallback(async (
    id: number,
    data: GoalFormData,
    notificationId: string | null
  ): Promise<Result<void, DatabaseError>> => {
    return Result.tryPromise({
      try: async () => {
        const now = nowISO();
        await db.runAsync(
          `UPDATE goals SET
            name = ?, goal = ?, why = ?, category = ?, target_date = ?,
            reminder_interval = ?, reminder_hour = ?, reminder_minute = ?,
            reminder_weekday = ?, reminder_day = ?,
            is_active = ?, notification_id = ?, updated_at = ?
          WHERE id = ?`,
          data.name,
          data.goal ?? "",
          data.why,
          data.category,
          data.target_date ?? null,
          data.reminder_interval,
          data.reminder_hour,
          data.reminder_minute,
          data.reminder_weekday,
          data.reminder_day,
          data.is_active ? 1 : 0,
          notificationId,
          now,
          id
        );
      },
      catch: (cause) => new DatabaseError({ operation: "update", cause }),
    });
  }, [db]);

  const remove = useCallback(async (id: number): Promise<Result<void, DatabaseError>> => {
    return Result.tryPromise({
      try: async () => {
        await db.runAsync("DELETE FROM goals WHERE id = ?", [id]);
      },
      catch: (cause) => new DatabaseError({ operation: "remove", cause }),
    });
  }, [db]);

  return { findAll, findById, create, update, remove };
}
