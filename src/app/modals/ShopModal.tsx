import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getItemDefinition } from '../../features/items/itemRegistry';
import { t } from '../../shared/localization';
import { X, Coins, ShoppingBag } from 'lucide-react';

export const ShopModal: React.FC = () => {
  const { 
    gold, 
    inventory, 
    buyItem, 
    sellItem, 
    closeModal, 
    settings 
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const lang = settings.language;

  // Merchant catalog
  const shopCatalog = [
    'item_health_potion',
    'item_mana_potion',
    'item_steel_blade',
    'item_guardian_cuirass',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-fantasy-dark border-2 border-fantasy-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-fantasy-panel px-6 py-4 flex items-center justify-between border-b border-fantasy-border">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏪</span>
            <div>
              <h2 className="text-base font-bold text-fantasy-gold">{t('shop', lang)}</h2>
              <div className="text-[11px] text-slate-400">Finn’s Goods & Curiosities</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-fantasy-darkest px-3 py-1 rounded-lg border border-fantasy-border">
              <Coins size={14} />
              <span>{gold} Gold</span>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="grid grid-cols-2 bg-fantasy-darkest border-b border-fantasy-border">
          <button
            onClick={() => setActiveTab('buy')}
            className={`py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'buy'
                ? 'border-fantasy-gold text-fantasy-gold bg-fantasy-panel/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag size={14} />
            <span>{t('buy', lang)}</span>
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'sell'
                ? 'border-fantasy-gold text-fantasy-gold bg-fantasy-panel/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins size={14} />
            <span>{t('sell', lang)}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-80 overflow-y-auto">
          {activeTab === 'buy' ? (
            <div className="flex flex-col gap-2.5">
              {shopCatalog.map((defId) => {
                const def = getItemDefinition(defId);
                if (!def) return null;
                const canAfford = gold >= def.buyPrice;

                return (
                  <div
                    key={def.id}
                    className="bg-fantasy-panel border border-fantasy-border rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-fantasy-darkest border border-slate-700 flex items-center justify-center text-lg">
                        {def.type === 'weapon' ? '⚔️' : def.type === 'armor' ? '🛡️' : '🧪'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100">
                          {lang === 'th' ? def.nameTh : def.nameEn}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {lang === 'th' ? def.descriptionTh : def.descriptionEn}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {def.buyPrice}g
                      </span>
                      <button
                        onClick={() => buyItem(def.id)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
                          canAfford
                            ? 'bg-fantasy-gold hover:bg-fantasy-goldBright text-fantasy-darkest'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {t('buy', lang)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {inventory.length > 0 ? (
                inventory.map((item) => {
                  const def = getItemDefinition(item.defId);
                  if (!def) return null;
                  const sellValue = def.sellPrice * item.quantity;

                  return (
                    <div
                      key={item.instanceId}
                      className="bg-fantasy-panel border border-fantasy-border rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-fantasy-darkest border border-slate-700 flex items-center justify-center text-lg">
                          {def.type === 'weapon' ? '⚔️' : def.type === 'armor' ? '🛡️' : '📦'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100">
                            {lang === 'th' ? def.nameTh : def.nameEn}
                            {item.quantity > 1 && ` (x${item.quantity})`}
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {def.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-300 font-mono">
                          +{sellValue}g
                        </span>
                        <button
                          onClick={() => sellItem(item.instanceId)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-fantasy-darkest transition-all shadow"
                        >
                          {t('sell', lang)}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-slate-400 py-12 italic">
                  {t('emptyInventory', lang)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
