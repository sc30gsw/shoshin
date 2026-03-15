import React, { useRef } from "react";
import { ScrollView, View, Text, TextInput, Pressable, Switch, useWindowDimensions } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { useTranslation } from "react-i18next";
import { SymbolView } from "expo-symbols";
import { GoalSchema, type GoalFormData } from "@/features/goal/types/goal";
import { CATEGORIES, REMINDER_INTERVALS, WEEKDAYS, CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_TEXT_COLORS } from "@/constants";
import { Colors, HexColors } from "@/constants/colors";
import type { Goal } from "@/features/goal/types/goal";

interface GoalFormProps {
  defaultValues?: Partial<GoalFormData>;
  onSubmit: (data: GoalFormData) => Promise<void>;
  isSubmitting?: boolean;
  /** 編集モード: true の場合、非アクティブでもリマインダー設定を表示（グレーアウト） */
  isEditing?: boolean;
}

const DEFAULT_VALUES: GoalFormData = {
  name: "",
  goal: undefined,
  why: "",
  category: "skill",
  target_date: undefined,
  reminder_interval: "daily",
  reminder_hour: 9,
  reminder_minute: 0,
  reminder_weekday: 2,
  reminder_day: 1,
  is_active: true,
};

// ─── Reminder detail sub-components (純粋 value+callback コンポーネント) ──

function WeekdayCalendar({
  value,
  onChange,
  t,
}: {
  value: number;
  onChange: (v: number) => void;
  t: ReturnType<typeof import("react-i18next").useTranslation>["t"];
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: Colors.label, fontWeight: "500", fontSize: 14 }}>
        {t("goal.reminderWeekday")}
      </Text>
      <View
        style={{
          backgroundColor: Colors.tertiarySystemBackground,
          borderRadius: 16,
          borderCurve: "continuous",
          paddingHorizontal: 8,
          paddingVertical: 12,
          flexDirection: "row",
        }}
      >
        {WEEKDAYS.map((wd) => {
          const isSelected = value === wd.value;
          return (
            <Pressable
              key={wd.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(wd.value);
              }}
              style={{ flex: 1, alignItems: "center" }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isSelected ? Colors.systemBlue : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: isSelected ? "700" : "400",
                    color: isSelected ? "white" : Colors.label,
                  }}
                >
                  {t(wd.labelKey)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Days that don't exist in all months (Feb has max 28/29 days)
const SHORT_MONTH_DAYS = new Set([29, 30, 31]);

function MonthDayCalendar({
  value,
  onChange,
  t,
}: {
  value: number;
  onChange: (v: number) => void;
  t: ReturnType<typeof import("react-i18next").useTranslation>["t"];
}) {
  const { width } = useWindowDimensions();
  // 7 cells per row, accounting for 16px outer padding on each side + 12px card padding
  const cellSize = Math.floor((width - 32 - 24) / 7);

  const rows: number[][] = [];
  for (let i = 0; i < 31; i += 7) {
    rows.push(Array.from({ length: 7 }, (_, j) => i + j + 1).filter((d) => d <= 31));
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: Colors.label, fontWeight: "500", fontSize: 14 }}>
        {t("goal.reminderDay")}
      </Text>
      <>
        <View
          style={{
            backgroundColor: Colors.tertiarySystemBackground,
            borderRadius: 16,
            borderCurve: "continuous",
            padding: 12,
            gap: 4,
          }}
        >
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={{ flexDirection: "row" }}>
              {row.map((d) => {
                const isSelected = value === d;
                const isShortMonthDay = SHORT_MONTH_DAYS.has(d);
                const idleColor = isShortMonthDay ? Colors.systemOrange : Colors.label;
                return (
                  <Pressable
                    key={d}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onChange(d);
                    }}
                    style={{ width: cellSize, alignItems: "center", paddingVertical: 2 }}
                  >
                    <View
                      style={{
                        width: Math.min(cellSize - 4, 36),
                        height: Math.min(cellSize - 4, 36),
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected
                          ? isShortMonthDay
                            ? Colors.systemOrange
                            : Colors.systemBlue
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isSelected ? "700" : "400",
                          color: isSelected ? "white" : idleColor,
                        }}
                      >
                        {d}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
              {/* Fill empty cells in last row */}
              {row.length < 7 &&
                Array.from({ length: 7 - row.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={{ width: cellSize }} />
                ))}
            </View>
          ))}

          {/* Legend */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8, paddingHorizontal: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.systemOrange }} />
            <Text style={{ fontSize: 11, color: Colors.secondaryLabel }}>
              = 存在しない月がある
            </Text>
          </View>
        </View>

        {/* Auto-adjust annotation shown when a short-month day is selected */}
        {SHORT_MONTH_DAYS.has(value) && (
          <View
            style={{
              gap: 6,
              backgroundColor: `${HexColors.systemOrange}15`,
              borderRadius: 10,
              borderCurve: "continuous",
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <SymbolView name="info.circle.fill" size={13} tintColor={Colors.systemOrange} />
              <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.systemOrange }}>
                {t("reminder.dayAdjustLabel")}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 4 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.systemOrange }} />
              <Text style={{ fontSize: 12, color: Colors.systemOrange }}>
                {t("reminder.dayAdjustFeb")}
              </Text>
            </View>
            {value === 31 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 4 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.systemOrange }} />
                <Text style={{ fontSize: 12, color: Colors.systemOrange }}>
                  {t("reminder.dayAdjustShortMonths")}
                </Text>
              </View>
            )}
          </View>
        )}
      </>
    </View>
  );
}

function ReminderDetailSection({
  selectedInterval,
  hourValue,
  minuteValue,
  onTimeChange,
  weekdayValue,
  onWeekdayChange,
  dayValue,
  onDayChange,
  t,
}: {
  selectedInterval: string;
  hourValue: number;
  minuteValue: number;
  onTimeChange: (hour: number, minute: number) => void;
  weekdayValue: number;
  onWeekdayChange: (v: number) => void;
  dayValue: number;
  onDayChange: (v: number) => void;
  t: ReturnType<typeof import("react-i18next").useTranslation>["t"];
}) {
  const pickerDate = new Date();
  pickerDate.setHours(hourValue, minuteValue, 0, 0);

  return (
    <>
      {/* Native time picker — compact popover, all intervals */}
      <View style={{ gap: 8 }}>
        <Text style={{ color: Colors.label, fontWeight: "500", fontSize: 14 }}>
          {t("goal.reminderHour")}
        </Text>
        <View
          style={{
            backgroundColor: Colors.tertiarySystemBackground,
            borderRadius: 16,
            borderCurve: "continuous",
            paddingHorizontal: 16,
            paddingVertical: 4,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: Colors.secondaryLabel, fontSize: 14 }}>
            {t("goal.reminderHour")}
          </Text>
          <DateTimePicker
            value={pickerDate}
            mode="time"
            display="compact"
            minuteInterval={1}
            onChange={(_, selected) => {
              if (!selected) return;
              onTimeChange(selected.getHours(), selected.getMinutes());
            }}
          />
        </View>
      </View>

      {/* Weekly — weekday calendar */}
      {selectedInterval === "weekly" && (
        <WeekdayCalendar value={weekdayValue} onChange={onWeekdayChange} t={t} />
      )}

      {/* Monthly — day-of-month calendar grid */}
      {selectedInterval === "monthly" && (
        <MonthDayCalendar value={dayValue} onChange={onDayChange} t={t} />
      )}
    </>
  );
}

// ───────────────────────────────────────────────────────────────────────────

export function GoalForm({ defaultValues, onSubmit, isSubmitting, isEditing = false }: GoalFormProps) {
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues } as GoalFormData,
    validators: {
      onSubmit: GoalSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const selectedCategory = useStore(form.store, (s) => s.values.category);
  const selectedInterval = useStore(form.store, (s) => s.values.reminder_interval);
  const isActive = useStore(form.store, (s) => s.values.is_active);
  const categoryColor = CATEGORY_COLORS[selectedCategory];
  const categoryTextColor = CATEGORY_TEXT_COLORS[selectedCategory];
  const categoryIcon = CATEGORY_ICONS[selectedCategory];

  // 初期の is_active 値を記録（編集モードで初期OFFのゴールを非表示にするため）
  const initialIsActive = useRef(defaultValues?.is_active ?? DEFAULT_VALUES.is_active).current;
  // 登録モード: 非アクティブならリマインダー設定を非表示
  // 編集モード: 初期ONまたは現在ONなら表示、初期ONで現在OFFなら非活性
  const showReminderSection = isEditing ? (initialIsActive || isActive) : isActive;
  const reminderDisabled = isEditing && !!initialIsActive && !isActive;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.secondarySystemBackground }}
      contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 48 }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      {/* Name */}
      <View style={{ gap: 8 }}>
        <Text style={{ color: Colors.label, fontWeight: "500", fontSize: 14 }}>
          {t("goal.name")}
        </Text>
        <form.Field name="name">
          {(field) => (
            <>
              <TextInput
                style={{
                  backgroundColor: Colors.tertiarySystemBackground,
                  borderRadius: 12,
                  borderCurve: "continuous",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: Colors.label,
                  fontSize: 16,
                }}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder={t("goal.namePlaceholder")}
                placeholderTextColor={Colors.tertiaryLabel}
                returnKeyType="next"
              />
              {field.state.meta.errorMap.onSubmit != null && (
                <Text style={{ color: Colors.systemRed, fontSize: 12 }}>
                  {t(String(field.state.meta.errorMap.onSubmit))}
                </Text>
              )}
            </>
          )}
        </form.Field>
      </View>

      {/* Goal (optional) */}
      <View style={{ gap: 8 }}>
        <Text style={{ color: Colors.label, fontWeight: "500", fontSize: 14 }}>
          {t("goal.goal")}
        </Text>
        <form.Field name="goal">
          {(field) => (
            <TextInput
              style={{
                backgroundColor: Colors.tertiarySystemBackground,
                borderRadius: 12,
                borderCurve: "continuous",
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: Colors.label,
                fontSize: 16,
                minHeight: 80,
                textAlignVertical: "top",
              }}
              value={field.state.value ?? ""}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("goal.goalPlaceholder")}
              placeholderTextColor={Colors.tertiaryLabel}
              multiline
              numberOfLines={3}
            />
          )}
        </form.Field>
      </View>

      {/* WHY — core feature */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              borderCurve: "continuous",
              backgroundColor: `${categoryColor}20`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SymbolView name={categoryIcon as any} size={14} tintColor={categoryTextColor} />
          </View>
          <Text style={{ color: categoryTextColor, fontWeight: "600", fontSize: 14 }}>
            {t("goal.why")}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: `${categoryColor}30` }} />
        </View>
        <form.Field name="why">
          {(field) => (
            <>
              <TextInput
                style={{
                  backgroundColor: `${categoryColor}0D`,
                  borderRadius: 12,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: `${categoryColor}30`,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: Colors.label,
                  fontSize: 16,
                  minHeight: 120,
                  textAlignVertical: "top",
                }}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder={t("goal.whyPlaceholder")}
                placeholderTextColor={Colors.tertiaryLabel}
                multiline
                numberOfLines={5}
              />
              {field.state.meta.errorMap.onSubmit != null && (
                <Text style={{ color: Colors.systemRed, fontSize: 12 }}>
                  {t(String(field.state.meta.errorMap.onSubmit))}
                </Text>
              )}
            </>
          )}
        </form.Field>
      </View>

      {/* Category */}
      <View style={{ gap: 8 }}>
        <Text style={{ color: Colors.label, fontWeight: "500", fontSize: 14 }}>
          {t("goal.category")}
        </Text>
        <form.Field name="category">
          {(field) => (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map((cat) => {
                const isSelected = field.state.value === cat.value;
                const color = CATEGORY_COLORS[cat.value];
                return (
                  <Pressable
                    key={cat.value}
                    onPress={() => field.handleChange(cat.value)}
                    style={{
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderWidth: 1,
                      backgroundColor: isSelected ? `${color}20` : "transparent",
                      borderColor: isSelected ? color : Colors.separator,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: isSelected ? color : Colors.secondaryLabel,
                      }}
                    >
                      {t(cat.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </form.Field>
      </View>

      {/* Active toggle */}
      <View
        style={{
          backgroundColor: Colors.tertiarySystemBackground,
          borderRadius: 16,
          borderCurve: "continuous",
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              borderCurve: "continuous",
              backgroundColor: isActive ? `${HexColors.systemBlue}18` : `${HexColors.systemGray}18`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SymbolView
              name={isActive ? "bell.fill" : "bell.slash.fill"}
              size={16}
              tintColor={isActive ? Colors.systemBlue : Colors.systemGray}
            />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={{ color: Colors.label, fontWeight: "500", fontSize: 15 }}>
              {t("goal.active")}
            </Text>
            <Text style={{ color: Colors.secondaryLabel, fontSize: 12 }}>
              {t("goal.activeDescription")}
            </Text>
          </View>
        </View>
        <form.Field name="is_active">
          {(field) => (
            <Switch value={field.state.value} onValueChange={field.handleChange} />
          )}
        </form.Field>
      </View>

      {/* リマインダー設定セクション */}
      {showReminderSection && (
        <Animated.View
          entering={FadeInDown.duration(240)}
          exiting={FadeOutUp.duration(200)}
          layout={LinearTransition}
          style={{ gap: 20, opacity: reminderDisabled ? 0.4 : 1 }}
          pointerEvents={reminderDisabled ? "none" : "auto"}
        >
          {/* Reminder Interval */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.label, fontWeight: "500", fontSize: 14 }}>
              {t("goal.reminderInterval")}
            </Text>
            <form.Field name="reminder_interval">
              {(field) => (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {REMINDER_INTERVALS.map((interval) => {
                    const isSelected = field.state.value === interval.value;
                    return (
                      <Pressable
                        key={interval.value}
                        onPress={() => field.handleChange(interval.value)}
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          borderCurve: "continuous",
                          paddingVertical: 12,
                          alignItems: "center",
                          borderWidth: 1,
                          backgroundColor: isSelected ? Colors.systemBlue : Colors.tertiarySystemBackground,
                          borderColor: isSelected ? Colors.systemBlue : Colors.separator,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: isSelected ? "white" : Colors.secondaryLabel,
                          }}
                        >
                          {t(interval.labelKey)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </form.Field>
          </View>

          {/* Reminder detail — form.Field wrappers extract values for ReminderDetailSection */}
          <form.Field name="reminder_hour">
            {(hourField) => (
              <form.Field name="reminder_minute">
                {(minuteField) => (
                  <form.Field name="reminder_weekday">
                    {(weekdayField) => (
                      <form.Field name="reminder_day">
                        {(dayField) => (
                          <ReminderDetailSection
                            selectedInterval={selectedInterval}
                            hourValue={hourField.state.value}
                            minuteValue={minuteField.state.value}
                            onTimeChange={(h, m) => {
                              hourField.handleChange(h);
                              minuteField.handleChange(m);
                            }}
                            weekdayValue={weekdayField.state.value}
                            onWeekdayChange={weekdayField.handleChange}
                            dayValue={dayField.state.value}
                            onDayChange={dayField.handleChange}
                            t={t}
                          />
                        )}
                      </form.Field>
                    )}
                  </form.Field>
                )}
              </form.Field>
            )}
          </form.Field>
        </Animated.View>
      )}

      {/* Submit */}
      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: Colors.systemBlue,
              borderRadius: 16,
              borderCurve: "continuous",
              paddingVertical: 16,
              alignItems: "center",
              opacity: pressed || isSubmitting ? 0.7 : 1,
            })}
            onPress={form.handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              {t("goal.save")}
            </Text>
          </Pressable>
        )}
      </form.Subscribe>
    </ScrollView>
  );
}

export function goalToFormData(goal: Goal): GoalFormData {
  return {
    name: goal.name,
    goal: goal.goal ?? undefined,
    why: goal.why,
    category: goal.category,
    target_date: goal.target_date ?? undefined,
    reminder_interval: goal.reminder_interval,
    reminder_hour: goal.reminder_hour,
    reminder_minute: goal.reminder_minute,
    reminder_weekday: goal.reminder_weekday,
    reminder_day: goal.reminder_day,
    is_active: Boolean(goal.is_active),
  };
}
