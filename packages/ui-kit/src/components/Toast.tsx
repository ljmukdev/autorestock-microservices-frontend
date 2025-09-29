import React, { useState, useEffect } from 'react';
import { theme } from '../theme';

export interface ToastProps {
  message: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (index: number) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const toastVariants = {
  success: {
    backgroundColor: theme.colors.success[600],
    color: theme.colors.neutral[0],
    icon: '✓',
  },
  warning: {
    backgroundColor: theme.colors.warning[600],
    color: theme.colors.neutral[900],
    icon: '⚠',
  },
  error: {
    backgroundColor: theme.colors.error[600],
    color: theme.colors.neutral[0],
    icon: '✕',
  },
  info: {
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.neutral[0],
    icon: 'ℹ',
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  duration = 5000,
  onClose,
  style,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const variantStyles = toastVariants[variant];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const toastStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: variantStyles.backgroundColor,
    color: variantStyles.color,
    boxShadow: theme.shadows.lg,
    minWidth: '300px',
    maxWidth: '500px',
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    opacity: isVisible ? 1 : 0,
    transition: 'all 0.3s ease-in-out',
    ...style,
  };

  const iconStyles: React.CSSProperties = {
    marginRight: theme.spacing.md,
    fontSize: theme.typography.fontSize.lg,
    flexShrink: 0,
  };

  const messageStyles: React.CSSProperties = {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    lineHeight: theme.typography.lineHeight.normal,
  };

  const closeButtonStyles: React.CSSProperties = {
    marginLeft: theme.spacing.md,
    background: 'none',
    border: 'none',
    color: variantStyles.color,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.lg,
    opacity: 0.7,
    padding: 0,
    lineHeight: 1,
  };

  return (
    <div style={toastStyles} className={className}>
      <span style={iconStyles}>{variantStyles.icon}</span>
      <span style={messageStyles}>{message}</span>
      {onClose && (
        <button
          style={closeButtonStyles}
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          aria-label="Close toast"
        >
          ×
        </button>
      )}
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
}) => {
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': {
      position: 'fixed',
      top: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: theme.zIndex.toast,
    },
    'top-left': {
      position: 'fixed',
      top: theme.spacing.lg,
      left: theme.spacing.lg,
      zIndex: theme.zIndex.toast,
    },
    'bottom-right': {
      position: 'fixed',
      bottom: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: theme.zIndex.toast,
    },
    'bottom-left': {
      position: 'fixed',
      bottom: theme.spacing.lg,
      left: theme.spacing.lg,
      zIndex: theme.zIndex.toast,
    },
    'top-center': {
      position: 'fixed',
      top: theme.spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: theme.zIndex.toast,
    },
    'bottom-center': {
      position: 'fixed',
      bottom: theme.spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: theme.zIndex.toast,
    },
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    ...positionStyles[position],
  };

  return (
    <div style={containerStyles}>
      {toasts.map((toast, index) => (
        <Toast
          key={index}
          {...toast}
          onClose={() => onRemove(index)}
        />
      ))}
    </div>
  );
};
