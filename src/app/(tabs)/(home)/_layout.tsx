import React from "react";
import Stack from "expo-router/stack";
import { useTranslation } from "react-i18next";

export default function HomeStack() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t("home.title"),
        }}
      />
      <Stack.Screen
        name="goal/create"
        options={{
          title: t("goal.create"),
          headerBackTitle: t("home.title"),
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="goal/[id]"
        options={{
          title: "",
          headerBackTitle: t("home.title"),
        }}
      />
      <Stack.Screen
        name="goal/edit/[id]"
        options={{
          title: t("goal.edit"),
          headerBackTitle: "",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
