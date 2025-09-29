import React from 'react';
import { theme } from '../theme';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  className,
  ...props
}) => {
  const inputStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: `${theme.spacing.md}`,
    paddingLeft: leftIcon ? `${theme.spacing['2xl']}` : theme.spacing.md,
    paddingRight: rightIcon ? `${theme.spacing['2xl']}` : theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${error ? theme.colors.error[300] : theme.colors.neutral[300]}`,
    backgroundColor: theme.colors.neutral[0],
    color: theme.colors.neutral[900],
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    ...style,
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.sm,
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: error ? theme.colors.error[600] : theme.colors.neutral[500],
    marginTop: theme.spacing.sm,
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: fullWidth ? '100%' : 'auto',
  };

  const iconContainerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.neutral[500],
    pointerEvents: 'none',
  };

  const leftIconStyles: React.CSSProperties = {
    ...iconContainerStyles,
    left: theme.spacing.md,
  };

  const rightIconStyles: React.CSSProperties = {
    ...iconContainerStyles,
    right: theme.spacing.md,
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {leftIcon && <div style={leftIconStyles}>{leftIcon}</div>}
        <input
          style={inputStyles}
          className={className}
          {...props}
        />
        {rightIcon && <div style={rightIconStyles}>{rightIcon}</div>}
      </div>
      {(error || helperText) && (
        <div style={helperTextStyles}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};
