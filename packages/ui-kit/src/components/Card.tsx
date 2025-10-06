import React from 'react';
import { theme } from '../theme';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: keyof typeof theme.spacing;
  shadow?: keyof typeof theme.shadows;
  border?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  padding = 'lg',
  shadow = 'md',
  border = false,
  fullWidth = false,
  style,
  className,
}) => {
  const cardStyles: React.CSSProperties = {
    backgroundColor: theme.colors.neutral[0],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[padding],
    boxShadow: theme.shadows[shadow],
    border: border ? `1px solid ${theme.colors.neutral[200]}` : 'none',
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: subtitle ? theme.spacing.sm : theme.spacing.md,
    lineHeight: theme.typography.lineHeight.tight,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.normal,
  };

  return (
    <div style={cardStyles} className={className}>
      {title && <h3 style={titleStyles}>{title}</h3>}
      {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      {children}
    </div>
  );
};

