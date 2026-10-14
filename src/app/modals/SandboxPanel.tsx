import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { 
  sandboxManager, 
  CombatLogEntry, 
  CommandHistoryEntry 
} from '../../features/sandbox/sandboxManager';
import { ALL_SKILLS_36 } from '../../features/skills/skillData';
import { ITEM_REGISTRY } from '../../features/items/itemRegistry';
import { 
  X, 
  Wrench, 
  Shield, 
  Zap, 
  Sparkles, 
  Coins, 
  MapPin, 
  Eye, 
  Activity, 
  Egg, 
  Heart, 
  Terminal, 
  Search, 
  Copy, 
  Trash2, 
  Play
} from 'lucide-react';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { getAllPetSpecies } from '../../features/pets/petRegistry';

type SandboxTab = 'console' | 'character' | 'skills' | 'items' | 'pets' | 'world' | 'combat';

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

  const [activeTab, setActiveTab] = useState<SandboxTab>('console');
  const [godMode, setGodMode] = useState(sandboxManager.getConfig().godMode);
  const [infiniteMana, setInfiniteMana] = useState(sandboxManager.getConfig().infiniteMana);
  const [infiniteStamina, setInfiniteStamina] = useState(sandboxManager.getConfig().infiniteStamina);
  const [zeroCooldowns, setZeroCooldowns] = useState(sandboxManager.getConfig().zeroCooldowns);
  const [disableAI, setDisableAI] = useState(sandboxManager.getConfig().disableEnemyAI);
  const [dps, setDps] = useState(0);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);

  // CLI state
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState<CommandHistoryEntry[]>([]);
  const [commandFilter, setCommandFilter] = useState<'all' | 'success' | 'error'>('all');
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [itemSearch, setItemSearch] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const cfg = sandboxManager.getConfig();
      setDps(cfg.dps);
      setCombatLogs([...cfg.combatLogs]);
      setCliHistory([...sandboxManager.getCommandHistory()]);
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

  // CLI Command Execution
  const handleExecute = (customCmd?: string) => {
    const toRun = customCmd !== undefined ? customCmd : cliInput;
    if (!toRun.trim()) return;

    const result = sandboxManager.executeCommand(toRun);
    setCliHistory([...sandboxManager.getCommandHistory()]);
    setCliInput('');
    setHistoryPointer(-1);

    if (result.success) {
      showNotification('COMMAND EXECUTED', result.message.split('\n')[0], 'success');
    } else {
      showNotification('COMMAND ERROR', result.message, 'error');
    }

    // Auto-scroll log
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = 0;
      }
    }, 50);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // CRITICAL: Stop key bleed to Phaser (WASD, 1-6, Space)

    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const hist = sandboxManager.getCommandHistory();
      if (hist.length === 0) return;
      const nextIdx = Math.min(hist.length - 1, historyPointer + 1);
      setHistoryPointer(nextIdx);
      setCliInput(hist[nextIdx].command);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const hist = sandboxManager.getCommandHistory();
      const nextIdx = historyPointer - 1;
      if (nextIdx < 0) {
        setHistoryPointer(-1);
        setCliInput('');
      } else {
        setHistoryPointer(nextIdx);
        setCliInput(hist[nextIdx].command);
      }
    }
  };

  const handleCopyLogs = () => {
    soundManager.playSfx('click');
    const logs = sandboxManager.getCommandHistory();
    const formatted = logs
      .map((l) => `[${l.timestamp}] > ${l.command} [${l.result.success ? 'OK' : 'ERR'}]\n${l.result.message}`)
      .join('\n---\n');

    navigator.clipboard.writeText(formatted || 'No logs recorded.').then(() => {
      showNotification('CLIPBOARD', 'Command history logs copied to clipboard!', 'info');
    });
  };

  const handleClearLogs = () => {
    soundManager.playSfx('click');
    sandboxManager.clearCommandHistory();
    setCliHistory([]);
    showNotification('SANDBOX', 'Console command logs cleared.', 'info');
  };

  const filteredHistory = cliHistory.filter((entry) => {
    if (commandFilter === 'success') return entry.result.success;
    if (commandFilter === 'error') return !entry.result.success;
    return true;
  });

  const filteredItems = Object.values(ITEM_REGISTRY).filter((i) => {
    if (!itemSearch.trim()) return true;
    const query = itemSearch.toLowerCase();
    return i.nameEn.toLowerCase().includes(query) || i.id.toLowerCase().includes(query);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-150">
      <div className="bg-fantasy-darkest border-2 border-amber-500/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-amber-950/40 px-6 py-4 flex items-center justify-between border-b border-amber-500/50">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛠️</span>
            <div>
              <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <span>SANDBOX DEVELOPER CONSOLE 3.0</span>
                <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black font-mono">F2</span>
              </h2>
              <div className="text-[11px] text-amber-200/80">
                Command Engine, Telemetry & Balance Testing Environment
              </div>
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
        <div className="grid grid-cols-7 bg-fantasy-panel/60 border-b border-fantasy-border text-xs font-bold">
          <button
            onClick={() => setActiveTab('console')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'console' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={14} /> CLI
          </button>
          <button
            onClick={() => setActiveTab('character')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'character' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap size={14} /> Hero
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'skills' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} /> Skills
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
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {/* --- TAB: CLI CONSOLE --- */}
          {activeTab === 'console' && (
            <div className="flex flex-col gap-3">
              {/* Toolbar & Filter Bar */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 px-1 font-mono">Filter:</span>
                  <button
                    onClick={() => setCommandFilter('all')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      commandFilter === 'all' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({cliHistory.length})
                  </button>
                  <button
                    onClick={() => setCommandFilter('success')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      commandFilter === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OK ({cliHistory.filter(h => h.result.success).length})
                  </button>
                  <button
                    onClick={() => setCommandFilter('error')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      commandFilter === 'error' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Errors ({cliHistory.filter(h => !h.result.success).length})
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyLogs}
                    className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                    title="Copy command history logs"
                  >
                    <Copy size={12} />
                    <span>Copy Logs</span>
                  </button>
                  <button
                    onClick={handleClearLogs}
                    className="flex items-center gap-1 text-[11px] bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/40 transition-colors"
                    title="Clear console output"
                  >
                    <Trash2 size={12} />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Terminal Logs Window */}
              <div
                ref={logContainerRef}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-56 overflow-y-auto font-mono text-[11px] flex flex-col gap-2.5 shadow-inner"
              >
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded-lg border text-xs leading-relaxed ${
                        item.result.success 
                          ? 'bg-slate-900/70 border-slate-800/80 text-slate-200' 
                          : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1 mb-1 text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{item.timestamp}</span>
                          <span className="text-amber-300 font-bold">&gt; {item.command}</span>
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                            item.result.success
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {item.result.success ? 'SUCCESS' : 'ERROR'}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap font-sans text-xs text-slate-300">
                        {item.result.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-center my-auto py-8">
                    Type a command or click a quick suggestion below (e.g. 'help', 'godmode', 'heal', 'gold 1000').
                  </div>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">Quick:</span>
                {['help', 'godmode', 'heal', 'gold 1000', 'shards 10', 'unlockskills', 'hatchall', 'tp dungeon3'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => handleExecute(cmd)}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700/80 px-2 py-0.5 rounded-md font-mono transition-colors"
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              {/* Command Input Bar */}
              <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/60 rounded-xl p-1.5 shadow-lg">
                <span className="text-amber-400 font-bold font-mono pl-2 text-sm">&gt;</span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a sandbox command (Press Enter to execute, Up/Down for history)..."
                  className="bg-transparent text-slate-100 placeholder-slate-500 text-xs flex-1 outline-none font-mono py-1"
                />
                <button
                  onClick={() => handleExecute()}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Execute</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB: HERO / CHARACTER --- */}
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
                      showNotification('SANDBOX', 'Vitals restored to 100%!', 'success');
                    }}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold px-3 py-1.5 rounded-lg"
                  >
                    Restore Full HP/MP/SP
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: SKILLS --- */}
          {activeTab === 'skills' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Class Talent Trees (36 Skills):</div>
                  <div className="text-[11px] text-slate-400">Current Specialization: <span className="text-amber-300 font-bold capitalize">{specialization}</span></div>
                </div>
                <button
                  onClick={handleUnlockAllSkills}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow border border-purple-400/40"
                >
                  ⚡ Unlock All 36 Skills (Max Rank)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.values(ALL_SKILLS_36).slice(0, 16).map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-fantasy-panel border border-fantasy-border p-2 rounded-lg flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-200 truncate">{skill.nameEn}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{skill.element} • CD: {skill.cooldownMs/1000}s</div>
                    </div>
                    <button
                      onClick={() => {
                        useGameStore.getState().upgradeSkill(skill.id);
                        showNotification('SANDBOX', `Upgraded skill: ${skill.nameEn}`, 'success');
                      }}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 px-2 py-1 rounded shrink-0 font-bold"
                    >
                      +Upgrade
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- TAB: ITEMS --- */}
          {activeTab === 'items' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-bold text-slate-300">Fast Item Spawner:</div>
                {/* Search Bar with stopPropagation */}
                <div className="relative w-64">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()} // Stop bleed to Phaser
                    placeholder="Search item name or ID..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs max-h-72 overflow-y-auto pr-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      addItemToInventory(item.id, item.stackable ? 5 : 1);
                      soundManager.playSfx('pickup');
                      showNotification('SANDBOX', `Spawned ${item.nameEn}`, 'loot');
                    }}
                    className="bg-fantasy-panel hover:bg-slate-800 border border-fantasy-border p-2 rounded-lg text-left flex items-center justify-between transition-colors"
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-medium text-slate-200">{item.nameEn}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{item.rarity} • {item.type}</div>
                    </div>
                    <span className="text-[10px] bg-slate-900 text-amber-400 border border-slate-800 px-1.5 py-0.5 rounded shrink-0 font-bold">
                      +Spawn
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- TAB: WORLD --- */}
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

          {/* --- TAB: PETS --- */}
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

          {/* --- TAB: COMBAT / TELEMETRY --- */}
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
