import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = ({ children, className = '', padding = 'md', hoverable = false }: CardProps) => (
  <div
    className={[
      'bg-ep-surface border border-ep-border rounded-xl shadow-sm',
      PADDING_CLASSES[padding],
      hoverable ? 'transition-shadow duration-150 hover:shadow-md cursor-pointer' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </div>
);
