interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
};

export const Spinner = ({ size = 'md', color = 'text-ep-green' }: SpinnerProps) => (
  <svg
    className={`animate-spin ${SIZE_MAP[size]} ${color}`}
    viewBox="0 0 24 24"
    fill="none"
    aria-label="Cargando"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path
      fill="currentColor"
      className="opacity-75"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);
