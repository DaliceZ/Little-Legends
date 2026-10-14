import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sandboxManager, CombatLogEntry } from '../../features/sandbox/sandboxManager';
import { ALL_SKILLS_36 } from '../../features/skills/skillData';
import { ITEM_REGISTRY } from '../../features/items/itemRegistry';
import { X, Wrench, Shield, Zap, Sparkles, Coins, MapPin, Eye, Activity, Egg, Heart } from 'lucide-react';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { getAllPetSpecies } from '../../features/pets/petRegistry';

export const SandboxPanel: React.FC = () => {
  const { 
    closeModal, 
    updateExpAndGold, 
    addItemToInventory, 
    showNotification,
    setPlayerStats,
    stats,
    specialization,
    pets,
    petEggs,
    activePetId,
    setActivePet,
    addEgg,
    hatchEggAtSlot
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'character' | 'skills' | 'items' | 'world' | 'combat' | 'pets'>('character');
  const [godMode, setGodMode] = useState(sandboxManager.getConfig().godMode);
  const [infiniteMana, setInfiniteMana] = useState(sandboxManager.getConfig().infiniteMana);
  const [infiniteStamina, setInfiniteStamina] = useState(sandboxManager.getConfig().infiniteStamina);
  const [zeroCooldowns, setZeroCooldowns] = useState(sandboxManager.getConfig().zeroCooldowns);
  const [disableAI, setDisableAI] = useState(sandboxManager.getConfig().disableEnemyAI);
  const [dps, setDps] = useState(0);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cfg = sandboxManager.getConfig();
      setDps(cfg.dps);
      setCombatLogs([...cfg.combatLogs]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleGodMode = () => {
    const next = !godMode;
    setGodMode(next);
    sandboxManager.setToggle('godMode', next);
    soundManager.playSfx('crystal');
    showNotification('SANDBOX', `God Mode: ${next ? 'ENABLED' : 'DISABLED'}`, 'info');
  };

  const handleToggleInfiniteMana = () => {
    const next = !infiniteMana;
    setInfiniteMana(next);
    sandboxManager.setToggle('infiniteMana', next);
    soundManager.playSfx('crystal');
    showNotification('SANDBOX', `Infinite Mana: ${next ? 'ENABLED' : 'DISABLED'}`, 'info');
  };

  const handleToggleInfiniteStamina = () => {
    const next = !infiniteStamina;
    setInfiniteStamina(next);
    sandboxManager.setToggle('infiniteStamina', next);
    soundManager.playSfx('crystal');
    showNotification('SANDBOX', `Infinite Stamina: ${next ? 'ENABLED' : 'DISABLED'}`, 'info');
  };

  const handleToggleZeroCooldowns = () => {
    const next = !zeroCooldowns;
    setZeroCooldowns(next);
    sandboxManager.setToggle('zeroCooldowns', next);
    soundManager.playSfx('crystal');
    showNotification('SANDBOX', `Zero Cooldowns: ${next ? 'ENABLED' : 'DISABLED'}`, 'info');
  };

  const handleToggleDisableAI = () => {
    const next = !disableAI;
    setDisableAI(next);
    sandboxManager.setToggle('disableEnemyAI', next);
    soundManager.playSfx('click');
    showNotification('SANDBOX', `Enemy AI: ${next ? 'FROZEN' : 'ACTIVE'}`, 'info');
  };

  const handleUnlockAllSkills = () => {
    const allSkillNodes = Object.values(ALL_SKILLS_36).map((s) => ({
      id: s.id,
      currentRank: s.maxRank,
    }));
    useGameStore.setState({ skills: allSkillNodes });
    soundManager.playSfx('levelup');
    showNotification('SANDBOX', 'All 36 Skills Unlocked at Maximum Rank!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-fantasy-darkest border-2 border-amber-500/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-amber-950/40 px-6 py-4 flex items-center justify-between border-b border-amber-500/50">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛠️</span>
            <div>
              <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <span>SANDBOX DEVELOPER CONSOLE</span>
                <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black font-mono">F2</span>
              </h2>
              <div className="text-[11px] text-amber-200/80">Experimental Controls & Balance Testing Tools</div>
            </div>
          </div>
          <button 
            onClick={closeModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="grid grid-cols-6 bg-fantasy-panel/60 border-b border-fantasy-border text-xs font-bold">
          <button
            onClick={() => setActiveTab('character')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'character' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap size={14} /> Character
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'skills' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} /> 36 Skills
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'items' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins size={14} /> Items
          </button>
          <button
            onClick={() => setActiveTab('pets')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'pets' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart size={14} /> Pets
          </button>
          <button
            onClick={() => setActiveTab('world')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'world' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin size={14} /> World
          </button>
          <button
            onClick={() => setActiveTab('combat')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'combat' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={14} /> Telemetry
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'character' && (
            <div className="flex flex-col gap-4">
              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleToggleGodMode}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between font-bold text-xs transition-all ${
                    godMode ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300' : 'bg-fantasy-panel border-fantasy-border text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2"><Shield size={16} /> God Mode</span>
                  <span className="text-[10px] uppercase font-mono">{godMode ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={handleToggleInfiniteMana}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between font-bold text-xs transition-all ${
                    infiniteMana ? 'bg-blue-950/50 border-blue-500 text-blue-300' : 'bg-fantasy-panel border-fantasy-border text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2"><Sparkles size={16} /> Infinite Mana</span>
                  <span className="text-[10px] uppercase font-mono">{infiniteMana ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={handleToggleInfiniteStamina}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between font-bold text-xs transition-all ${
                    infiniteStamina ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300' : 'bg-fantasy-panel border-fantasy-border text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2"><Zap size={16} /> Infinite Stamina</span>
                  <span className="text-[10px] uppercase font-mono">{infiniteStamina ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={handleToggleZeroCooldowns}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between font-bold text-xs transition-all ${
                    zeroCooldowns ? 'bg-purple-950/50 border-purple-500 text-purple-300' : 'bg-fantasy-panel border-fantasy-border text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2"><Wrench size={16} /> Zero Cooldowns</span>
                  <span className="text-[10px] uppercase font-mono">{zeroCooldowns ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Currency & Vitals */}
              <div className="pt-2 border-t border-fantasy-border flex flex-col gap-2">
                <div className="text-xs font-bold text-slate-300">Fast Currency & Attributes:</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => updateExpAndGold(0, 1000)}
                    className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold px-3 py-1.5 rounded-lg"
                  >
                    +1,000 Gold
                  </button>
                  <button
                    onClick={() => updateExpAndGold(0, 10000)}
                    className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold px-3 py-1.5 rounded-lg"
                  >
                    +10,000 Gold
                  </button>
                  <button
                    onClick={() => updateExpAndGold(0, 0, 10)}
                    className="bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-sky-300 font-bold px-3 py-1.5 rounded-lg"
                  >
                    +10 Echo Shards
                  </button>
                  <button
                    onClick={() => updateExpAndGold(500, 0)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 font-bold px-3 py-1.5 rounded-lg"
                  >
                    +500 EXP
                  </button>
                  <button
                    onClick={() => {
                      setPlayerStats({
                        ...stats,
                        hp: stats.maxHp,
                        mp: stats.maxMp,
                        sp: stats.maxSp,
                      });
                      soundManager.playSfx('potion');
                      showNotification('SANDBOX', 'Vitals Fully Restored!', 'success');
                    }}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold px-3 py-1.5 rounded-lg"
                  >
                    Full Restore (HP/MP/SP)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-fantasy-panel p-3 rounded-xl border border-fantasy-border">
                <div>
                  <div className="text-xs font-bold text-slate-100">Unlock All 36 Skills</div>
                  <div className="text-[11px] text-slate-400">Instantly grants max rank on every specialization ability</div>
                </div>
                <button
                  onClick={handleUnlockAllSkills}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl text-xs transition-all shadow"
                >
                  Unlock All
                </button>
              </div>

              <div className="text-xs font-bold text-slate-300 mt-2">Change Active Combat Specialization:</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'blade_dancer', label: 'Blade Dancer' },
                  { id: 'guardian', label: 'Guardian' },
                  { id: 'fire_mage', label: 'Fire Mage' },
                  { id: 'frost_mage', label: 'Frost Mage' },
                  { id: 'shadow_assassin', label: 'Shadow Assassin' },
                  { id: 'echo_mage', label: 'Echo Sorcerer' },
                ].map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => {
                      useGameStore.setState({ specialization: spec.id as any });
                      showNotification('SANDBOX', `Active class set to ${spec.label}`, 'info');
                    }}
                    className={`p-2 rounded-lg text-xs font-bold border ${
                      specialization === spec.id 
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200' 
                        : 'bg-fantasy-panel border-fantasy-border text-slate-300'
                    }`}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-300">Fast Item Spawner:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.values(ITEM_REGISTRY).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItemToInventory(item.id, item.stackable ? 5 : 1)}
                    className="bg-fantasy-panel hover:bg-slate-800 border border-fantasy-border p-2 rounded-lg text-left flex items-center justify-between"
                  >
                    <span className="truncate pr-2">{item.nameEn}</span>
                    <span className="text-[10px] bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded shrink-0">
                      +Spawn
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'world' && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">Teleportation Portal:</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => {
                      const game = (window as any).Phaser?.GAMES?.[0];
                      if (game) game.scene.start('WorldScene');
                      closeModal();
                    }}
                    className="bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-900/50 p-2.5 rounded-xl font-bold text-emerald-200"
                  >
                    Everlight Village
                  </button>
                  <button
                    onClick={() => {
                      const game = (window as any).Phaser?.GAMES?.[0];
                      if (game) game.scene.start('DungeonScene', { tier: 1 });
                      closeModal();
                    }}
                    className="bg-purple-950/40 border border-purple-500/50 hover:bg-purple-900/50 p-2.5 rounded-xl font-bold text-purple-200"
                  >
                    Dungeon Tier 1
                  </button>
                  <button
                    onClick={() => {
                      const game = (window as any).Phaser?.GAMES?.[0];
                      if (game) game.scene.start('DungeonScene', { tier: 3 });
                      closeModal();
                    }}
                    className="bg-red-950/40 border border-red-500/50 hover:bg-red-900/50 p-2.5 rounded-xl font-bold text-red-200"
                  >
                    Dungeon Tier 3 (Boss)
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">AI Controls:</div>
                <button
                  onClick={handleToggleDisableAI}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    disableAI ? 'bg-red-950/50 border-red-500 text-red-300' : 'bg-fantasy-panel border-fantasy-border text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2"><Eye size={16} /> Enemy AI Simulation</span>
                  <span>{disableAI ? 'FROZEN' : 'ACTIVE'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pets' && (
            <div className="flex flex-col gap-4 text-xs">
              {/* Egg Spawning Cheats */}
              <div>
                <div className="font-bold text-slate-300 mb-2 flex items-center justify-between">
                  <span>Spawn Pet Eggs:</span>
                  <span className="text-slate-500 font-mono">Current Eggs: {petEggs.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      addEgg('common');
                      soundManager.playSfx('pickup');
                    }}
                    className="p-2.5 rounded-xl border border-emerald-600/50 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 font-bold flex items-center gap-2"
                  >
                    <span>🥚 Common Egg</span>
                  </button>
                  <button
                    onClick={() => {
                      addEgg('uncommon');
                      soundManager.playSfx('pickup');
                    }}
                    className="p-2.5 rounded-xl border border-orange-600/50 bg-orange-950/30 hover:bg-orange-900/40 text-orange-300 font-bold flex items-center gap-2"
                  >
                    <span>🥚 Uncommon Egg</span>
                  </button>
                  <button
                    onClick={() => {
                      addEgg('rare');
                      soundManager.playSfx('pickup');
                    }}
                    className="p-2.5 rounded-xl border border-purple-600/50 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 font-bold flex items-center gap-2"
                  >
                    <span>🥚 Rare Egg</span>
                  </button>
                  <button
                    onClick={() => {
                      addEgg('epic');
                      soundManager.playSfx('pickup');
                    }}
                    className="p-2.5 rounded-xl border border-sky-600/50 bg-sky-950/30 hover:bg-sky-900/40 text-sky-300 font-bold flex items-center gap-2"
                  >
                    <span>🥚 Epic Egg</span>
                  </button>
                  <button
                    onClick={() => {
                      addEgg('legendary', 'baby_dragon');
                      soundManager.playSfx('pickup');
                    }}
                    className="p-2.5 rounded-xl border border-amber-500/70 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 font-bold flex items-center gap-2 col-span-2 sm:col-span-1 shadow"
                  >
                    <span>🐲 Legendary Dragon Egg</span>
                  </button>
                </div>
              </div>

              {/* Roster & Quick Hatch Controls */}
              <div>
                <div className="font-bold text-slate-300 mb-2">Pet Roster Automation:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const allSpecies = getAllPetSpecies();
                      allSpecies.forEach((sp) => {
                        const exists = pets.some((p) => p.speciesId === sp.id);
                        if (!exists) {
                          useGameStore.getState().addPet(sp.id);
                        }
                      });
                      soundManager.playSfx('levelup');
                      showNotification('SANDBOX', 'All 8 Pet Species Unlocked!', 'success');
                    }}
                    className="p-2.5 rounded-xl border border-amber-500/70 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-600/40 hover:to-yellow-600/40 text-amber-200 font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} /> Unlock All 8 Species
                  </button>

                  <button
                    onClick={() => {
                      if (petEggs.length === 0) {
                        showNotification('SANDBOX', 'No eggs to hatch!', 'warning');
                        return;
                      }
                      const eggsToHatch = [...petEggs];
                      eggsToHatch.forEach((e) => hatchEggAtSlot(e.id));
                      soundManager.playSfx('victory');
                      showNotification('SANDBOX', `Instantly hatched ${eggsToHatch.length} eggs!`, 'success');
                    }}
                    className="p-2.5 rounded-xl border border-emerald-500/60 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-200 font-bold flex items-center justify-center gap-2"
                  >
                    <Egg size={14} /> Instant Hatch All Eggs
                  </button>
                </div>
              </div>

              {/* Active Companion Fast Actions */}
              <div>
                <div className="font-bold text-slate-300 mb-2">Fast Summon Companion:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      let dragon = pets.find((p) => p.speciesId === 'baby_dragon');
                      if (!dragon) {
                        dragon = useGameStore.getState().addPet('baby_dragon');
                      }
                      setActivePet(dragon.id);
                      soundManager.playSfx('crystal');
                      showNotification('SANDBOX', 'Summoned Baby Dragon companion!', 'info');
                    }}
                    className="p-2 rounded-xl bg-pink-950/40 border border-pink-500/50 hover:bg-pink-900/50 text-pink-300 font-bold"
                  >
                    🐲 Baby Dragon
                  </button>
                  <button
                    onClick={() => {
                      let fox = pets.find((p) => p.speciesId === 'ember_fox');
                      if (!fox) {
                        fox = useGameStore.getState().addPet('ember_fox');
                      }
                      setActivePet(fox.id);
                      soundManager.playSfx('crystal');
                      showNotification('SANDBOX', 'Summoned Ember Fox companion!', 'info');
                    }}
                    className="p-2 rounded-xl bg-orange-950/40 border border-orange-500/50 hover:bg-orange-900/50 text-orange-300 font-bold"
                  >
                    🦊 Ember Fox
                  </button>
                  <button
                    onClick={() => {
                      setActivePet(null);
                      soundManager.playSfx('click');
                      showNotification('SANDBOX', 'Dismissed active pet.', 'info');
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold"
                  >
                    ✕ Dismiss Active
                  </button>
                </div>
              </div>

              {/* Level Up Active Pet */}
              {activePetId && (
                <div>
                  <div className="font-bold text-slate-300 mb-2">Active Pet Level Testing:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        useGameStore.getState().feedPet(activePetId, 500);
                        soundManager.playSfx('levelup');
                      }}
                      className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/50 hover:bg-purple-900/50 text-purple-300 font-bold"
                    >
                      +500 EXP (Level Boost)
                    </button>
                    <button
                      onClick={() => {
                        useGameStore.getState().feedPet(activePetId, 10000);
                        soundManager.playSfx('victory');
                      }}
                      className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/50 hover:bg-amber-900/50 text-amber-300 font-bold"
                    >
                      MAX LEVEL (Lv. 25)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-fantasy-panel p-3 rounded-xl border border-fantasy-border flex flex-col">
                  <span className="text-slate-400 text-[11px]">Real-Time DPS (3s window)</span>
                  <span className="text-2xl font-black text-amber-300 font-mono mt-1">{dps}</span>
                </div>
                <div className="bg-fantasy-panel p-3 rounded-xl border border-fantasy-border flex flex-col">
                  <span className="text-slate-400 text-[11px]">Total Damage Dealt</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    {sandboxManager.getConfig().totalDamageDealt}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">Live Combat Telemetry Log:</div>
                <div className="bg-black/60 p-3 rounded-xl border border-fantasy-border/60 max-h-40 overflow-y-auto font-mono text-[11px] flex flex-col gap-1">
                  {combatLogs.length > 0 ? (
                    combatLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500">{log.timestamp}</span>
                        <span>{log.source} ➔ {log.target}</span>
                        <span className={log.isCrit ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                          {log.isCrit && 'CRIT! '} -{log.damage} ({log.element})
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic text-center py-4">
                      Strike enemies or dummies to record combat telemetry
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
