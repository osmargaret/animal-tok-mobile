import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, Plus, MessageSquare, ShoppingBag, User } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

function TikTokCreateIcon() {
  return (
    <View style={styles.createButtonContainer}>
      <View style={styles.createLeftAccent} />
      <View style={styles.createRightAccent} />
      <View style={styles.createCenterBox}>
        <Plus color="#ffffff" size={19} strokeWidth={3} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const androidExtra = Platform.OS === "android" ? Math.max(insets.bottom, 26) : (insets.bottom > 0 ? insets.bottom : 8);
  const tabHeight = Platform.OS === "android" ? 64 + androidExtra : 58 + insets.bottom;
  const tabPaddingBottom = Platform.OS === "android" ? androidExtra + 4 : (insets.bottom > 0 ? insets.bottom + 4 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: "#0b0f17",
          borderTopColor: "rgba(45, 212, 191, 0.4)",
          borderTopWidth: 1.5,
          height: tabHeight,
          paddingBottom: tabPaddingBottom,
          paddingTop: 6,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: "#2dd4bf",
        tabBarInactiveTintColor: "#cbd5e1",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: 2,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Search color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: () => <TikTokCreateIcon />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          href: null,
          title: "Marketplace",
          tabBarStyle: { display: "none" },
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="animal/[id]"
        options={{
          href: null,
          title: "Animal Profile",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="message/[id]"
        options={{
          href: null,
          title: "Messages",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          href: null,
          title: "Pet Events & Meetups",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="product/[id]"
        options={{
          href: null,
          title: "Product Details",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="service/[id]"
        options={{
          href: null,
          title: "Service Details",
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createButtonContainer: {
    width: 44,
    height: 30,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  createLeftAccent: {
    position: "absolute",
    left: 0,
    width: 36,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#06b6d4",
  },
  createRightAccent: {
    position: "absolute",
    right: 0,
    width: 36,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#10b981",
  },
  createCenterBox: {
    width: 36,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#0d9488",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
});
