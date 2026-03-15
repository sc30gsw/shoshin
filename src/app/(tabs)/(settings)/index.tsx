import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, Alert, Linking, Image } from "react-native";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import * as Notifications from "expo-notifications";
import { i18next, LANGUAGE_STORAGE_KEY } from "@/libs/i18n";
import { useStorage } from "@/hooks/use-storage";
import { Colors, HexColors } from "@/constants/colors";

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        color: Colors.secondaryLabel,
        fontSize: 13,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        paddingHorizontal: 4,
        paddingBottom: 8,
      }}
    >
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const [language, setLanguage] = useStorage<string>(LANGUAGE_STORAGE_KEY, "ja");
  const [notificationStatus, setNotificationStatus] = useState<string>("undetermined");

  const checkPermissionStatus = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationStatus(status);
  }, []);

  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  const handleNotificationPress = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();

    if (status === "granted") {
      Alert.alert(
        t("settings.notifications"),
        t("settings.notificationsAlreadyGranted"),
        [
          { text: t("settings.openSettings"), onPress: () => Linking.openSettings() },
          { text: t("goal.cancel"), style: "cancel" },
        ]
      );
    } else if (status === "denied") {
      Alert.alert(
        t("settings.notificationsDenied"),
        t("settings.notificationsDeniedMessage"),
        [
          { text: t("settings.openSettings"), onPress: () => Linking.openSettings() },
          { text: t("goal.cancel"), style: "cancel" },
        ]
      );
    } else {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      setNotificationStatus(newStatus);
      if (newStatus === "granted") {
        Alert.alert(t("settings.notifications"), t("settings.notificationsGranted"));
      }
    }
  }, [t]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18next.changeLanguage(lang);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.secondarySystemBackground }}
      contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 48 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Language */}
      <View style={{ gap: 8 }}>
        <SectionHeader title={t("settings.language")} />
        <View
          style={{
            backgroundColor: Colors.tertiarySystemBackground,
            borderRadius: 16,
            borderCurve: "continuous",
            paddingHorizontal: 16,
          }}
        >
          {(["ja", "en"] as const).map((lang, index) => (
            <React.Fragment key={lang}>
              {index > 0 && (
                <View style={{ height: 1, backgroundColor: Colors.separator, marginLeft: 44 }} />
              )}
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 14,
                  opacity: pressed ? 0.7 : 1,
                })}
                onPress={() => handleLanguageChange(lang)}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={{ fontSize: 22 }}>{lang === "ja" ? "🇯🇵" : "🇺🇸"}</Text>
                  <Text style={{ color: Colors.label, fontSize: 16 }}>
                    {t(`language.${lang}`)}
                  </Text>
                </View>
                {language === lang && (
                  <SymbolView name="checkmark" size={18} tintColor={Colors.systemBlue} />
                )}
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Notifications */}
      <View style={{ gap: 8 }}>
        <SectionHeader title={t("settings.notifications")} />
        <View
          style={{
            backgroundColor: Colors.tertiarySystemBackground,
            borderRadius: 16,
            borderCurve: "continuous",
            padding: 16,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                borderCurve: "continuous",
                backgroundColor: `${HexColors.systemBlue}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SymbolView name="bell.fill" size={18} tintColor={Colors.systemBlue} />
            </View>
            <Text style={{ flex: 1, color: Colors.label, fontSize: 16 }}>
              {t("settings.notifications")}
            </Text>
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: Colors.systemBlue,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={handleNotificationPress}
            >
              <Text style={{ color: "white", fontSize: 13, fontWeight: "500" }}>
                {notificationStatus === "granted"
                  ? t("settings.notificationsGranted")
                  : t("settings.notificationsRequest")}
              </Text>
            </Pressable>
          </View>
          <Text style={{ color: Colors.secondaryLabel, fontSize: 13, marginLeft: 44 }}>
            {t("settings.notificationsDescription")}
          </Text>
        </View>
      </View>

      {/* About */}
      <View style={{ gap: 8 }}>
        <SectionHeader title={t("settings.about")} />
        <View
          style={{
            backgroundColor: Colors.tertiarySystemBackground,
            borderRadius: 16,
            borderCurve: "continuous",
            padding: 16,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Image
              source={require("@/../assets/icon.png")}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
              }}
            />
            <View style={{ gap: 2 }}>
              <Text style={{ color: Colors.label, fontWeight: "700", fontSize: 17 }}>
                {t("app.name")}
              </Text>
              <Text style={{ color: Colors.secondaryLabel, fontSize: 12 }}>v1.0.0</Text>
            </View>
          </View>
          <Text style={{ color: Colors.secondaryLabel, fontSize: 14, lineHeight: 20 }}>
            {t("settings.aboutDescription")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
