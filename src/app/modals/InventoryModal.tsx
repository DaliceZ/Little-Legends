import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getItemDefinition } from '../../features/items/itemRegistry';
import { ItemInstance } from '../../shared/types';
import { t } from '../../shared/localization';
import { X, Shield, Swords, Heart } from 'lucide-react';

export const InventoryModal: React.FC = () => {
  const { 
    inventory, 
    closeModal, 
    equipItem, 
    useConsumable, 
    removeItemFromInventory,
    settings 
  } = useGameStore();

  const [selectedItem, setSelectedItem] = useState<ItemInstance | null>(
    inventory.length > 0 ? inventory[0] : null
  );

  const lang = settings.language;
  const maxSlots = 24;
  const slots: (ItemInstance | null)[] = Array.from({ length: maxSlots }, (_, i) => inventory[i] || null);

  const selectedDef = selectedItem ? getItemDefinition(selectedItem.defId) : null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'uncommon': return 'border-emerald-500/70 text-emerald-400 bg-emerald-950/20';
      case 'rare': return 'border-sky-500/70 text-sky-400 bg-sky-950/20';
      case 'epic': return 'border-purple-500/70 text-purple-400 bg-purple-950/20';
      case 'legendary': return 'border-amber-400/80 text-amber-300 bg-amber-950/20';
      default: return 'border-slate-700 text-slate-300 bg-slate-900/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-fantasy-dark border-2 border-fantasy-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-fantasy-panel px-6 py-4 flex items-center justify-between border-b border-fantasy-border">
          <h2 className="text-lg font-bold text-fantasy-gold flex items-center gap-2">
            <span>🎒</span> {t('inventory', lang)}
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
          {/* Left: Inventory Grid */}
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex justify-between">
              <span>{inventory.length} / {maxSlots} Slots</span>
            </div>
            <div className="grid grid-cols-6 gap-2 bg-fantasy-darkest/60 p-3 rounded-xl border border-fantasy-border/60">
              {slots.map((item, idx) => {
                const def = item ? getItemDefinition(item.defId) : null;
                const isSelected = selectedItem && item && selectedItem.instanceId === item.instanceId;
                return (
                  <div
                    key={idx}
                    onClick={() => item && setSelectedItem(item)}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all relative ${
                      item 
                        ? getRarityColor(item.rarity)
                        : 'border-slate-800/60 bg-slate-900/20'
                    } ${isSelected ? 'ring-2 ring-fantasy-crystal scale-105' : 'hover:border-slate-500'}`}
                  >
                    {def && (
                      <>
                        <span className="text-lg">
                          {def.type === 'weapon' ? '⚔️' : def.type === 'armor' ? '🛡️' : def.type === 'accessory' ? '💎' : '🧪'}
                        </span>
                        {item && item.quantity > 1 && (
                          <span className="absolute bottom-1 right-1.5 text-[10px] font-bold font-mono bg-black/80 px-1 rounded text-slate-200">
                            {item.quantity}
                          </span>
                        )}
                        {item && item.enhancementLevel > 0 && (
                          <span className="absolute top-1 left-1.5 text-[10px] font-bold text-amber-300">
                            +{item.enhancementLevel}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Item Details Panel */}
          <div className="bg-fantasy-panel border border-fantasy-border/80 rounded-xl p-4 flex flex-col justify-between">
            {selectedItem && selectedDef ? (
              <div className="flex flex-col gap-3">
                <div>
                  <div className={`text-sm font-bold ${getRarityColor(selectedItem.rarity).split(' ')[1]}`}>
                    {lang === 'th' ? selectedDef.nameTh : selectedDef.nameEn}
                    {selectedItem.enhancementLevel > 0 && ` +${selectedItem.enhancementLevel}`}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 capitalize">
                    {selectedDef.rarity} {selectedDef.type}
                  </div>
                </div>

                <div className="text-xs text-slate-300 italic border-l-2 border-fantasy-gold/50 pl-2">
                  {lang === 'th' ? selectedDef.descriptionTh : selectedDef.descriptionEn}
                </div>

                {/* Base Stats */}
                {selectedDef.baseStats && (
                  <div className="bg-fantasy-darkest/70 p-2.5 rounded-lg border border-fantasy-border/50 text-xs flex flex-col gap-1">
                    {selectedDef.baseStats.attack && (
                      <div className="flex justify-between text-amber-300">
                        <span className="flex items-center gap-1"><Swords size={12} /> {t('attack', lang)}</span>
                        <span>+{selectedDef.baseStats.attack}</span>
                      </div>
                    )}
                    {selectedDef.baseStats.defense && (
                      <div className="flex justify-between text-blue-300">
                        <span className="flex items-center gap-1"><Shield size={12} /> {t('defense', lang)}</span>
                        <span>+{selectedDef.baseStats.defense}</span>
                      </div>
                    )}
                    {selectedDef.baseStats.maxHp && (
                      <div className="flex justify-between text-red-300">
                        <span className="flex items-center gap-1"><Heart size={12} /> Max HP</span>
                        <span>+{selectedDef.baseStats.maxHp}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Buttons */}
                <div className="flex flex-col gap-2 mt-2">
                  {(selectedDef.type === 'weapon' || selectedDef.type === 'armor' || selectedDef.type === 'accessory') && (
                    <button
                      onClick={() => {
                        equipItem(selectedItem.instanceId);
                        setSelectedItem(null);
                      }}
                      className="w-full bg-fantasy-gold hover:bg-fantasy-goldBright text-fantasy-darkest font-bold py-2 rounded-lg text-xs transition-colors shadow-md"
                    >
                      {t('equip', lang)}
                    </button>
                  )}
                  {selectedDef.type === 'consumable' && (
                    <button
                      onClick={() => {
                        useConsumable(selectedItem.instanceId);
                        setSelectedItem(null);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-md"
                    >
                      {t('use', lang)}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      removeItemFromInventory(selectedItem.instanceId, 1);
                      setSelectedItem(null);
                    }}
                    className="w-full bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-200 font-semibold py-1.5 rounded-lg text-xs transition-colors"
                  >
                    {t('drop', lang)}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 py-12 italic">
                Select an item to view stats
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
