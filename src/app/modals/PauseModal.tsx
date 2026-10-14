import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { GameButton } from '../components/ui/GameButton';
import { 
  Play, 
  Save, 
  Settings as SettingsIcon, 
  HelpCircle, 
  Home, 
  X, 
  AlertTriangle,
  MapPin,
  Heart,
  Zap,
  Coins,
  Gem,
  Keyboard
} from 'lucide-react';
import { soundManager } from '../../shared/utils/soundSynthesizer';

interface PauseModalProps {
  onResume: () => void;
  onReturnToMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onReturnToMainMenu }) => {
  const { 
    currentZone, 
    dungeonTier, 
    level, 
    stats, 
    gold, 
    echoShards, 
    saveCurrentGame, 
    openModal,
    settings 
  } = useGameStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmMenu, setShowConfirmMenu] = useState(false);
  const [showControlsGuide, setShowControlsGuide] = useState(false);

  const lang = settings.language;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCurrentGame();
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReturnToMenu = () => {
    soundManager.playSfx('click');
    soundManager.stopMusic();
    onReturnToMainMenu();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-fantasy-darkest border-2 border-fantasy-gold/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-950/60 via-fantasy-panel to-amber-950/60 border-b border-fantasy-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⏸️</span>
            <div>
              <h2 className="text-base font-extrabold text-fantasy-gold tracking-wider uppercase font-ui">
                {lang === 'th' ? 'พักการเล่น (PAUSED)' : 'GAME PAUSED'}
              </h2>
              <div className="text-[11px] text-slate-400">
                {currentZone === 'village' ? 'Everlight Village' : `Endless Ruins — Tier ${dungeonTier}`}
              </div>
            </div>
          </div>
          <button
            onClick={onResume}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Resume Game (ESC)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Character Overview Card */}
        <div className="p-4 bg-fantasy-panel/40 border-b border-fantasy-border/60 mx-4 mt-4 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono">
                LVL {level}
              </span>
              <span className="font-bold text-slate-200">Kael (Dragon Warrior)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin size={12} className="text-sky-400" />
              <span>{currentZone === 'village' ? 'Safe Zone' : 'Dungeon'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Heart size={14} className="text-rose-400 shrink-0" />
              <span className="text-slate-300">HP:</span>
              <span className="font-mono font-bold text-rose-300 ml-auto">
                {Math.round(stats.hp)} / {stats.maxHp}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Zap size={14} className="text-sky-400 shrink-0" />
              <span className="text-slate-300">MP:</span>
              <span className="font-mono font-bold text-sky-300 ml-auto">
                {Math.round(stats.mp)} / {stats.maxMp}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Coins size={14} className="text-amber-400 shrink-0" />
              <span className="text-slate-300">Gold:</span>
              <span className="font-mono font-bold text-amber-300 ml-auto">{gold}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Gem size={14} className="text-cyan-400 shrink-0" />
              <span className="text-slate-300">Echo:</span>
              <span className="font-mono font-bold text-cyan-300 ml-auto">{echoShards}</span>
            </div>
          </div>
        </div>

        {/* Content Area: Main Pause Menu or Controls Guide or Confirmation */}
        <div className="p-4 flex flex-col gap-2.5">
          {showConfirmMenu ? (
            /* Return to Menu Confirmation Box */
            <div className="bg-rose-950/40 border border-rose-500/50 p-4 rounded-xl flex flex-col gap-3 text-center animate-in fade-in duration-150">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-200">
                  {lang === 'th' ? 'กลับสู่หน้าหลัก?' : 'Return to Main Menu?'}
                </h3>
                <p className="text-xs text-rose-300/80 mt-1">
                  {lang === 'th' 
                    ? 'ความคืบหน้าที่ไม่ได้บันทึกจะสูญหาย คุณต้องการกลับหรือไม่?'
                    : 'Any unsaved progress since your last save will be lost.'}
                </p>
              </div>
              <div className="flex gap-2 justify-center mt-1">
                <GameButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmMenu(false)}
                >
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </GameButton>
                <GameButton
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmReturnToMenu}
                >
                  {lang === 'th' ? 'ใช่, กลับสู่หน้าหลัก' : 'Yes, Exit to Menu'}
                </GameButton>
              </div>
            </div>
          ) : showControlsGuide ? (
            /* Controls Quick Guide Box */
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-2 max-h-56 overflow-y-auto text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Keyboard size={14} /> Quick Controls Guide
                </span>
                <button
                  onClick={() => setShowControlsGuide(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">WASD / Arrows</span>: Move</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">Left Click</span>: Attack</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">Space</span>: Dodge Roll</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">Shift</span>: Sprint</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">1 - 6</span>: Cast Skills</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">I</span>: Inventory</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">C</span>: Character Stats</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">K</span>: Skill Tree (36)</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">Q</span>: Quest Journal</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">P</span>: Pet Companion</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">H</span>: Egg Hatchery</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">F2</span>: Sandbox Console</div>
                <div><span className="font-mono text-amber-400 bg-slate-950 px-1 py-0.5 rounded">ESC</span>: Pause / Close</div>
              </div>
              <GameButton
                variant="secondary"
                size="sm"
                onClick={() => setShowControlsGuide(false)}
                className="mt-1"
              >
                Back to Menu
              </GameButton>
            </div>
          ) : (
            /* Standard Pause Menu Actions */
            <div className="flex flex-col gap-2">
              <GameButton
                variant="primary"
                size="md"
                icon={<Play size={16} />}
                onClick={onResume}
                className="w-full justify-center"
              >
                {lang === 'th' ? 'เล่นต่อ (Resume)' : 'Resume Game'}
              </GameButton>

              <GameButton
                variant="success"
                size="md"
                icon={<Save size={16} />}
                isLoading={isSaving}
                onClick={handleSave}
                className="w-full justify-center"
              >
                {lang === 'th' ? 'บันทึกเกม (Save Game)' : 'Save Game'}
              </GameButton>

              <div className="grid grid-cols-2 gap-2">
                <GameButton
                  variant="secondary"
                  size="md"
                  icon={<SettingsIcon size={14} />}
                  onClick={() => openModal('settings')}
                  className="w-full justify-center"
                >
                  {lang === 'th' ? 'การตั้งค่า' : 'Settings'}
                </GameButton>

                <GameButton
                  variant="secondary"
                  size="md"
                  icon={<HelpCircle size={14} />}
                  onClick={() => setShowControlsGuide(true)}
                  className="w-full justify-center"
                >
                  {lang === 'th' ? 'ปุ่มควบคุม' : 'Controls'}
                </GameButton>
              </div>

              <div className="pt-2 border-t border-fantasy-border/40">
                <GameButton
                  variant="ghost"
                  size="md"
                  icon={<Home size={14} className="text-rose-400" />}
                  onClick={() => setShowConfirmMenu(true)}
                  className="w-full justify-center text-rose-300 hover:text-rose-200 hover:bg-rose-950/30"
                >
                  {lang === 'th' ? 'กลับสู่หน้าหลัก' : 'Return to Main Menu'}
                </GameButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
