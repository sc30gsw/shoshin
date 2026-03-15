import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Result } from "better-result";
import type { Goal, GoalFormData } from "@/features/goal/types/goal";
import { NotificationScheduleError } from "@/errors";

const CHANNEL_ID = "goal-reminders";

// Conservative max days per month (uses 28 for February — safe for all years)
const MONTH_MAX_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function clampDayToMonth(day: number, month: number): number {
  return Math.min(day, MONTH_MAX_DAYS[month - 1]);
}

/** Parse notification_id stored as either a single ID or JSON array of IDs */
function parseNotificationIds(notificationId: string): string[] {
  if (notificationId.startsWith("[")) {
    return Result.try({
      try: () => JSON.parse(notificationId) as string[],
      catch: () => new Error("parse failed"),
    }).unwrapOr([]);
  }
  return [notificationId];
}

export async function setupNotificationChannel(): Promise<void> {
  if (process.env.EXPO_OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Goal Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleGoalReminder(
  data: GoalFormData,
  title: string,
  body: string
): Promise<Result<string | null, NotificationScheduleError>> {
  return Result.tryPromise({
    try: async () => {
      const granted = await requestNotificationPermissions();
      if (!granted) return null;

      const content: Notifications.NotificationContentInput = {
        title,
        body,
        data: { type: "goal-reminder" },
        sound: true,
      };

      // Daily / Weekly: single trigger
      if (data.reminder_interval === "daily") {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: SchedulableTriggerInputTypes.DAILY,
            hour: data.reminder_hour,
            minute: data.reminder_minute,
          },
        });
        return id;
      }

      if (data.reminder_interval === "weekly") {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: SchedulableTriggerInputTypes.WEEKLY,
            weekday: data.reminder_weekday,
            hour: data.reminder_hour,
            minute: data.reminder_minute,
          },
        });
        return id;
      }

      // Monthly: days 1-28 → single MONTHLY trigger
      //          days 29-31 → 12 YEARLY triggers (one per month, clamped to last day)
      if (data.reminder_interval === "monthly") {
        if (data.reminder_day <= 28) {
          const id = await Notifications.scheduleNotificationAsync({
            content,
            trigger: {
              type: SchedulableTriggerInputTypes.MONTHLY,
              day: data.reminder_day,
              hour: data.reminder_hour,
              minute: data.reminder_minute,
            },
          });
          return id;
        }

        // Schedule 12 yearly notifications, each clamped to the last valid day of that month
        const ids: string[] = [];
        for (let month = 1; month <= 12; month++) {
          const day = clampDayToMonth(data.reminder_day, month);
          const id = await Notifications.scheduleNotificationAsync({
            content,
            trigger: {
              type: SchedulableTriggerInputTypes.YEARLY,
              month,
              day,
              hour: data.reminder_hour,
              minute: data.reminder_minute,
            },
          });
          ids.push(id);
        }
        return JSON.stringify(ids);
      }

      return null;
    },
    catch: (cause) => new NotificationScheduleError({ cause }),
  });
}

export async function cancelGoalReminder(
  notificationId: string | null
): Promise<Result<void, NotificationScheduleError>> {
  if (!notificationId) return Result.ok(undefined);
  return Result.tryPromise({
    try: async () => {
      const ids = parseNotificationIds(notificationId);
      await Promise.all(
        ids.map((id) =>
          Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
        )
      );
    },
    catch: (cause) => new NotificationScheduleError({ cause }),
  });
}

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function getGoalIdFromNotification(
  response: Notifications.NotificationResponse
): number | null {
  const data = response.notification.request.content.data;
  if (data && typeof data.goalId === "number") return data.goalId;
  return null;
}

export async function rescheduleGoalReminder(
  goal: Goal,
  newData: GoalFormData,
  title: string,
  body: string
): Promise<Result<string | null, NotificationScheduleError>> {
  const cancelResult = await cancelGoalReminder(goal.notification_id);
  if (Result.isError(cancelResult)) return cancelResult;
  if (!newData.is_active) return Result.ok(null);
  return scheduleGoalReminder(newData, title, body);
}
