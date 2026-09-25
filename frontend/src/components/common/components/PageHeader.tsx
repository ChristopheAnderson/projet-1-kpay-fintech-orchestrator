import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: 'blue' | 'emerald' | 'purple' | 'amber';
  icon: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeColor = 'blue',
  icon,
  actions,
  className = '',
}) => {
  const badgeStyles = {
    blue: 'bg-blue-950/80 text-blue-400 border-blue-800',
    emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
    purple: 'bg-purple-950/80 text-purple-400 border-purple-800',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-800',
  }[badgeColor];

  const iconStyles = {
    blue: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    purple: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    amber: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  }[badgeColor];

  return (
    <header className={`border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-30 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${iconStyles}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-wide">{title}</h1>
            {badgeText && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  );
};
