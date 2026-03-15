import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { setupNotificationHandler } from "@/features/notification/services/notification-service";

export function useNotificationSetup(): void {
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    setupNotificationHandler();

    listenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data && typeof data.goalId === "number") {
          router.push(`/goal/${data.goalId}`);
        }
      });

    return () => {
      listenerRef.current?.remove();
    };
  }, []);
}
