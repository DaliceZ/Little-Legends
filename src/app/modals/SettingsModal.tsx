import React, { useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { saveService } from '../../persistence/saveService';
import { t } from '../../shared/localization';
import { X, Volume2, Globe, Download, Upload, Save, RefreshCw } from 'lucide-react';
import { soundManager } from '../../shared/utils/soundSynthesizer';

export const SettingsModal: React.FC = () => {
  const { 
    settings, 
    setSettings, 
    closeModal, 
    saveCurrentGame, 
    resetToNewGame,
    showNotification 
  } = useGameStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lang = settings.language;

  const handleExport = async () => {
    const json = await saveService.exportSaveToJson(1);
    if (!json) {
      showNotification('EXPORT FAILED', 'No active save file found to export.', 'warning');
      return;
    }
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `little_legends_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('SAVE EXPORTED', 'Save file exported to downloads!', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const success = await saveService.importSaveFromJson(text);
      if (success) {
        await useGameStore.getState().loadSavedGame();
        closeModal();
      } else {
        showNotification('IMPORT FAILED', 'Invalid save file format.', 'warning');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-fantasy-dark border-2 border-fantasy-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-fantasy-panel px-6 py-4 flex items-center justify-between border-b border-fantasy-border">
          <h2 className="text-base font-bold text-fantasy-gold flex items-center gap-2">
            <span>⚙️</span> {t('settings', lang)}
          </h2>
          <button 
            onClick={closeModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 max-h-96 overflow-y-auto">
          {/* Language Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-2">
              <Globe size={16} className="text-fantasy-crystal" />
              <span>{t('language', lang)}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSettings({ language: 'en' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  settings.language === 'en'
                    ? 'bg-fantasy-panel border-fantasy-gold text-fantasy-gold shadow'
                    : 'bg-fantasy-darkest border-fantasy-border text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSettings({ language: 'th' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  settings.language === 'th'
                    ? 'bg-fantasy-panel border-fantasy-gold text-fantasy-gold shadow'
                    : 'bg-fantasy-darkest border-fantasy-border text-slate-400'
                }`}
              >
                ภาษาไทย (Thai)
              </button>
            </div>
          </div>

          {/* Audio Sliders */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Volume2 size={16} className="text-amber-400" />
              <span>Audio Levels</span>
            </div>

            {/* Master Volume */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t('volume', lang)}</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => setSettings({ masterVolume: parseFloat(e.target.value) })}
                className="w-full accent-fantasy-gold cursor-pointer"
              />
            </div>

            {/* SFX Volume */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t('sfxVolume', lang)}</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSettings({ sfxVolume: val });
                  soundManager.playSfx('click');
                }}
                className="w-full accent-fantasy-gold cursor-pointer"
              />
            </div>

            {/* Music Volume */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t('musicVolume', lang)}</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => setSettings({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-fantasy-gold cursor-pointer"
              />
            </div>
          </div>

          {/* Save / Export / Import */}
          <div className="pt-2 border-t border-fantasy-border/80 flex flex-col gap-2">
            <button
              onClick={() => saveCurrentGame()}
              className="w-full bg-fantasy-gold hover:bg-fantasy-goldBright text-fantasy-darkest font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Save size={16} />
              <span>{t('saveGame', lang)}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="bg-fantasy-panel hover:bg-slate-800 border border-fantasy-border text-slate-200 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={14} />
                <span>{t('exportSave', lang)}</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-fantasy-panel hover:bg-slate-800 border border-fantasy-border text-slate-200 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Upload size={14} />
                <span>{t('importSave', lang)}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
            </div>

            <button
              onClick={() => {
                if (window.confirm('Reset progress and start a new game?')) {
                  resetToNewGame();
                  closeModal();
                }
              }}
              className="mt-2 text-red-400 hover:text-red-300 text-[11px] flex items-center justify-center gap-1.5 py-1"
            >
              <RefreshCw size={12} />
              <span>Reset to New Adventure</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
