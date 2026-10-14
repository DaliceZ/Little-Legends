import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { NPC_REGISTRY, DIALOGUE_NODES } from '../../features/dialogue/dialogueRegistry';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { X } from 'lucide-react';

export const DialogueBox: React.FC = () => {
  const { 
    currentDialogue, 
    setDialogue, 
    closeDialogue, 
    openModal, 
    acceptQuest,
    setPlayerStats,
    stats,
    settings 
  } = useGameStore();

  if (!currentDialogue) return null;

  const npc = NPC_REGISTRY[currentDialogue.npcId];
  const node = DIALOGUE_NODES[currentDialogue.nodeId];
  if (!npc || !node) return null;

  const lang = settings.language;

  const handleChoiceClick = (choice: typeof node.choices[0]) => {
    soundManager.playSfx('click');

    // Handle Actions
    if (choice.action === 'open_shop') {
      closeDialogue();
      openModal('shop');
      return;
    }
    if (choice.action === 'open_craft') {
      closeDialogue();
      openModal('crafting');
      return;
    }
    if (choice.action === 'accept_quest' && choice.actionPayload) {
      acceptQuest(choice.actionPayload);
      closeDialogue();
      return;
    }
    if (choice.action === 'claim_reward' && choice.actionPayload === 'heal_player') {
      setPlayerStats({
        ...stats,
        hp: stats.maxHp,
        mp: stats.maxMp,
        sp: stats.maxSp,
      });
      soundManager.playSfx('potion');
    }
    if (choice.action === 'close') {
      closeDialogue();
      return;
    }

    if (choice.nextNodeId) {
      setDialogue({
        npcId: currentDialogue.npcId,
        nodeId: choice.nextNodeId,
      });
    } else {
      closeDialogue();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pb-8 px-4 bg-black/40 pointer-events-auto">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-gold/60 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl p-6 backdrop-blur-md flex flex-col md:flex-row gap-5 items-start">
        {/* NPC Portrait */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div className="w-20 h-20 rounded-xl bg-fantasy-darkest border-2 border-fantasy-gold flex items-center justify-center text-4xl shadow-inner">
            {npc.role === 'healer' ? '🌿' : npc.role === 'blacksmith' ? '⚒️' : npc.role === 'guild' ? '⚔️' : npc.role === 'merchant' ? '💰' : '📜'}
          </div>
          <div className="text-center mt-2">
            <div className="text-xs font-bold text-slate-100">
              {lang === 'th' ? npc.nameTh : npc.nameEn}
            </div>
            <div className="text-[10px] text-fantasy-crystal">
              {lang === 'th' ? npc.titleTh : npc.titleEn}
            </div>
          </div>
        </div>

        {/* Dialogue Text and Choices */}
        <div className="flex-1 flex flex-col justify-between gap-4 w-full">
          {/* NPC Speech */}
          <div className="text-sm text-slate-100 leading-relaxed font-medium bg-fantasy-panel/60 p-4 rounded-xl border border-fantasy-border/60">
            {lang === 'th' ? node.textTh : node.textEn}
          </div>

          {/* Choices */}
          <div className="flex flex-col gap-2">
            {node.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoiceClick(choice)}
                className="text-left text-xs bg-fantasy-panel hover:bg-slate-800 border border-fantasy-border hover:border-fantasy-crystal/70 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl transition-all shadow flex items-center justify-between group"
              >
                <span>{lang === 'th' ? choice.textTh : choice.textEn}</span>
                <span className="text-fantasy-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  ➔
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={closeDialogue}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors self-start"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
