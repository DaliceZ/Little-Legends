import React from 'react';
import { useGameStore, NotificationToast } from '../../store/useGameStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Sparkles, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useGameStore();

  if (notifications.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none select-none transition-all duration-300"
      aria-live="polite"
    >
      {notifications.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeNotification(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: NotificationToast;
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const type = toast.type || 'info';

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/70',
          bg: 'bg-emerald-950/90 shadow-emerald-950/50',
          titleColor: 'text-emerald-300',
          icon: <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />,
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'error':
        return {
          border: 'border-rose-500/70',
          bg: 'bg-rose-950/90 shadow-rose-950/50',
          titleColor: 'text-rose-300',
          icon: <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />,
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'warning':
        return {
          border: 'border-amber-500/70',
          bg: 'bg-amber-950/90 shadow-amber-950/50',
          titleColor: 'text-amber-300',
          icon: <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />,
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'loot':
        return {
          border: 'border-purple-500/70',
          bg: 'bg-gradient-to-r from-purple-950/95 via-indigo-950/90 to-purple-950/95 shadow-purple-950/50',
          titleColor: 'text-amber-300',
          icon: <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5 animate-pulse" />,
          badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/50',
        };
      case 'info':
      default:
        return {
          border: 'border-sky-500/70',
          bg: 'bg-slate-900/90 shadow-sky-950/50',
          titleColor: 'text-sky-300',
          icon: <Info size={16} className="text-sky-400 shrink-0 mt-0.5" />,
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
    }
  };

  const style = getTypeStyles();

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all transform animate-in slide-in-from-right duration-200 hover:scale-[1.01] ${style.border} ${style.bg}`}
      role="alert"
    >
      {style.icon}

      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-black tracking-wide font-ui uppercase ${style.titleColor}`}>
            {toast.title}
          </span>
          {toast.valueDelta && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${style.badgeBg}`}
            >
              {toast.valueDelta}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-200 mt-0.5 leading-snug break-words">
          {toast.message}
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};
