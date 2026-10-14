import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { CRAFTING_RECIPES } from '../../features/crafting/craftingRegistry';
import { getItemDefinition } from '../../features/items/itemRegistry';
import { t } from '../../shared/localization';
import { X, Hammer, Coins, Gem, ArrowUp } from 'lucide-react';
import { soundManager } from '../../shared/utils/soundSynthesizer';

export const CraftingModal: React.FC = () => {
  const { 
    gold, 
    echoShards, 
    inventory, 
    craftRecipe, 
    closeModal, 
    settings 
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'craft' | 'enhance'>('craft');
  const lang = settings.language;

  // Equipment in inventory available for enhancement
  const enhanceableItems = inventory.filter((item) => {
    const def = getItemDefinition(item.defId);
    return def && (def.type === 'weapon' || def.type === 'armor');
  });

  const handleEnhance = (instanceId: string) => {
    const item = inventory.find((i) => i.instanceId === instanceId);
    if (!item) return;

    const enhanceCostGold = 40 * (item.enhancementLevel + 1);
    const enhanceCostShards = 1;

    if (gold < enhanceCostGold || echoShards < enhanceCostShards) {
      useGameStore.getState().showNotification('INSUFFICIENT RESOURCES', 'Need more gold or Echo Shards.', 'warning');
      return;
    }

    soundManager.playSfx('levelup');
    item.enhancementLevel += 1;

    useGameStore.setState({
      gold: gold - enhanceCostGold,
      echoShards: echoShards - enhanceCostShards,
      inventory: [...inventory],
    });

    useGameStore.getState().showNotification(
      'FORGE SUCCESS',
      `Enhanced to +${item.enhancementLevel}! Stats boosted by 10%.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-fantasy-dark border-2 border-fantasy-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-fantasy-panel px-6 py-4 flex items-center justify-between border-b border-fantasy-border">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚒️</span>
            <div>
              <h2 className="text-base font-bold text-fantasy-gold">{t('crafting', lang)}</h2>
              <div className="text-[11px] text-slate-400">Rowan’s Blazing Anvil</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-bold bg-fantasy-darkest px-3 py-1 rounded-lg border border-fantasy-border">
              <span className="flex items-center gap-1 text-amber-300"><Coins size={14} /> {gold}</span>
              <span className="flex items-center gap-1 text-sky-400"><Gem size={14} /> {echoShards}</span>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 bg-fantasy-darkest border-b border-fantasy-border">
          <button
            onClick={() => setActiveTab('craft')}
            className={`py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'craft'
                ? 'border-fantasy-gold text-fantasy-gold bg-fantasy-panel/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hammer size={14} />
            <span>{t('craft', lang)}</span>
          </button>
          <button
            onClick={() => setActiveTab('enhance')}
            className={`py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'enhance'
                ? 'border-fantasy-gold text-fantasy-gold bg-fantasy-panel/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUp size={14} />
            <span>{t('upgrade', lang)}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-80 overflow-y-auto">
          {activeTab === 'craft' ? (
            <div className="flex flex-col gap-3">
              {CRAFTING_RECIPES.map((recipe) => {
                const resultDef = getItemDefinition(recipe.resultDefId);
                if (!resultDef) return null;

                // Check ingredient availability
                const canCraft = 
                  gold >= recipe.goldCost && 
                  echoShards >= recipe.echoShardCost &&
                  recipe.materials.every((m) => {
                    const owned = inventory
                      .filter((i) => i.defId === m.defId)
                      .reduce((sum, i) => sum + i.quantity, 0);
                    return owned >= m.quantity;
                  });

                return (
                  <div
                    key={recipe.id}
                    className="bg-fantasy-panel border border-fantasy-border rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        <span>{lang === 'th' ? recipe.nameTh : recipe.nameEn}</span>
                        <span className="text-[10px] text-amber-300 font-mono">
                          ({recipe.goldCost}g {recipe.echoShardCost > 0 && `+ ${recipe.echoShardCost} Shards`})
                        </span>
                      </div>

                      {/* Required Ingredients */}
                      <div className="flex flex-wrap gap-2 mt-1.5 text-[11px]">
                        {recipe.materials.map((m, idx) => {
                          const matDef = getItemDefinition(m.defId);
                          const owned = inventory
                            .filter((i) => i.defId === m.defId)
                            .reduce((sum, i) => sum + i.quantity, 0);
                          const hasEnough = owned >= m.quantity;

                          return (
                            <span 
                              key={idx}
                              className={`px-2 py-0.5 rounded border ${
                                hasEnough 
                                  ? 'bg-slate-900 border-slate-700 text-slate-300' 
                                  : 'bg-red-950/40 border-red-800 text-red-400'
                              }`}
                            >
                              {matDef ? (lang === 'th' ? matDef.nameTh : matDef.nameEn) : m.defId} ({owned}/{m.quantity})
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => craftRecipe(recipe.id)}
                      disabled={!canCraft}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                        canCraft
                          ? 'bg-fantasy-gold hover:bg-fantasy-goldBright text-fantasy-darkest'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {t('craft', lang)}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {enhanceableItems.length > 0 ? (
                enhanceableItems.map((item) => {
                  const def = getItemDefinition(item.defId);
                  if (!def) return null;
                  const costGold = 40 * (item.enhancementLevel + 1);
                  const canEnhance = gold >= costGold && echoShards >= 1;

                  return (
                    <div
                      key={item.instanceId}
                      className="bg-fantasy-panel border border-fantasy-border rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                          <span>{lang === 'th' ? def.nameTh : def.nameEn}</span>
                          <span className="text-amber-300 font-mono font-bold">
                            +{item.enhancementLevel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Cost: {costGold} Gold, 1 Echo Shard • Boosts Base Stats by +10%
                        </div>
                      </div>

                      <button
                        onClick={() => handleEnhance(item.instanceId)}
                        disabled={!canEnhance}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                          canEnhance
                            ? 'bg-fantasy-crystal hover:bg-sky-400 text-fantasy-darkest'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {t('upgrade', lang)} (+{item.enhancementLevel + 1})
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-slate-400 py-12 italic">
                  No weapons or armors in inventory to enhance.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
