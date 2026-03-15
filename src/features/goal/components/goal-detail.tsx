import React from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { WhyCard } from "./why-card";
import { CategoryBadge } from "./category-badge";
import { Colors, HexColors } from "@/constants/colors";
import { CATEGORY_COLORS, CATEGORY_PLATFORM_COLORS } from "@/constants";
import type { Goal } from "@/features/goal/types/goal";
import { formatReminderLabel } from "@/features/goal/helpers/reminder-label";
import { formatDate } from "@/libs/date";

interface GoalDetailProps {
  goal: Goal;
  onDelete?: () => void;
}

function InfoRow({
  icon,
  label,
  value,
  iconColor = Colors.systemBlue,
  iconBgHex = HexColors.systemBlue,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor?: typeof Colors.systemBlue;
  iconBgHex?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          borderCurve: "continuous",
          backgroundColor: `${iconBgHex}18`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SymbolView name={icon as any} size={16} tintColor={iconColor} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: Colors.secondaryLabel, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: Colors.label, fontSize: 14, lineHeight: 20 }} selectable>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function GoalDetail({ goal, onDelete }: GoalDetailProps) {
  const { t } = useTranslation();

  const catColor = CATEGORY_PLATFORM_COLORS[goal.category];
  const catHex = CATEGORY_COLORS[goal.category];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.secondarySystemBackground }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* WHY Card */}
      <WhyCard why={goal.why} goalName={goal.name} category={goal.category} />

      {/* Goal info */}
      {goal.goal && (
        <View
          style={{
            backgroundColor: Colors.tertiarySystemBackground,
            borderRadius: 16,
            borderCurve: "continuous",
            padding: 16,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: Colors.label, fontWeight: "600", fontSize: 16 }}>
              {t("goal.goal")}
            </Text>
            <CategoryBadge category={goal.category} />
          </View>
          <Text style={{ color: Colors.label, fontSize: 14, lineHeight: 20 }} selectable>
            {goal.goal}
          </Text>
        </View>
      )}

      {/* Details */}
      <View
        style={{
          backgroundColor: Colors.tertiarySystemBackground,
          borderRadius: 16,
          borderCurve: "continuous",
          paddingHorizontal: 16,
        }}
      >
        {goal.is_active ? (
          <>
            <InfoRow
              icon="bell.fill"
              label={t("goal.reminderInterval")}
              value={formatReminderLabel(t, goal.reminder_interval, goal.reminder_hour, goal.reminder_minute, goal.reminder_weekday, goal.reminder_day)}
              iconColor={catColor}
              iconBgHex={catHex}
            />
            <View style={{ height: 1, backgroundColor: Colors.separator, marginLeft: 44 }} />
          </>
        ) : null}

        <InfoRow
          icon={goal.is_active ? "checkmark.circle.fill" : "xmark.circle.fill"}
          label={t("goal.active")}
          value={goal.is_active ? "ON" : "OFF"}
          iconColor={catColor}
          iconBgHex={catHex}
        />

        {goal.target_date && (
          <>
            <View style={{ height: 1, backgroundColor: Colors.separator, marginLeft: 44 }} />
            <InfoRow
              icon="calendar"
              label={t("goal.targetDate")}
              value={formatDate(goal.target_date)}
              iconColor={catColor}
              iconBgHex={catHex}
            />
          </>
        )}

        <View style={{ height: 1, backgroundColor: Colors.separator, marginLeft: 44 }} />

        <InfoRow
          icon="clock"
          label={t("goal.created")}
          value={formatDate(goal.created_at)}
          iconColor={catColor}
          iconBgHex={catHex}
        />
      </View>

      {/* Delete button — inside scroll to avoid tab bar overlap */}
      {onDelete && (
        <Pressable
          style={({ pressed }) => ({
            borderRadius: 16,
            borderCurve: "continuous",
            paddingVertical: 14,
            alignItems: "center",
            backgroundColor: `${HexColors.systemRed}15`,
            opacity: pressed ? 0.7 : 1,
          })}
          onPress={onDelete}
        >
          <Text style={{ color: Colors.systemRed, fontWeight: "600", fontSize: 16 }}>
            {t("goal.delete")}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
