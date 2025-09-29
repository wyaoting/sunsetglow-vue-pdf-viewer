// usePinchZoom.ts
import { onUnmounted, ref, Ref, watch } from "vue";

interface TouchPoint {
  clientX: number;
  clientY: number;
}

export function usePinchZoom(
  elementRef: Ref<HTMLElement | null>,
  options: {
    minScale?: number;
    maxScale?: number;
    initialScale?: number;
    onScaleChange?: (scale: number) => void;
  } = {}
) {
  const {
    minScale = 0.5,
    maxScale = 3,
    initialScale = 1,
    onScaleChange,
  } = options;
  const scale = ref(initialScale);
  const initialDistance = ref(0);
  const isPinching = ref(false);

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.value = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance.value = getDistance(touch1, touch2);
      e.preventDefault(); // 阻止默认行为，避免页面滚动
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPinching.value || e.touches.length < 2) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = getDistance(touch1, touch2);

    if (initialDistance.value > 0) {
      const newScale = (currentDistance / initialDistance.value) * scale.value;
      scale.value = Math.min(Math.max(newScale, minScale), maxScale);
      onScaleChange?.(scale.value);
    }

    e.preventDefault(); // 阻止默认行为
  };

  const handleTouchEnd = () => {
    isPinching.value = false;
    initialDistance.value = 0;
  };

  const getDistance = (touch1: TouchPoint, touch2: TouchPoint) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  watch(
    () => elementRef.value,
    (element) => {
      if (!element) return;
      element.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      element.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      element.addEventListener("touchend", handleTouchEnd);
    }
  );
  onUnmounted(() => {
    const element = elementRef.value;
    if (!element) return;
    element.removeEventListener("touchstart", handleTouchStart);
    element.removeEventListener("touchmove", handleTouchMove);
    element.removeEventListener("touchend", handleTouchEnd);
  });

  return {
    scale,
    isPinching,
  };
}
