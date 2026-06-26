import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const VARIANT_CLASSES = {
  primary:
    'bg-ep-green text-white hover:bg-ep-green-hover focus-visible:ring-2 focus-visible:ring-ep-green focus-visible:ring-offset-2',
  secondary:
    'bg-ep-surface text-ep-text-primary border border-ep-border hover:bg-ep-surface-raised focus-visible:ring-2 focus-visible:ring-ep-border focus-visible:ring-offset-2',
  danger:
    'bg-ep-red text-white hover:bg-ep-red-dark focus-visible:ring-2 focus-visible:ring-ep-red focus-visible:ring-offset-2',
  ghost:
    'text-ep-text-secondary hover:text-ep-text-primary hover:bg-ep-surface-raised focus-visible:ring-2 focus-visible:ring-ep-border focus-visible:ring-offset-2',
};

const SIZE_CLASSES = {
  sm: 'text-xs px-3 py-1.5 rounded-md',
  md: 'text-sm px-4 py-2 rounded-lg',
  lg: 'text-sm px-5 py-2.5 rounded-lg',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  children,
  className = '',
  fullWidth = false,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 cursor-pointer outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading && <Spinner size="sm" color="text-current" />}
      {children}
    </button>
  );
};
