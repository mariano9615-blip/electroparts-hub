import React from 'react';
import { IconChevronDown } from '@tabler/icons-react';

interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const Select = ({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  placeholder,
  className = '',
}: SelectProps) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-ep-text-primary">
        {label}
        {required && <span className="text-ep-red ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={[
          'w-full px-3 py-2 text-sm bg-ep-surface rounded-lg appearance-none pr-9',
          'text-ep-text-primary transition-colors duration-150 outline-none border',
          error
            ? 'border-ep-red ring-1 ring-ep-red'
            : 'border-ep-border focus:border-ep-green focus:ring-1 focus:ring-ep-green',
          disabled ? 'bg-ep-surface-raised text-ep-text-disabled cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ep-text-muted">
        <IconChevronDown size={16} />
      </div>
    </div>
    {error && <span className="text-xs text-ep-red">{error}</span>}
  </div>
);
