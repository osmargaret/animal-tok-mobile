import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { api } from "./api";

// Configure foreground notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and register the Expo Push Token with the backend
 */
export async function registerForPushNotificationsAsync(userId?: string): Promise<string | null> {
  let token: string | null = null;

  try {
    // Configure Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "AnimalTok Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#06b6d4",
      });
    }

    // Check if running on a physical device
    if (!Device.isDevice) {
      console.log("ℹ️ Push notifications require a physical device. Skipping token generation on emulator.");
      return null;
    }

    // Check existing permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("⚠️ Push notification permission not granted.");
      return null;
    }

    // Retrieve Expo push token
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    token = tokenData.data;
    console.log("📲 Expo Push Token acquired:", token);

    // Register token with backend if userId is available
    if (userId && token) {
      await api.registerPushToken(userId, token);
    }
  } catch (error) {
    console.warn("⚠️ Failed to obtain or register push token:", error);
  }

  return token;
}

/**
 * Setup notification response listener (when user taps a notification)
 */
export function setupNotificationListeners(
  onNotificationTapped?: (data: Record<string, any>) => void
) {
  // Listener for user tapping on a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      if (onNotificationTapped && data) {
        onNotificationTapped(data);
      }
    }
  );

  return () => {
    responseSubscription.remove();
  };
}

