import React from 'react';

interface BadgeProps {
  color: 'green' | 'blue' | 'amber' | 'red' | 'gray';
  children: React.ReactNode;
  dot?: boolean;
}

const COLOR_CLASSES = {
  green: 'bg-ep-green-light text-ep-green-dark',
  blue: 'bg-ep-blue-light text-ep-blue-dark',
  amber: 'bg-ep-amber-light text-ep-amber-dark',
  red: 'bg-ep-red-light text-ep-red-dark',
  gray: 'bg-ep-surface-raised text-ep-text-secondary',
};

export const Badge = ({ color, children, dot = false }: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${COLOR_CLASSES[color]}`}
  >
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
    {children}
  </span>
);
