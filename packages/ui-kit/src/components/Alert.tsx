import React from 'react';
import { theme } from '../theme';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const alertVariants = {
  success: {
    backgroundColor: theme.colors.success[50],
    borderColor: theme.colors.success[200],
    iconColor: theme.colors.success[600],
    titleColor: theme.colors.success[800],
    textColor: theme.colors.success[700],
  },
  warning: {
    backgroundColor: theme.colors.warning[50],
    borderColor: theme.colors.warning[200],
    iconColor: theme.colors.warning[600],
    titleColor: theme.colors.warning[800],
    textColor: theme.colors.warning[700],
  },
  error: {
    backgroundColor: theme.colors.error[50],
    borderColor: theme.colors.error[200],
    iconColor: theme.colors.error[600],
    titleColor: theme.colors.error[800],
    textColor: theme.colors.error[700],
  },
  info: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
    iconColor: theme.colors.primary[600],
    titleColor: theme.colors.primary[800],
    textColor: theme.colors.primary[700],
  },
};

const icons = {
  success: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ',
};

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  style,
  className,
}) => {
  const variantStyles = alertVariants[variant];
  
  const alertStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${variantStyles.borderColor}`,
    backgroundColor: variantStyles.backgroundColor,
    ...style,
  };

  const iconStyles: React.CSSProperties = {
    flexShrink: 0,
    marginRight: theme.spacing.md,
    fontSize: theme.typography.fontSize.lg,
    color: variantStyles.iconColor,
    lineHeight: 1,
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: variantStyles.titleColor,
    marginBottom: title ? theme.spacing.xs : 0,
    lineHeight: theme.typography.lineHeight.tight,
  };

  const textStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: variantStyles.textColor,
    lineHeight: theme.typography.lineHeight.normal,
  };

  const dismissButtonStyles: React.CSSProperties = {
    flexShrink: 0,
    marginLeft: theme.spacing.md,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.lg,
    color: variantStyles.textColor,
    opacity: 0.7,
    padding: 0,
    lineHeight: 1,
  };

  return (
    <div style={alertStyles} className={className}>
      <span style={iconStyles}>{icons[variant]}</span>
      <div style={contentStyles}>
        {title && <div style={titleStyles}>{title}</div>}
        <div style={textStyles}>{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          style={dismissButtonStyles}
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  );
};
