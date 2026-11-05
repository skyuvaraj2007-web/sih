import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useAppleDrawerDrag
 * 
 * Implements Apple WWDC "Designing Fluid Interfaces" principles for web drawers:
 * - Direct 1:1 manipulation with Pointer Events & pointer capture
 * - Interruptible gesture tracking
 * - Velocity tracking & momentum projection at release
 * - Rubber-banding when dragged in reverse
 * - Escape key dismissal
 * - Backdrop click dismissal
 */
export function useAppleDrawerDrag({ isOpen, onClose, direction = 'right' }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const drawerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });
  const velocityHistoryRef = useRef([]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset offset when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Apple rubber-banding formula (§9 in apple-design skill)
  const rubberband = (overshoot, dimension = 400, constant = 0.55) => {
    return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
  };

  // Apple momentum projection formula (§6 in apple-design skill)
  const project = (velocity, decelerationRate = 0.998) => {
    return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
  };

  const handlePointerDown = useCallback((e) => {
    // Only drag from primary button / touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const el = drawerRef.current;
    if (!el) return;

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now()
    };
    velocityHistoryRef.current = [{
      x: e.clientX,
      time: performance.now()
    }];
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;

    const now = performance.now();
    const rawDeltaX = direction === 'right' 
      ? e.clientX - dragStartRef.current.x 
      : dragStartRef.current.x - e.clientX;

    // Track velocity history (last 5 points)
    const history = velocityHistoryRef.current;
    history.push({ x: e.clientX, time: now });
    if (history.length > 5) history.shift();

    if (rawDeltaX >= 0) {
      // Direct 1:1 tracking in dismiss direction (§2)
      setDragOffset(rawDeltaX);
    } else {
      // Soft rubber-banding boundary resistance (§9)
      const resisted = rubberband(rawDeltaX, 350, 0.45);
      setDragOffset(resisted);
    }
  }, [isDragging, direction]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      drawerRef.current?.releasePointerCapture(e.pointerId);
    } catch {}

    // Calculate release velocity in px/s (§5)
    const history = velocityHistoryRef.current;
    let velocity = 0;
    if (history.length >= 2) {
      const first = history[0];
      const last = history[history.length - 1];
      const dt = (last.time - first.time) / 1000;
      if (dt > 0.01) {
        const dx = direction === 'right' ? last.x - first.x : first.x - last.x;
        velocity = dx / dt; // px/s
      }
    }

    // Momentum projection (§6)
    const projectedDismissal = dragOffset + project(velocity);

    // If dragged > 140px, or projected endpoint > 180px, or flick velocity > 380px/s: dismiss!
    if (dragOffset > 140 || projectedDismissal > 180 || velocity > 380) {
      onClose?.();
    } else {
      // Settle spring back to resting state
      setDragOffset(0);
    }
  }, [isDragging, dragOffset, direction, onClose]);

  // Backdrop click handler
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  }, [onClose]);

  // Stop propagation on drawer container
  const handleDrawerClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Compute live visual transform
  const drawerTransform = direction === 'right'
    ? `translateX(${Math.max(0, dragOffset)}px)`
    : `translateX(-${Math.max(0, dragOffset)}px)`;

  // Backing scrim opacity calculation
  const scrimOpacity = Math.max(0.2, 1 - (Math.max(0, dragOffset) / 500));

  return {
    drawerRef,
    isDragging,
    dragOffset,
    drawerTransform,
    scrimOpacity,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleBackdropClick,
    handleDrawerClick,
    drawerProps: {
      role: 'dialog',
      'aria-modal': 'true',
      tabIndex: -1,
      style: {
        transform: drawerTransform,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        touchAction: 'none'
      }
    }
  };
}

export default useAppleDrawerDrag;

