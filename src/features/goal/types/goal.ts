import * as v from "valibot";
import type { CategoryValue, ReminderIntervalValue } from "@/constants";

export const GoalSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "validation.required")),
  goal: v.optional(v.string()),
  why: v.pipe(v.string(), v.minLength(1, "validation.required")),
  category: v.picklist(["skill", "habit", "qualification", "learning"]),
  target_date: v.optional(v.string()),
  reminder_interval: v.picklist(["daily", "weekly", "monthly"]),
  reminder_hour: v.pipe(v.number(), v.minValue(0), v.maxValue(23)),
  reminder_minute: v.pipe(v.number(), v.minValue(0), v.maxValue(59)),
  reminder_weekday: v.pipe(v.number(), v.minValue(1), v.maxValue(7)),
  reminder_day: v.pipe(v.number(), v.minValue(1), v.maxValue(31)),
  is_active: v.boolean(),
});

export type GoalFormData = v.InferInput<typeof GoalSchema>;

export interface Goal {
  id: number;
  name: string;
  goal: string | null;
  why: string;
  category: CategoryValue;
  target_date: string | null;
  reminder_interval: ReminderIntervalValue;
  reminder_hour: number;
  reminder_minute: number;
  reminder_weekday: number;
  reminder_day: number;
  is_active: number;
  notification_id: string | null;
  created_at: string;
  updated_at: string;
}
