import { onMounted, onUnmounted, type Ref, ref } from 'vue';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // minimum distance in pixels
  velocity?: number; // minimum velocity in pixels per ms
}

export function useSwipe(element: Ref<HTMLElement | null>, options: SwipeOptions = {}) {
  const { onSwipeLeft, onSwipeRight, threshold = 50, velocity = 0.3 } = options;
  
  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const touchStartTime = ref(0);
  const isSwiping = ref(false);

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.value = touch.clientX;
    touchStartY.value = touch.clientY;
    touchStartTime.value = Date.now();
    isSwiping.value = true;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isSwiping.value) return;
    const touch = e.touches[0];
    if (!touch) return;
    // Prevent scrolling if we're swiping horizontally
    const deltaX = Math.abs(touch.clientX - touchStartX.value);
    const deltaY = Math.abs(touch.clientY - touchStartY.value);
    
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!isSwiping.value) {
      isSwiping.value = false;
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch) {
      isSwiping.value = false;
      return;
    }

    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const touchEndTime = Date.now();

    const deltaX = touchEndX - touchStartX.value;
    const deltaY = touchEndY - touchStartY.value;
    const deltaTime = touchEndTime - touchStartTime.value;
    const distance = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if horizontal swipe is dominant
    if (distance > absDeltaY && distance >= threshold) {
      const swipeVelocity = distance / deltaTime;
      
      if (swipeVelocity >= velocity) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    }

    isSwiping.value = false;
  }

  onMounted(() => {
    const el = element.value;
    if (!el) return;
    
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
  });

  onUnmounted(() => {
    const el = element.value;
    if (!el) return;
    
    el.removeEventListener('touchstart', handleTouchStart);
    el.removeEventListener('touchmove', handleTouchMove);
    el.removeEventListener('touchend', handleTouchEnd);
  });
}

