import { format } from "@formkit/tempo";
import { Result } from "better-result";

/** ISO 8601 文字列 → ロケール対応の日付表示（例: "2025年3月15日"） */
export function formatDate(dateStr: string, locale?: string): string {
  if (!dateStr) return "";
  return Result.try({
    try: () => format(dateStr, "medium", locale ?? "ja"),
    catch: () => new Error("format failed"),
  }).unwrapOr(dateStr);
}

/** 時・分 → "09:00" 形式 */
export function formatTime(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return format(date, "HH:mm");
}

/** 現在時刻の ISO 8601 文字列 */
export function nowISO(): string {
  return new Date().toISOString();
}
