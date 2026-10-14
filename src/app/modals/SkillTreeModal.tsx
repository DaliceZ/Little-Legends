import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SKILL_REGISTRY } from '../../features/skills/skillRegistry';
import { Specialization } from '../../shared/types';
import { t } from '../../shared/localization';
import { X, Sparkles, Shield, Wind, ArrowUpCircle } from 'lucide-react';

export const SkillTreeModal: React.FC = () => {
  const { 
    specialization, 
    skills, 
    upgradeSkill, 
    closeModal, 
    settings 
  } = useGameStore();

  const [selectedTree, setSelectedTree] = useState<Specialization>(specialization);
  const lang = settings.language;

  const currentTreeSkills = Object.values(SKILL_REGISTRY).filter((s) => s.tree === selectedTree);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-fantasy-dark border-2 border-fantasy-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-fantasy-panel px-6 py-4 flex items-center justify-between border-b border-fantasy-border">
          <h2 className="text-lg font-bold text-fantasy-gold flex items-center gap-2">
            <span>✨</span> {t('skills', lang)}
          </h2>
          <button 
            onClick={closeModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tree Selector Tabs */}
        <div className="grid grid-cols-3 bg-fantasy-darkest border-b border-fantasy-border">
          <button
            onClick={() => setSelectedTree('blade_dancer')}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              selectedTree === 'blade_dancer'
                ? 'border-fantasy-gold text-fantasy-gold bg-fantasy-panel/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind size={16} />
            <span>{t('bladeDancer', lang).split('(')[0]}</span>
          </button>
          <button
            onClick={() => setSelectedTree('guardian')}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              selectedTree === 'guardian'
                ? 'border-fantasy-gold text-fantasy-gold bg-fantasy-panel/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={16} />
            <span>{t('guardian', lang).split('(')[0]}</span>
          </button>
          <button
            onClick={() => setSelectedTree('echo_mage')}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              selectedTree === 'echo_mage'
                ? 'border-fantasy-gold text-fantasy-gold bg-fantasy-panel/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={16} />
            <span>{t('echoMage', lang).split('(')[0]}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="text-xs text-slate-300 italic bg-fantasy-darkest/50 p-3 rounded-lg border border-fantasy-border/40">
            {selectedTree === 'blade_dancer' && t('bladeDancerDesc', lang)}
            {selectedTree === 'guardian' && t('guardianDesc', lang)}
            {selectedTree === 'echo_mage' && t('echoMageDesc', lang)}
          </div>

          {/* Skill Nodes List */}
          <div className="flex flex-col gap-3">
            {currentTreeSkills.map((skill) => {
              const userSkill = skills.find((s) => s.id === skill.id);
              const rank = userSkill ? userSkill.currentRank : 0;
              const isMax = rank >= skill.maxRank;

              return (
                <div 
                  key={skill.id}
                  className="bg-fantasy-panel border border-fantasy-border rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-fantasy-darkest border-2 border-fantasy-crystal/70 flex items-center justify-center text-xl shadow-inner">
                      {skill.tree === 'blade_dancer' ? '🌀' : skill.tree === 'guardian' ? '🛡️' : '🔮'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">
                          {lang === 'th' ? skill.nameTh : skill.nameEn}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-fantasy-gold px-2 py-0.5 rounded font-mono font-bold">
                          Rank {rank}/{skill.maxRank}
                        </span>
                        <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded">
                          {skill.isActive ? 'Active' : 'Passive'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        {lang === 'th' ? skill.descriptionTh : skill.descriptionEn}
                      </div>
                      {skill.costSp > 0 && (
                        <div className="text-[11px] text-emerald-400 mt-0.5">
                          Cost: {skill.costSp} Stamina • Cooldown: {(skill.cooldownMs / 1000).toFixed(1)}s
                        </div>
                      )}
                      {skill.costMp > 0 && (
                        <div className="text-[11px] text-blue-400 mt-0.5">
                          Cost: {skill.costMp} Mana • Cooldown: {(skill.cooldownMs / 1000).toFixed(1)}s
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  <div>
                    <button
                      onClick={() => upgradeSkill(skill.id)}
                      disabled={isMax}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-fantasy-gold hover:bg-fantasy-goldBright text-fantasy-darkest'
                      }`}
                    >
                      <ArrowUpCircle size={14} />
                      <span>{isMax ? 'MAX' : t('upgrade', lang)}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activate Specialization Button */}
          {selectedTree !== specialization && (
            <div className="mt-2 pt-3 border-t border-fantasy-border flex justify-end">
              <button
                onClick={() => {
                  useGameStore.setState({ specialization: selectedTree });
                  useGameStore.getState().showNotification(
                    'SPECIALIZATION SWITCHED',
                    `Active combat style changed to ${selectedTree.replace('_', ' ').toUpperCase()}!`,
                    'success'
                  );
                }}
                className="bg-fantasy-crystal hover:bg-sky-400 text-fantasy-darkest font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition-colors"
              >
                Switch to this Specialization
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
