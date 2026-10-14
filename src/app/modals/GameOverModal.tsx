import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { t } from '../../shared/localization';
import { RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  onRespawn: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRespawn }) => {
  const { settings } = useGameStore();
  const lang = settings.language;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-fantasy-dark border-2 border-red-900/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center gap-5">
        <div className="w-20 h-20 rounded-full bg-red-950/40 border-2 border-red-500/60 flex items-center justify-center text-4xl shadow-inner">
          💀
        </div>

        <div>
          <h1 className="text-2xl font-black text-red-500 tracking-wider">
            {t('gameOver', lang)}
          </h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {lang === 'th'
              ? 'พลังชีวิตของเคลหมดลง แต่แสงสว่างจากผลึกเอคโค่ยังคงนำทางดวงวิญญาณกลับสู่หมู่บ้านเอเวอร์ไลท์'
              : 'Kael’s consciousness fades, but the gentle resonance of the Echo Crystal safely recalls his spirit back to Everlight Village.'}
          </p>
        </div>

        <button
          onClick={onRespawn}
          className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          <span>{t('respawn', lang)}</span>
        </button>
      </div>
    </div>
  );
};
