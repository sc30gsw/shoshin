import "@/libs/i18n";

import React from "react";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { migrateDbIfNeeded } from "@/libs/database";
import { useNotificationSetup } from "@/features/notification/hooks/use-notifications";
import { setupNotificationChannel } from "@/features/notification/services/notification-service";

setupNotificationChannel();

const queryClient = new QueryClient();

function AppContent() {
  useNotificationSetup();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="shoshin.db" onInit={migrateDbIfNeeded}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
