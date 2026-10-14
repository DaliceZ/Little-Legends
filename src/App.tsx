import React, { useEffect, useState } from 'react';
import { GameCanvas } from './game/GameCanvas';
import { GameHUD } from './app/hud/GameHUD';
import { useGameStore } from './app/store/useGameStore';
import { InventoryModal } from './app/modals/InventoryModal';
import { CharacterModal } from './app/modals/CharacterModal';
import { SkillTreeModal } from './app/modals/SkillTreeModal';
import { QuestJournalModal } from './app/modals/QuestJournalModal';
import { ShopModal } from './app/modals/ShopModal';
import { CraftingModal } from './app/modals/CraftingModal';
import { DialogueBox } from './app/modals/DialogueBox';
import { SettingsModal } from './app/modals/SettingsModal';
import { GameOverModal } from './app/modals/GameOverModal';
import { MainMenuModal } from './app/modals/MainMenuModal';
import { SandboxPanel } from './app/modals/SandboxPanel';
import { PetModal } from './app/modals/PetModal';
import { HatcheryModal } from './app/modals/HatcheryModal';
import { saveService } from './persistence/saveService';
import { soundManager } from './shared/utils/soundSynthesizer';

export const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { 
    activeModal, 
    openModal, 
    closeModal, 
    currentDialogue, 
    closeDialogue,
    setSettings,
    stats,
    setPlayerStats 
  } = useGameStore();

  // Load saved settings on startup
  useEffect(() => {
    saveService.getSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
      soundManager.setVolumes(
        loadedSettings.masterVolume, 
        loadedSettings.sfxVolume, 
        loadedSettings.musicVolume
      );
    });
  }, [setSettings]);

  // Global hotkeys for UI menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if writing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!isPlaying) return;

      if (e.key === 'Escape') {
        if (currentDialogue) {
          closeDialogue();
        } else if (activeModal !== 'none') {
          closeModal();
        } else {
          openModal('settings');
        }
      } else if (e.key === 'i' || e.key === 'I') {
        if (activeModal === 'inventory') closeModal();
        else openModal('inventory');
      } else if (e.key === 'c' || e.key === 'C') {
        if (activeModal === 'character') closeModal();
        else openModal('character');
      } else if (e.key === 'k' || e.key === 'K') {
        if (activeModal === 'skills') closeModal();
        else openModal('skills');
      } else if (e.key === 'q' || e.key === 'Q') {
        if (activeModal === 'quests') closeModal();
        else openModal('quests');
      } else if (e.key === 'p' || e.key === 'P') {
        if (activeModal === 'pets') closeModal();
        else openModal('pets');
      } else if (e.key === 'h' || e.key === 'H') {
        if (activeModal === 'hatchery') closeModal();
        else openModal('hatchery');
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (activeModal === 'sandbox') closeModal();
        else openModal('sandbox');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, activeModal, currentDialogue, openModal, closeModal, closeDialogue]);

  const handleRespawn = () => {
    setPlayerStats({
      ...stats,
      hp: stats.maxHp,
      sp: stats.maxSp,
    });
    closeModal();
    // Restart WorldScene
    const game = (window as any).Phaser?.GAMES?.[0];
    if (game) {
      game.scene.start('WorldScene');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-fantasy-darkest text-slate-100 select-none">
      {/* Phaser Canvas */}
      <GameCanvas />

      {/* Main Game In-Play HUD */}
      {isPlaying && <GameHUD />}

      {/* Title / Main Menu Screen */}
      {!isPlaying && (
        <MainMenuModal onStartGame={() => setIsPlaying(true)} />
      )}

      {/* Dialogues */}
      {isPlaying && <DialogueBox />}

      {/* UI Modals */}
      {activeModal === 'inventory' && <InventoryModal />}
      {activeModal === 'character' && <CharacterModal />}
      {activeModal === 'skills' && <SkillTreeModal />}
      {activeModal === 'quests' && <QuestJournalModal />}
      {activeModal === 'pets' && <PetModal />}
      {activeModal === 'hatchery' && <HatcheryModal />}
      {activeModal === 'shop' && <ShopModal />}
      {activeModal === 'crafting' && <CraftingModal />}
      {activeModal === 'settings' && <SettingsModal />}
      {activeModal === 'gameover' && <GameOverModal onRespawn={handleRespawn} />}
      {activeModal === 'sandbox' && <SandboxPanel />}
    </div>
  );
};

export default App;
