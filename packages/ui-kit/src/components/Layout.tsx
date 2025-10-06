import React from 'react';
import { theme } from '../theme';

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: keyof typeof theme.spacing;
  center?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: keyof typeof theme.spacing;
  fullWidth?: boolean;
  fullHeight?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export interface GridProps {
  children: React.ReactNode;
  columns?: number | string;
  gap?: keyof typeof theme.spacing;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export interface StackProps {
  children: React.ReactNode;
  spacing?: keyof typeof theme.spacing;
  align?: 'start' | 'end' | 'center' | 'stretch';
  fullWidth?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const maxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = 'lg',
  center = true,
  style,
  className,
}) => {
  const containerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: maxWidths[maxWidth],
    padding: theme.spacing[padding],
    margin: center ? '0 auto' : '0',
    ...style,
  };

  return (
    <div style={containerStyles} className={className}>
      {children}
    </div>
  );
};

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  gap = 'md',
  fullWidth = false,
  fullHeight = false,
  style,
  className,
}) => {
  const flexStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    gap: theme.spacing[gap],
    width: fullWidth ? '100%' : 'auto',
    height: fullHeight ? '100%' : 'auto',
    ...style,
  };

  return (
    <div style={flexStyles} className={className}>
      {children}
    </div>
  );
};

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 1,
  gap = 'md',
  fullWidth = false,
  style,
  className,
}) => {
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
    gap: theme.spacing[gap],
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  return (
    <div style={gridStyles} className={className}>
      {children}
    </div>
  );
};

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 'md',
  align = 'stretch',
  fullWidth = false,
  style,
  className,
}) => {
  const stackStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: align,
    gap: theme.spacing[spacing],
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  return (
    <div style={stackStyles} className={className}>
      {children}
    </div>
  );
};

