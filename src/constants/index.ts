import { Colors, HexColors } from "./colors";

export const CATEGORIES = [
  { value: "skill", labelKey: "category.skill" },
  { value: "habit", labelKey: "category.habit" },
  { value: "qualification", labelKey: "category.qualification" },
  { value: "learning", labelKey: "category.learning" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const REMINDER_INTERVALS = [
  { value: "daily", labelKey: "reminder.daily" },
  { value: "weekly", labelKey: "reminder.weekly" },
  { value: "monthly", labelKey: "reminder.monthly" },
] as const;

export type ReminderIntervalValue = (typeof REMINDER_INTERVALS)[number]["value"];

export const CATEGORY_COLORS: Record<CategoryValue, string> = {
  skill: HexColors.systemBlue,
  habit: HexColors.systemGreen,
  qualification: HexColors.systemOrange,
  learning: HexColors.systemPurple,
};

export const CATEGORY_PLATFORM_COLORS: Record<CategoryValue, typeof Colors.systemBlue> = {
  skill: Colors.systemBlue,
  habit: Colors.systemGreen,
  qualification: Colors.systemOrange,
  learning: Colors.systemPurple,
};

export const CATEGORY_ICONS: Record<CategoryValue, string> = {
  skill: "wrench.and.screwdriver",
  habit: "arrow.clockwise.circle",
  qualification: "rosette",
  learning: "book.fill",
};

// テキスト・ラベル用: ホワイト背景でも読めるよう一部を暗くした版
export const CATEGORY_TEXT_COLORS: Record<CategoryValue, string> = {
  skill: "#007AFF",
  habit: "#1A8A34",    // #34C759 はコントラスト不足 → 暗めの緑
  qualification: "#C47200",
  learning: "#8944B8",
};

export const WEEKDAYS = [
  { value: 1, labelKey: "weekday.sun" },
  { value: 2, labelKey: "weekday.mon" },
  { value: 3, labelKey: "weekday.tue" },
  { value: 4, labelKey: "weekday.wed" },
  { value: 5, labelKey: "weekday.thu" },
  { value: 6, labelKey: "weekday.fri" },
  { value: 7, labelKey: "weekday.sat" },
] as const;

export const WEEKDAY_KEYS = ["", "sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
