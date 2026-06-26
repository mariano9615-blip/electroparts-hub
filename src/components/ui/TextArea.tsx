import React from 'react';

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
  hint?: string;
}

export const TextArea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  hint,
}: TextAreaProps) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-ep-text-primary">
        {label}
        {required && <span className="text-ep-red ml-1">*</span>}
      </label>
    )}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      rows={rows}
      className={[
        'w-full px-3 py-2 text-sm bg-ep-surface rounded-lg resize-none',
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
