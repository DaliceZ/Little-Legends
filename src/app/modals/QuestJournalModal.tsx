import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getQuestDefinition } from '../../features/quests/questRegistry';
import { getItemDefinition } from '../../features/items/itemRegistry';
import { t } from '../../shared/localization';
import { X, CheckCircle2, Circle, Coins, Gem, Gift } from 'lucide-react';

export const QuestJournalModal: React.FC = () => {
  const { 
    quests, 
    claimQuestReward, 
    closeModal, 
    settings 
  } = useGameStore();

  const lang = settings.language;
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(
    quests.length > 0 ? quests[0].questId : null
  );

  const selectedState = quests.find((q) => q.questId === selectedQuestId);
  const selectedDef = selectedQuestId ? getQuestDefinition(selectedQuestId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-fantasy-dark border-2 border-fantasy-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-fantasy-panel px-6 py-4 flex items-center justify-between border-b border-fantasy-border">
          <h2 className="text-lg font-bold text-fantasy-gold flex items-center gap-2">
            <span>📜</span> {t('quests', lang)}
          </h2>
          <button 
            onClick={closeModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Quests List */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {quests.length} Quests Recorded
            </div>
            <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
              {quests.map((q) => {
                const def = getQuestDefinition(q.questId);
                if (!def) return null;
                const isSelected = selectedQuestId === q.questId;

                return (
                  <button
                    key={q.questId}
                    onClick={() => setSelectedQuestId(q.questId)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-fantasy-panel border-fantasy-gold/70 text-slate-100 shadow-md'
                        : 'bg-fantasy-darkest/60 border-fantasy-border/60 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold line-clamp-1">
                        {lang === 'th' ? def.titleTh : def.titleEn}
                      </span>
                      {q.status === 'reward_claimed' ? (
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      ) : q.status === 'completed' ? (
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold shrink-0">
                          Ready!
                        </span>
                      ) : (
                        <Circle size={14} className="text-slate-500 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Quest Details Panel */}
          <div className="md:col-span-2 bg-fantasy-panel border border-fantasy-border rounded-xl p-5 flex flex-col justify-between">
            {selectedDef && selectedState ? (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-bold text-fantasy-gold">
                    {lang === 'th' ? selectedDef.titleTh : selectedDef.titleEn}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Recommended Level {selectedDef.minLevel}
                  </div>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed italic bg-fantasy-darkest/60 p-3 rounded-lg border border-fantasy-border/50">
                  {lang === 'th' ? selectedDef.descriptionTh : selectedDef.descriptionEn}
                </div>

                {/* Objectives */}
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Objectives
                  </div>
                  <div className="flex flex-col gap-2">
                    {selectedDef.objectives.map((obj) => {
                      const objState = selectedState.objectives.find((o) => o.id === obj.id);
                      const current = objState ? objState.currentCount : 0;
                      const isComplete = current >= obj.targetCount;

                      return (
                        <div 
                          key={obj.id}
                          className="flex items-center justify-between text-xs bg-fantasy-darkest/40 px-3 py-2 rounded-lg border border-fantasy-border/30"
                        >
                          <span className={isComplete ? 'line-through text-emerald-400' : 'text-slate-200'}>
                            {lang === 'th' ? obj.descriptionTh.split('(')[0] : obj.descriptionEn.split('(')[0]}
                          </span>
                          <span className="font-mono font-bold text-xs">
                            {current} / {obj.targetCount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rewards Preview */}
                <div>
                  <div className="text-xs font-bold text-fantasy-gold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Gift size={14} /> Rewards
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs bg-fantasy-darkest/70 p-3 rounded-xl border border-fantasy-border/60">
                    <span className="text-purple-400 font-bold">+{selectedDef.rewards.exp} EXP</span>
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <Coins size={14} /> +{selectedDef.rewards.gold} Gold
                    </span>
                    {selectedDef.rewards.echoShards > 0 && (
                      <span className="text-sky-400 font-bold flex items-center gap-1">
                        <Gem size={14} /> +{selectedDef.rewards.echoShards} Shards
                      </span>
                    )}
                    {selectedDef.rewards.items && selectedDef.rewards.items.map((item, idx) => {
                      const itemDef = getItemDefinition(item.defId);
                      return (
                        <span key={idx} className="text-emerald-300 font-medium">
                          +{item.quantity} {itemDef ? (lang === 'th' ? itemDef.nameTh : itemDef.nameEn) : item.defId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Claim Button */}
                {selectedState.status === 'completed' && (
                  <button
                    onClick={() => claimQuestReward(selectedDef.id)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-fantasy-darkest font-extrabold py-2.5 rounded-xl text-xs transition-colors shadow-lg"
                  >
                    {t('claimReward', lang)}
                  </button>
                )}
                {selectedState.status === 'reward_claimed' && (
                  <div className="text-center text-xs font-bold text-emerald-400 py-1">
                    ✓ {t('completed', lang)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 py-12 italic">
                No quest selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
