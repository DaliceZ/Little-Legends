import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { getItemDefinition } from '../../features/items/itemRegistry';
import { t } from '../../shared/localization';
import { X, Shield, Swords, Sparkles, Heart, Zap, FastForward } from 'lucide-react';

export const CharacterModal: React.FC = () => {
  const { 
    level, 
    exp, 
    stats, 
    equippedWeapon, 
    equippedArmor, 
    equippedAccessory, 
    unequipItem, 
    specialization, 
    closeModal, 
    settings,
    kaelPortrait,
  } = useGameStore();

  const lang = settings.language;
  const nextExp = Math.floor(100 * Math.pow(level, 1.45));

  const weaponDef = equippedWeapon ? getItemDefinition(equippedWeapon.defId) : null;
  const armorDef = equippedArmor ? getItemDefinition(equippedArmor.defId) : null;
  const accessoryDef = equippedAccessory ? getItemDefinition(equippedAccessory.defId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-fantasy-dark border-2 border-fantasy-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-fantasy-panel px-6 py-4 flex items-center justify-between border-b border-fantasy-border">
          <h2 className="text-lg font-bold text-fantasy-gold flex items-center gap-2">
            <span>🛡️</span> {t('character', lang)}
          </h2>
          <button 
            onClick={closeModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Identity & Equipment Slots */}
          <div className="flex flex-col gap-4">
            {/* Identity Card */}
            <div className="bg-fantasy-panel border border-fantasy-border p-4 rounded-xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-fantasy-darkest border-2 border-fantasy-crystal overflow-hidden flex items-center justify-center shadow-inner">
                {kaelPortrait ? (
                  <img src={kaelPortrait} alt="Drakon" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🐉</span>
                )}
              </div>
              <div>
                <div className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Drakon</span>
                  <span className="text-xs text-amber-400 font-normal">(ดราคอน)</span>
                </div>
                <div className="text-xs text-fantasy-crystal font-medium">
                  {lang === 'th' ? 'อัศวินมังกรผ้าคลุมทมิฬ' : 'The Dragonblade Knight'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Dragonkin • Level {level} • {specialization.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-[11px] text-purple-400 mt-1 font-mono">
                  EXP: {exp} / {nextExp}
                </div>
              </div>
            </div>

            {/* Equipment Slots */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t('equipment', lang)}
              </div>

              {/* Weapon Slot */}
              <div className="bg-fantasy-panel border border-fantasy-border p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-fantasy-darkest border border-slate-700 flex items-center justify-center text-lg">
                    ⚔️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">
                      {weaponDef ? (lang === 'th' ? weaponDef.nameTh : weaponDef.nameEn) : 'No Weapon'}
                      {equippedWeapon && equippedWeapon.enhancementLevel > 0 && ` +${equippedWeapon.enhancementLevel}`}
                    </div>
                    <div className="text-[10px] text-slate-400">{t('weapon', lang)}</div>
                  </div>
                </div>
                {equippedWeapon && (
                  <button 
                    onClick={() => unequipItem('weapon')}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 text-slate-300"
                  >
                    {t('unequip', lang)}
                  </button>
                )}
              </div>

              {/* Armor Slot */}
              <div className="bg-fantasy-panel border border-fantasy-border p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-fantasy-darkest border border-slate-700 flex items-center justify-center text-lg">
                    🛡️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">
                      {armorDef ? (lang === 'th' ? armorDef.nameTh : armorDef.nameEn) : 'No Armor'}
                      {equippedArmor && equippedArmor.enhancementLevel > 0 && ` +${equippedArmor.enhancementLevel}`}
                    </div>
                    <div className="text-[10px] text-slate-400">{t('armor', lang)}</div>
                  </div>
                </div>
                {equippedArmor && (
                  <button 
                    onClick={() => unequipItem('armor')}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 text-slate-300"
                  >
                    {t('unequip', lang)}
                  </button>
                )}
              </div>

              {/* Accessory Slot */}
              <div className="bg-fantasy-panel border border-fantasy-border p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-fantasy-darkest border border-slate-700 flex items-center justify-center text-lg">
                    💎
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-400">
                      {accessoryDef ? (lang === 'th' ? accessoryDef.nameTh : accessoryDef.nameEn) : 'No Accessory'}
                    </div>
                    <div className="text-[10px] text-slate-400">{t('accessory', lang)}</div>
                  </div>
                </div>
                {equippedAccessory && (
                  <button 
                    onClick={() => unequipItem('accessory')}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 text-slate-300"
                  >
                    {t('unequip', lang)}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Character Attributes */}
          <div className="bg-fantasy-panel border border-fantasy-border rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-fantasy-gold uppercase tracking-wider mb-3">
                Combat Attributes
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-fantasy-darkest/60 p-2.5 rounded-lg border border-fantasy-border/60 flex items-center justify-between">
                  <span className="text-red-400 flex items-center gap-1.5"><Heart size={14} /> Max HP</span>
                  <span className="font-mono font-bold text-slate-100">{stats.maxHp}</span>
                </div>
                <div className="bg-fantasy-darkest/60 p-2.5 rounded-lg border border-fantasy-border/60 flex items-center justify-between">
                  <span className="text-blue-400 flex items-center gap-1.5"><Sparkles size={14} /> Max MP</span>
                  <span className="font-mono font-bold text-slate-100">{stats.maxMp}</span>
                </div>
                <div className="bg-fantasy-darkest/60 p-2.5 rounded-lg border border-fantasy-border/60 flex items-center justify-between">
                  <span className="text-emerald-400 flex items-center gap-1.5"><Zap size={14} /> Stamina</span>
                  <span className="font-mono font-bold text-slate-100">{stats.maxSp}</span>
                </div>
                <div className="bg-fantasy-darkest/60 p-2.5 rounded-lg border border-fantasy-border/60 flex items-center justify-between">
                  <span className="text-amber-400 flex items-center gap-1.5"><Swords size={14} /> {t('attack', lang)}</span>
                  <span className="font-mono font-bold text-slate-100">{stats.attack}</span>
                </div>
                <div className="bg-fantasy-darkest/60 p-2.5 rounded-lg border border-fantasy-border/60 flex items-center justify-between">
                  <span className="text-sky-400 flex items-center gap-1.5"><Shield size={14} /> {t('defense', lang)}</span>
                  <span className="font-mono font-bold text-slate-100">{stats.defense}</span>
                </div>
                <div className="bg-fantasy-darkest/60 p-2.5 rounded-lg border border-fantasy-border/60 flex items-center justify-between">
                  <span className="text-yellow-400 flex items-center gap-1.5">⚡ {t('critChance', lang)}</span>
                  <span className="font-mono font-bold text-slate-100">{Math.round(stats.critChance * 100)}%</span>
                </div>
                <div className="bg-fantasy-darkest/60 p-2.5 rounded-lg border border-fantasy-border/60 flex items-center justify-between">
                  <span className="text-purple-400 flex items-center gap-1.5">💥 {t('critDamage', lang)}</span>
                  <span className="font-mono font-bold text-slate-100">{stats.critDamage.toFixed(2)}x</span>
                </div>
                <div className="bg-fantasy-darkest/60 p-2.5 rounded-lg border border-fantasy-border/60 flex items-center justify-between">
                  <span className="text-cyan-400 flex items-center gap-1.5"><FastForward size={14} /> {t('speed', lang)}</span>
                  <span className="font-mono font-bold text-slate-100">{stats.speed}</span>
                </div>
              </div>
            </div>

            {/* Specialization Details */}
            <div className="mt-4 pt-3 border-t border-fantasy-border/80">
              <div className="text-[11px] font-bold text-fantasy-crystal">
                {specialization === 'blade_dancer' ? t('bladeDancer', lang) : specialization === 'guardian' ? t('guardian', lang) : t('echoMage', lang)}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {specialization === 'blade_dancer' ? t('bladeDancerDesc', lang) : specialization === 'guardian' ? t('guardianDesc', lang) : t('echoMageDesc', lang)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
