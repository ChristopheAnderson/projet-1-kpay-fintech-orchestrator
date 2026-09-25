import React from 'react';

export type StatusDotVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple';

export interface StatusDotProps {
  variant?: StatusDotVariant;
  pulse?: boolean;
  label?: string;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  variant = 'success',
  pulse = true,
  label,
  className = '',
}) => {
  const dotColors: Record<StatusDotVariant, string> = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-blue-400',
    purple: 'bg-purple-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`} />
      </span>
      {label && <span className="text-xs text-slate-300 font-medium">{label}</span>}
    </span>
  );
};
