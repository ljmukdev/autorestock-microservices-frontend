import React from 'react';
import { theme } from '../theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: {
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.neutral[0],
    border: 'none',
  },
  secondary: {
    backgroundColor: theme.colors.secondary[100],
    color: theme.colors.secondary[900],
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: theme.colors.primary[600],
    border: `1px solid ${theme.colors.primary[600]}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: theme.colors.primary[600],
    border: 'none',
  },
  danger: {
    backgroundColor: theme.colors.error[600],
    color: theme.colors.neutral[0],
    border: 'none',
  },
};

const buttonSizes = {
  sm: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSize.sm,
    minHeight: '2rem',
  },
  md: {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    fontSize: theme.typography.fontSize.base,
    minHeight: '2.5rem',
  },
  lg: {
    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
    fontSize: theme.typography.fontSize.lg,
    minHeight: '3rem',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: loading ? 0.7 : 1,
    ...buttonSizes[size],
    ...buttonVariants[variant],
    ...style,
  };

  return (
    <button
      style={baseStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          style={{
            display: 'inline-block',
            width: '1rem',
            height: '1rem',
            marginRight: theme.spacing.sm,
            border: `2px solid transparent`,
            borderTop: `2px solid currentColor`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
};
