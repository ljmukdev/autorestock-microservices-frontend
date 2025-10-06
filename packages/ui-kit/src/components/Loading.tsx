import React from 'react';
import { theme } from '../theme';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const loadingSizes = {
  sm: '1rem',
  md: '2rem',
  lg: '3rem',
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = theme.colors.primary[600],
  text,
  fullScreen = false,
  style,
  className,
}) => {
  const sizeValue = loadingSizes[size];

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: theme.zIndex.modal,
    }),
    ...style,
  };

  const spinnerStyles: React.CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    border: `3px solid ${theme.colors.neutral[200]}`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const dotsStyles: React.CSSProperties = {
    display: 'flex',
    gap: '0.25rem',
  };

  const dotStyles = (delay: number): React.CSSProperties => ({
    width: '0.5rem',
    height: '0.5rem',
    backgroundColor: color,
    borderRadius: '50%',
    animation: `bounce 1.4s ease-in-out ${delay}s infinite both`,
  });

  const pulseStyles: React.CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    backgroundColor: color,
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  const textStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily.sans.join(', '),
  };

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div style={dotsStyles}>
            <div style={dotStyles(0)} />
            <div style={dotStyles(0.16)} />
            <div style={dotStyles(0.32)} />
          </div>
        );
      case 'pulse':
        return <div style={pulseStyles} />;
      case 'spinner':
      default:
        return <div style={spinnerStyles} />;
    }
  };

  return (
    <div style={containerStyles} className={className}>
      {renderLoader()}
      {text && <div style={textStyles}>{text}</div>}
    </div>
  );
};

