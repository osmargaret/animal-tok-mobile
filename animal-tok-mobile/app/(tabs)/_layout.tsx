import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, Text } from "react-native";
import { Home, Compass, Plus, MessageSquare, ShoppingBag, User } from "lucide-react-native";
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: "#0d1117",
          borderTopColor: "#1e293b",
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
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
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          href: null,
          title: "Marketplace",
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="animal/[id]"
        options={{
          href: null,
          title: "Animal Profile",
        }}
      />
      <Tabs.Screen
        name="message/[id]"
        options={{
          href: null,
          title: "Messages",
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          href: null,
          title: "Pet Events & Meetups",
        }}
      />
      <Tabs.Screen
        name="product/[id]"
        options={{
          href: null,
          title: "Product Details",
        }}
      />
      <Tabs.Screen
        name="service/[id]"
        options={{
          href: null,
          title: "Service Details",
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
