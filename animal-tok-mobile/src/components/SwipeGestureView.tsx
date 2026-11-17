import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useSwipeGesture, SwipeOptions } from "@/hooks/useSwipeGesture";

interface SwipeGestureViewProps extends ViewProps, SwipeOptions {
  children: React.ReactNode;
}

export function SwipeGestureView({
  children,
  onSwipeLeft,
  onSwipeRight,
  horizontalThreshold,
  velocityThreshold,
  directionalRatio,
  enabled,
  style,
  ...rest
}: SwipeGestureViewProps) {
  const panHandlers = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    horizontalThreshold,
    velocityThreshold,
    directionalRatio,
    enabled,
  });

  return (
    <View style={[styles.container, style]} {...panHandlers} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
