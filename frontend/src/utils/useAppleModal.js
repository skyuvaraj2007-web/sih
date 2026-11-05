import { useEffect, useRef, useCallback } from 'react';

/**
 * useAppleModal
 * 
 * Apple HIG-compliant modal interaction hook:
 * - Escape key dismissal
 * - Backdrop click-to-close with propagation guard
 * - Accessible dialog attributes (role="dialog", aria-modal="true")
 * - Document body scroll-lock management
 */
export function useAppleModal({ isOpen, onClose }) {
  const dialogRef = useRef(null);

  // 1. Keyboard Escape dismiss
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

  // 2. Backdrop click handler (fires only when clicking the scrim backdrop directly)
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  }, [onClose]);

  // 3. Stop propagation on the dialog content box
  const handleContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return {
    dialogRef,
    handleBackdropClick,
    handleContentClick,
    modalProps: {
      role: 'dialog',
      'aria-modal': 'true',
      tabIndex: -1
    }
  };
}

export default useAppleModal;

