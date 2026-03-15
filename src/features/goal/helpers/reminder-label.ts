import type { TFunction } from "i18next";
import { WEEKDAY_KEYS } from "@/constants";
import { formatTime } from "@/libs/date";

export function formatReminderLabel(
  t: TFunction,
  interval: string,
  hour: number,
  minute: number,
  weekday: number,
  day: number
): string {
  const time = formatTime(hour, minute);
  switch (interval) {
    case "daily":
      return `${t("reminder.daily")} ${time}`;
    case "weekly":
      return `${t("reminder.weekly")}${t(`weekday.${WEEKDAY_KEYS[weekday]}`)} ${time}`;
    case "monthly":
      return `${t("reminder.monthly")}${day}${t("reminder.daySuffix")} ${time}`;
    default:
      return time;
  }
}
