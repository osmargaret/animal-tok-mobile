import { useRef, useEffect } from "react";
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";
import * as Haptics from "expo-haptics";

export interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  horizontalThreshold?: number; // Minimum horizontal travel in px, default 45
  velocityThreshold?: number;   // Minimum horizontal velocity, default 0.28
  directionalRatio?: number;    // dx/dy ratio to isolate horizontal gestures, default 1.7
  enabled?: boolean;
}

export function useSwipeGesture(options: SwipeOptions) {
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        const { enabled = true, directionalRatio = 1.7 } = optionsRef.current;
        if (!enabled) return false;

        const absDx = Math.abs(gesture.dx);
        const absDy = Math.abs(gesture.dy);

        // Never steal vertical scrolling gestures (feed, lists, scrollviews)
        return absDx > 16 && absDx > absDy * directionalRatio;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        const {
          enabled = true,
          onSwipeLeft,
          onSwipeRight,
          horizontalThreshold = 45,
          velocityThreshold = 0.28,
        } = optionsRef.current;

        if (!enabled) return;

        const absDx = Math.abs(gesture.dx);
        const absVx = Math.abs(gesture.vx);

        const isQuickFlick = absVx > velocityThreshold && absDx > 25;
        const isDefiniteSwipe = absDx > horizontalThreshold;

        if (isQuickFlick || isDefiniteSwipe) {
          if (gesture.dx < 0 && onSwipeLeft) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onSwipeLeft();
          } else if (gesture.dx > 0 && onSwipeRight) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onSwipeRight();
          }
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
}
