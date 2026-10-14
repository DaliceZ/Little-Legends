import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getSkillsForTree, ALL_SKILLS_36 } from '../../features/skills/skillData';
import { Specialization } from '../../shared/types';
import { t } from '../../shared/localization';
import { 
  X, 
  Sparkles, 
  Shield, 
  Wind, 
  Flame, 
  Snowflake, 
  Eye, 
  ArrowUpCircle, 
  RotateCcw,
  CheckCircle2,
  Lock,
  PlusCircle
} from 'lucide-react';
import { soundManager } from '../../shared/utils/soundSynthesizer';

export const SkillTreeModal: React.FC = () => {
  const { 
    specialization, 
    skills, 
    upgradeSkill, 
    closeModal, 
    settings,
    hotbar,
    setHotbarSkill,
  } = useGameStore();

  const [selectedTree, setSelectedTree] = useState<Specialization>(specialization);
  const [assigningSkillId, setAssigningSkillId] = useState<string | null>(null);
  const lang = settings.language;

  const currentTreeSkills = getSkillsForTree(selectedTree);

  const treeTabs: { id: Specialization; labelEn: string; labelTh: string; icon: React.ReactNode; color: string }[] = [
    { id: 'blade_dancer', labelEn: 'Blade Dancer', labelTh: 'นักดาบวายุ', icon: <Wind size={14} />, color: 'text-emerald-400' },
    { id: 'guardian', labelEn: 'Guardian', labelTh: 'อัศวินพิทักษ์', icon: <Shield size={14} />, color: 'text-amber-400' },
    { id: 'fire_mage', labelEn: 'Fire Mage', labelTh: 'จอมเวทเพลิง', icon: <Flame size={14} />, color: 'text-red-400' },
    { id: 'frost_mage', labelEn: 'Frost Mage', labelTh: 'จอมเวทเหมันต์', icon: <Snowflake size={14} />, color: 'text-cyan-400' },
    { id: 'shadow_assassin', labelEn: 'Shadow Assassin', labelTh: 'นักฆ่าเงา', icon: <Eye size={14} />, color: 'text-purple-400' },
    { id: 'echo_mage', labelEn: 'Echo Sorcerer', labelTh: 'จ้าวแห่งผลึกเอคโค่', icon: <Sparkles size={14} />, color: 'text-sky-300' },
  ];

  const handleRespec = () => {
    soundManager.playSfx('levelup');
    useGameStore.setState({ skills: [] });
    useGameStore.getState().showNotification('RESPEC COMPLETE', 'All skill ranks reset and points refunded!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-fantasy-dark border-2 border-fantasy-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-fantasy-panel px-6 py-4 flex items-center justify-between border-b border-fantasy-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-lg font-extrabold text-fantasy-gold">
                {lang === 'th' ? 'ผังทักษะการต่อสู้ 6 สาย (Skill Mastery)' : '36 Mastery Skills & Specializations'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'th' ? 'เลือกสายการต่อสู้ อัปเกรดทักษะ และจัดใส่ Hotbar (1-6)' : 'Specialize your combat style, rank up skills, and slot into Hotbar 1-6'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRespec}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 transition-colors shadow"
              title="Reset all skills"
            >
              <RotateCcw size={12} />
              <span>{lang === 'th' ? 'รีเซ็ตสกิล' : 'Respec Skills'}</span>
            </button>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 6 Specialization Tabs */}
        <div className="grid grid-cols-6 bg-fantasy-darkest border-b border-fantasy-border">
          {treeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedTree(tab.id);
                setAssigningSkillId(null);
              }}
              className={`py-3 px-1 text-xs font-bold flex flex-col items-center justify-center gap-1 border-b-2 transition-all ${
                selectedTree === tab.id
                  ? 'border-fantasy-gold text-fantasy-gold bg-fantasy-panel/60 shadow-inner'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-fantasy-panel/20'
              }`}
            >
              <div className={tab.color}>{tab.icon}</div>
              <span className="text-[11px] truncate">{lang === 'th' ? tab.labelTh : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Active Tree Banner */}
          <div className="bg-fantasy-panel/80 border border-fantasy-border/60 p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {selectedTree === 'blade_dancer' ? '🌀' : 
                 selectedTree === 'guardian' ? '🛡️' : 
                 selectedTree === 'fire_mage' ? '🔥' : 
                 selectedTree === 'frost_mage' ? '❄️' : 
                 selectedTree === 'shadow_assassin' ? '🗡️' : '🔮'}
              </span>
              <div>
                <span className="text-sm font-bold text-slate-100 uppercase">
                  {selectedTree.replace('_', ' ')}
                </span>
                {specialization === selectedTree ? (
                  <span className="ml-2 bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-700 font-bold">
                    ACTIVE SPECIALIZATION
                  </span>
                ) : (
                  <span className="ml-2 text-slate-400 text-xs">
                    (Inactive style)
                  </span>
                )}
              </div>
            </div>

            {specialization !== selectedTree && (
              <button
                onClick={() => {
                  useGameStore.setState({ specialization: selectedTree });
                  useGameStore.getState().showNotification(
                    'SPECIALIZATION ACTIVATED',
                    `Adopted ${selectedTree.replace('_', ' ').toUpperCase()} fighting style!`,
                    'success'
                  );
                }}
                className="bg-fantasy-gold hover:bg-fantasy-goldBright text-fantasy-darkest text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all"
              >
                {lang === 'th' ? 'เปลี่ยนมาใช้สายนี้' : 'Activate Spec'}
              </button>
            )}
          </div>

          {/* Skill Nodes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentTreeSkills.map((skill) => {
              const userSkill = skills.find((s) => s.id === skill.id);
              const rank = userSkill ? userSkill.currentRank : (skill.currentRank || 0);
              const isMax = rank >= skill.maxRank;

              // Check prerequisites
              let prereqMet = true;
              if (skill.prerequisites && skill.prerequisites.length > 0) {
                prereqMet = skill.prerequisites.every((reqId) => {
                  const reqSkill = skills.find((s) => s.id === reqId);
                  return reqSkill && reqSkill.currentRank > 0;
                });
              }

              const isHotbarAssigned = hotbar.includes(skill.id);
              const hotbarIdx = hotbar.indexOf(skill.id);

              return (
                <div 
                  key={skill.id}
                  className={`bg-fantasy-panel border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    skill.isUltimate
                      ? 'border-amber-400/80 shadow-amber-500/10 shadow-lg bg-gradient-to-br from-fantasy-panel via-amber-950/20 to-fantasy-panel'
                      : prereqMet ? 'border-fantasy-border hover:border-slate-500' : 'border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border-2 shadow-inner ${
                      skill.isUltimate 
                        ? 'bg-amber-950/60 border-amber-400 text-amber-300' 
                        : 'bg-fantasy-darkest border-fantasy-crystal/60'
                    }`}>
                      {skill.tree === 'blade_dancer' ? '🌀' : 
                       skill.tree === 'guardian' ? '🛡️' : 
                       skill.tree === 'fire_mage' ? '🔥' : 
                       skill.tree === 'frost_mage' ? '❄️' : 
                       skill.tree === 'shadow_assassin' ? '🗡️' : '🔮'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-100">
                          {lang === 'th' ? skill.nameTh : skill.nameEn}
                        </span>
                        {skill.isUltimate && (
                          <span className="text-[9px] bg-amber-500 text-fantasy-darkest font-extrabold px-1.5 py-0.5 rounded shadow">
                            ULTIMATE
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-900 border border-slate-700 text-fantasy-gold px-1.5 py-0.5 rounded font-mono font-bold">
                          Tier {skill.tier} • R{rank}/{skill.maxRank}
                        </span>
                        {isHotbarAssigned && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold">
                            Slot [{hotbarIdx + 1}]
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 mt-1">
                        {lang === 'th' ? skill.descriptionTh : skill.descriptionEn}
                      </div>

                      {/* Cost & Cooldown info */}
                      <div className="flex items-center gap-3 text-[11px] font-mono mt-2">
                        {skill.costMp > 0 && (
                          <span className="text-blue-400">MP: {skill.costMp}</span>
                        )}
                        {skill.costSp > 0 && (
                          <span className="text-emerald-400">SP: {skill.costSp}</span>
                        )}
                        <span className="text-slate-400">CD: {(skill.cooldownMs / 1000).toFixed(1)}s</span>
                        <span className="text-amber-400 uppercase font-semibold">
                          x{skill.damageMultiplier} ATK
                        </span>
                      </div>

                      {/* Prerequisites hint */}
                      {skill.prerequisites && skill.prerequisites.length > 0 && (
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          {prereqMet ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={10} /> Requires: {skill.prerequisites.map((p) => ALL_SKILLS_36[p]?.nameEn).join(', ')}
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Lock size={10} /> Locked: Learn {skill.prerequisites.map((p) => ALL_SKILLS_36[p]?.nameEn).join(', ')} first
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer: Upgrade & Equip to Hotbar */}
                  <div className="mt-3 pt-2.5 border-t border-fantasy-border/50 flex items-center justify-between gap-2">
                    {/* Hotbar Slot Assigner */}
                    <div className="flex items-center gap-1">
                      {assigningSkillId === skill.id ? (
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                          <span className="text-[10px] text-slate-400 mr-1">Slot:</span>
                          {[0, 1, 2, 3, 4, 5].map((slotIdx) => (
                            <button
                              key={slotIdx}
                              onClick={() => {
                                setHotbarSkill(slotIdx, skill.id);
                                setAssigningSkillId(null);
                                soundManager.playSfx('pickup');
                              }}
                              className="w-5 h-5 bg-fantasy-panel hover:bg-fantasy-gold hover:text-fantasy-darkest text-fantasy-gold font-mono text-[10px] font-bold rounded flex items-center justify-center border border-slate-700"
                            >
                              {slotIdx + 1}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningSkillId(skill.id)}
                          className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-slate-900/60 hover:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                        >
                          <PlusCircle size={12} />
                          <span>{lang === 'th' ? 'ใส่ใน Hotbar' : 'Equip to Hotbar'}</span>
                        </button>
                      )}
                    </div>

                    {/* Rank Up Button */}
                    <button
                      onClick={() => upgradeSkill(skill.id)}
                      disabled={isMax || !prereqMet}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : !prereqMet
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-fantasy-gold hover:bg-fantasy-goldBright text-fantasy-darkest active:scale-95'
                      }`}
                    >
                      <ArrowUpCircle size={13} />
                      <span>{isMax ? 'MAX' : t('upgrade', lang)}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
