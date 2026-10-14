import React from 'react';
import { soundManager } from '../../../shared/utils/soundSynthesizer';

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'crystal' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  isLoading = false,
  disabled,
  onClick,
  children,
  className = '',
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    soundManager.playSfx('click');
    if (onClick) {
      onClick(e);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-300/80 shadow-amber-500/20';
      case 'success':
        return 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/50 shadow-emerald-500/20';
      case 'danger':
        return 'bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white border border-rose-500/60 shadow-rose-900/30';
      case 'crystal':
        return 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white border border-sky-400/60 shadow-sky-500/20';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent hover:border-slate-700';
      case 'secondary':
      default:
        return 'bg-fantasy-panel hover:bg-slate-800 text-slate-200 border border-fantasy-border hover:border-fantasy-borderBright shadow-slate-950/40';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1 text-xs gap-1.5 rounded-lg';
      case 'lg':
        return 'px-6 py-3.5 text-sm gap-2.5 rounded-xl font-extrabold tracking-wide';
      case 'md':
      default:
        return 'px-4 py-2 text-xs gap-2 rounded-xl font-bold';
    }
  };

  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center font-ui shadow-lg transition-all duration-150 transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
