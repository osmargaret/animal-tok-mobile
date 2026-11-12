import '../global.css';
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { registerForPushNotificationsAsync, setupNotificationListeners } from "@/services/notifications";

import { Platform, View, StyleSheet } from "react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

function NotificationInitializer() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Register push token when user logs in or on app launch
    registerForPushNotificationsAsync(user?.id);

    // Handle user tapping on a notification
    const cleanup = setupNotificationListeners((data) => {
      if (data?.threadId) {
        router.push({
          pathname: "/(tabs)/message/[id]",
          params: { id: data.threadId },
        });
      }
    });

    return () => {
      cleanup();
    };
  }, [user?.id]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationInitializer />
        <SafeAreaProvider>
          <StatusBar style="light" backgroundColor="#0d1117" />
          <View style={styles.container}>
            <Stack
              screenOptions={{
                headerShown: false,
                headerStyle: {
                  backgroundColor: "#0d1117",
                },
                headerTintColor: "#ffffff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
                contentStyle: {
                  backgroundColor: "#0d1117",
                },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="auth"
                options={{
                  headerShown: false,
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="edit-profile"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="add-product"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="onboarding"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </View>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    ...(Platform.OS === "web" && {
      maxWidth: 480,
      width: "100%",
      marginHorizontal: "auto",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
    }),
  },
});
