import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { saveService } from '../../persistence/saveService';
import { t } from '../../shared/localization';
import { Play, Sparkles, Settings as SettingsIcon, Globe, Wrench } from 'lucide-react';
import { soundManager } from '../../shared/utils/soundSynthesizer';

interface MainMenuModalProps {
  onStartGame: () => void;
}

export const MainMenuModal: React.FC<MainMenuModalProps> = ({ onStartGame }) => {
  const { settings, setSettings, openModal, loadSavedGame, setIsSandbox } = useGameStore();
  const [hasSave, setHasSave] = useState(false);
  const lang = settings.language;

  useEffect(() => {
    saveService.hasSave(1).then((exists) => setHasSave(exists));
  }, []);

  const handleContinue = async () => {
    soundManager.playSfx('click');
    const loaded = await loadSavedGame();
    if (loaded) {
      onStartGame();
    }
  };

  const handleNewGame = () => {
    soundManager.playSfx('crystal');
    setIsSandbox(false);
    onStartGame();
  };

  const handleSandboxMode = () => {
    soundManager.playSfx('levelup');
    setIsSandbox(true);
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fantasy-darkest/95 backdrop-blur-lg p-4 select-none">
      {/* Background Ambience effect */}
      <div className="absolute inset-0 bg-radial-gradient from-sky-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center gap-6 p-8">
        {/* Crystal Logo Graphic */}
        <div className="w-20 h-20 rounded-2xl bg-fantasy-panel border-2 border-fantasy-crystal flex items-center justify-center text-4xl shadow-2xl shadow-sky-500/20 animate-pulse">
          💎
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 tracking-wider font-ui drop-shadow-md">
            {t('gameTitle', lang)}
          </h1>
          <p className="text-xs text-sky-400 font-semibold tracking-widest mt-1 uppercase">
            {t('subtitle', lang)}
          </p>
        </div>

        {/* Menu Actions */}
        <div className="flex flex-col gap-3 w-64 mt-2">
          {hasSave && (
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95"
            >
              <Sparkles size={16} />
              <span>{t('continueGame', lang)}</span>
            </button>
          )}

          <button
            onClick={handleNewGame}
            className="w-full bg-gradient-to-r from-fantasy-gold to-amber-500 hover:from-fantasy-goldBright hover:to-amber-400 text-fantasy-darkest font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl transition-all transform active:scale-95"
          >
            <Play size={16} />
            <span>{t('newGame', lang)}</span>
          </button>

          <button
            onClick={handleSandboxMode}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl transition-all transform active:scale-95 border border-indigo-400/30"
          >
            <Wrench size={16} />
            <span>{lang === 'th' ? 'โหมดแซนด์บ็อกซ์ / ทดสอบ' : 'Sandbox / Creative Mode'}</span>
          </button>

          <button
            onClick={() => openModal('settings')}
            className="w-full bg-fantasy-panel hover:bg-slate-800 border border-fantasy-border text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow"
          >
            <SettingsIcon size={14} />
            <span>{t('settings', lang)}</span>
          </button>
        </div>

        {/* Language quick toggle & Controls guide summary */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mt-4">
          <button
            onClick={() => setSettings({ language: lang === 'en' ? 'th' : 'en' })}
            className="flex items-center gap-1.5 hover:text-white bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <Globe size={14} className="text-fantasy-crystal" />
            <span>{lang === 'en' ? 'ภาษาไทย' : 'English'}</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 max-w-sm mt-2">
          Controls: WASD to Move • J to Attack • Space to Dodge • E to Talk / Loot • I / C / K / Q for Menus
        </div>
      </div>
    </div>
  );
};
