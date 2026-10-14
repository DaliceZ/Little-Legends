import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { t } from '../../shared/localization';
import { 
  Shield, 
  Sparkles, 
  BookOpen, 
  Backpack, 
  Settings as SettingsIcon, 
  Coins, 
  Gem,
  Heart,
  Zap,
  Wrench,
  MapPin
} from 'lucide-react';
import { getQuestDefinition } from '../../features/quests/questRegistry';
import { ALL_SKILLS_36 } from '../../features/skills/skillData';

export const GameHUD: React.FC = () => {
  const { 
    level, 
    exp, 
    stats, 
    gold, 
    echoShards, 
    quests, 
    notifications,
    openModal,
    settings,
    inventory,
    useConsumable,
    kaelPortrait,
    hotbar,
    currentZone,
    dungeonTier,
    isSandbox,
  } = useGameStore();

  const lang = settings.language;
  const nextLevelExp = Math.floor(100 * Math.pow(level, 1.45));
  const expPercent = Math.min(100, Math.max(0, (exp / nextLevelExp) * 100));
  const hpPercent = Math.min(100, Math.max(0, (stats.hp / stats.maxHp) * 100));
  const mpPercent = Math.min(100, Math.max(0, (stats.mp / stats.maxMp) * 100));
  const spPercent = Math.min(100, Math.max(0, (stats.sp / stats.maxSp) * 100));

  // Find active quest for tracker
  const activeQuestState = quests.find((q) => q.status === 'active' || q.status === 'completed');
  const activeQuestDef = activeQuestState ? getQuestDefinition(activeQuestState.questId) : null;

  // Quick consumables
  const healthPotion = inventory.find((i) => i.defId === 'item_health_potion');
  const manaPotion = inventory.find((i) => i.defId === 'item_mana_potion');

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 select-none">
      {/* --- TOP ROW --- */}
      <div className="flex justify-between items-start w-full">
        {/* Left: Player Profile & Stat Bars */}
        <div className="pointer-events-auto bg-fantasy-dark/90 backdrop-blur-md border border-fantasy-border rounded-xl p-3 shadow-2xl flex items-center gap-3">
          {/* Avatar & Level */}
          <div className="relative">
            <div className="w-14 h-14 rounded-lg bg-fantasy-panel border-2 border-fantasy-gold/60 flex items-center justify-center overflow-hidden shadow-inner">
              {kaelPortrait ? (
                <img src={kaelPortrait} alt="Drakon" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-fantasy-crystal">✦</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-fantasy-gold text-fantasy-darkest text-xs font-extrabold px-1.5 py-0.5 rounded shadow">
              Lv.{level}
            </div>
          </div>

          {/* Vitals Bars */}
          <div className="flex flex-col gap-1.5 w-44">
            {/* HP */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-200 mb-0.5">
                <span className="text-red-400 flex items-center gap-1"><Heart size={12} /> HP</span>
                <span>{Math.round(stats.hp)} / {stats.maxHp}</span>
              </div>
              <div className="h-2.5 w-full bg-fantasy-hpBg rounded-full overflow-hidden border border-red-950">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* MP */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-200 mb-0.5">
                <span className="text-blue-400 flex items-center gap-1"><Sparkles size={12} /> MP</span>
                <span>{Math.round(stats.mp)} / {stats.maxMp}</span>
              </div>
              <div className="h-2 w-full bg-fantasy-mpBg rounded-full overflow-hidden border border-blue-950">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-200"
                  style={{ width: `${mpPercent}%` }}
                />
              </div>
            </div>

            {/* SP (Stamina) */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-200 mb-0.5">
                <span className="text-emerald-400 flex items-center gap-1"><Zap size={12} /> SP</span>
                <span>{Math.round(stats.sp)} / {stats.maxSp}</span>
              </div>
              <div className="h-2 w-full bg-fantasy-spBg rounded-full overflow-hidden border border-emerald-950">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-200"
                  style={{ width: `${spPercent}%` }}
                />
              </div>
            </div>

            {/* EXP Bar */}
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-0.5">
              <div 
                className="bg-purple-400 h-full transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Notifications Toasts */}
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          {notifications.map((notif) => (
            <div 
              key={notif.id}
              className="bg-fantasy-dark/95 border border-fantasy-gold/50 text-slate-100 px-4 py-2 rounded-lg shadow-xl text-center animate-bounce duration-500 backdrop-blur-sm"
            >
              <div className="text-xs font-bold text-fantasy-gold">{notif.title}</div>
              <div className="text-xs text-slate-200">{notif.message}</div>
            </div>
          ))}
        </div>

        {/* Right: Currencies, Minimap radar & Menu Bar */}
        <div className="flex flex-col items-end gap-2">
          {/* Location & Minimap Widget */}
          <div className="pointer-events-auto bg-fantasy-dark/95 backdrop-blur-md border border-fantasy-border rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs font-bold shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <MapPin size={14} className="text-fantasy-crystal" />
            <span className="text-slate-100 font-medium">
              {currentZone === 'village' ? 'Everlight Village' : `Endless Ruins (T${dungeonTier})`}
            </span>
            {isSandbox && (
              <span className="bg-purple-900/80 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border border-purple-500/40">
                SANDBOX
              </span>
            )}
          </div>

          {/* Currencies */}
          <div className="pointer-events-auto bg-fantasy-dark/90 backdrop-blur-md border border-fantasy-border rounded-xl px-3 py-1.5 flex items-center gap-4 text-xs font-bold shadow-lg">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Coins size={16} />
              <span>{gold}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-400">
              <Gem size={16} />
              <span>{echoShards}</span>
            </div>
          </div>

          {/* Quick Menu Icons */}
          <div className="pointer-events-auto flex items-center gap-1 bg-fantasy-dark/90 backdrop-blur-md border border-fantasy-border p-1 rounded-xl shadow-lg">
            <button 
              onClick={() => openModal('inventory')}
              className="p-2 hover:bg-fantasy-panel text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Inventory [I]"
            >
              <Backpack size={18} />
            </button>
            <button 
              onClick={() => openModal('character')}
              className="p-2 hover:bg-fantasy-panel text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Character Status [C]"
            >
              <Shield size={18} />
            </button>
            <button 
              onClick={() => openModal('skills')}
              className="p-2 hover:bg-fantasy-panel text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Skills [K]"
            >
              <Sparkles size={18} />
            </button>
            <button 
              onClick={() => openModal('quests')}
              className="p-2 hover:bg-fantasy-panel text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Quests [Q]"
            >
              <BookOpen size={18} />
            </button>
            <button 
              onClick={() => openModal('sandbox')}
              className="p-2 hover:bg-purple-900/40 text-purple-300 hover:text-purple-100 rounded-lg transition-colors border border-purple-500/30"
              title="Sandbox & Cheats Console [F2]"
            >
              <Wrench size={18} />
            </button>
            <button 
              onClick={() => openModal('settings')}
              className="p-2 hover:bg-fantasy-panel text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Settings [Esc]"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW --- */}
      <div className="flex justify-between items-end w-full">
        {/* Quick Consumables */}
        <div className="pointer-events-auto flex items-center gap-2">
          {healthPotion && (
            <button 
              onClick={() => useConsumable(healthPotion.instanceId)}
              className="bg-fantasy-dark/90 hover:bg-fantasy-panel border border-red-500/50 p-2 rounded-xl flex items-center gap-2 text-xs text-red-200 transition-all shadow-lg active:scale-95"
              title="Click to drink Health Potion"
            >
              <Heart size={16} className="text-red-400" />
              <span>+{healthPotion.quantity}</span>
            </button>
          )}
          {manaPotion && (
            <button 
              onClick={() => useConsumable(manaPotion.instanceId)}
              className="bg-fantasy-dark/90 hover:bg-fantasy-panel border border-blue-500/50 p-2 rounded-xl flex items-center gap-2 text-xs text-blue-200 transition-all shadow-lg active:scale-95"
              title="Click to drink Mana Potion"
            >
              <Sparkles size={16} className="text-blue-400" />
              <span>+{manaPotion.quantity}</span>
            </button>
          )}
        </div>

        {/* Center: 6-Slot Multi-Hotbar */}
        <div className="pointer-events-auto bg-fantasy-dark/95 backdrop-blur-md border-2 border-fantasy-border/90 px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-2xl">
          {/* Base Actions: Slash & Dodge */}
          <div className="flex items-center gap-2 pr-2.5 border-r border-fantasy-border/60">
            <div className="flex flex-col items-center">
              <kbd className="bg-fantasy-panel px-1.5 py-0.5 rounded border border-fantasy-border font-pixel text-[10px] text-fantasy-gold">J</kbd>
              <span className="text-[9px] text-slate-400">Slash</span>
            </div>
            <div className="flex flex-col items-center">
              <kbd className="bg-fantasy-panel px-1.5 py-0.5 rounded border border-fantasy-border font-pixel text-[10px] text-fantasy-crystal">Space</kbd>
              <span className="text-[9px] text-slate-400">Dodge</span>
            </div>
          </div>

          {/* 6 Hotbar Skill Slots */}
          <div className="flex items-center gap-1.5">
            {hotbar.map((skillId, idx) => {
              const skill = ALL_SKILLS_36[skillId];
              return (
                <div key={idx} className="relative group flex flex-col items-center">
                  <button
                    onClick={() => {
                      const game = (window as any).Phaser?.GAMES?.[0];
                      const scene = game?.scene?.getScene('WorldScene') || game?.scene?.getScene('DungeonScene');
                      if (scene && (scene as any).performSkillById) {
                        (scene as any).performSkillById(skillId);
                      }
                    }}
                    className={`w-11 h-11 rounded-xl bg-fantasy-panel hover:bg-slate-800 border-2 flex items-center justify-center transition-all shadow-md active:scale-90 text-lg ${
                      skill?.isUltimate
                        ? 'border-amber-400/80 shadow-amber-500/20 shadow-lg'
                        : 'border-fantasy-border hover:border-fantasy-crystal/70'
                    }`}
                    title={
                      skill 
                        ? `${lang === 'th' ? skill.nameTh : skill.nameEn} (Hotkey [${idx + 1}])\n${lang === 'th' ? skill.descriptionTh : skill.descriptionEn}` 
                        : `Slot [${idx + 1}]`
                    }
                  >
                    {skill ? (
                      skill.tree === 'blade_dancer' ? '🌀' : 
                      skill.tree === 'guardian' ? '🛡️' : 
                      skill.tree === 'fire_mage' ? '🔥' : 
                      skill.tree === 'frost_mage' ? '❄️' : 
                      skill.tree === 'shadow_assassin' ? '🗡️' : '🔮'
                    ) : '•'}
                  </button>
                  <span className="absolute -top-1.5 -right-1 bg-slate-900 border border-slate-700 text-fantasy-gold font-mono text-[9px] font-bold px-1 rounded-sm shadow">
                    {idx + 1}
                  </span>
                  {skill && (
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                      {skill.costMp > 0 ? `${skill.costMp}m` : skill.costSp > 0 ? `${skill.costSp}s` : '0'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Quest Tracker */}
        <div className="pointer-events-auto w-64 bg-fantasy-dark/90 backdrop-blur-md border border-fantasy-border rounded-xl p-3 shadow-xl">
          <div className="text-[11px] font-bold text-fantasy-gold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <BookOpen size={14} />
            <span>{t('activeQuest', lang)}</span>
          </div>
          {activeQuestDef && activeQuestState ? (
            <div>
              <div className="text-xs font-semibold text-slate-100">
                {lang === 'th' ? activeQuestDef.titleTh : activeQuestDef.titleEn}
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {activeQuestDef.objectives.map((obj) => {
                  const stateObj = activeQuestState.objectives.find((o) => o.id === obj.id);
                  const count = stateObj ? stateObj.currentCount : 0;
                  const isDone = count >= obj.targetCount;
                  return (
                    <div key={obj.id} className="text-[11px] flex items-center justify-between text-slate-300">
                      <span className={isDone ? 'line-through text-emerald-400' : ''}>
                        {lang === 'th' ? obj.descriptionTh.split('(')[0] : obj.descriptionEn.split('(')[0]}
                      </span>
                      <span className="font-mono font-bold text-xs">
                        {count}/{obj.targetCount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              {t('noQuests', lang)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
