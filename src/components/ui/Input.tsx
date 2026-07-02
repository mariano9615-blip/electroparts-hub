import React from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  className?: string;
  hint?: string;
}

export const Input = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  type = 'text',
  error,
  required = false,
  disabled = false,
  min,
  max,
  step,
  className = '',
  hint,
}: InputProps) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-ep-text-primary">
        {label}
        {required && <span className="text-ep-red ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      min={min}
      max={max}
      step={step}
      className={[
        'w-full px-3 py-2 text-sm bg-ep-surface rounded-lg',
        'text-ep-text-primary placeholder:text-ep-text-muted',
        'transition-colors duration-150 outline-none border',
        error
          ? 'border-ep-red ring-1 ring-ep-red'
          : 'border-ep-border focus:border-ep-green focus:ring-1 focus:ring-ep-green',
        disabled ? 'bg-ep-surface-raised text-ep-text-disabled cursor-not-allowed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    />
    {error && <span className="text-xs text-ep-red">{error}</span>}
    {!error && hint && <span className="text-xs text-ep-text-muted">{hint}</span>}
  </div>
);
