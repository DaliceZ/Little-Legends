import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { PetEggInstance, PetInstance } from '../../shared/types';
import { EGG_RARITY_METADATA } from '../../features/pets/eggDropManager';
import { getPetSpecies, calculatePetStats } from '../../features/pets/petRegistry';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { X, Sparkles, Egg, Heart, Swords, Shield, Zap, Check } from 'lucide-react';

export const HatcheryModal: React.FC = () => {
  const { petEggs, hatchEggAtSlot, closeModal, setActivePet, settings } = useGameStore();
  const lang = settings.language;

  const [selectedEgg, setSelectedEgg] = useState<PetEggInstance | null>(
    petEggs.length > 0 ? petEggs[0] : null
  );
  const [crackCount, setCrackCount] = useState<number>(0);
  const [hatchedPet, setHatchedPet] = useState<PetInstance | null>(null);
  const [isCracking, setIsCracking] = useState<boolean>(false);

  const handleEggClick = () => {
    if (!selectedEgg || hatchedPet || isCracking) return;

    const nextCount = crackCount + 1;
    setCrackCount(nextCount);
    setIsCracking(true);
    soundManager.playSfx('click');

    setTimeout(() => {
      setIsCracking(false);
    }, 200);

    if (nextCount >= 3) {
      // Hatch the egg!
      const newPet = hatchEggAtSlot(selectedEgg.id);
      if (newPet) {
        setHatchedPet(newPet);
        soundManager.playSfx('victory');
      }
    }
  };

  const handleResetForAnotherEgg = () => {
    setHatchedPet(null);
    setCrackCount(0);
    const remaining = useGameStore.getState().petEggs;
    setSelectedEgg(remaining.length > 0 ? remaining[0] : null);
  };

  const eggMeta = selectedEgg ? EGG_RARITY_METADATA[selectedEgg.rarity] : null;
  const hatchedSpecies = hatchedPet ? getPetSpecies(hatchedPet.speciesId) : null;
  const hatchedStats = hatchedPet ? calculatePetStats(hatchedPet) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-fantasy-dark border-2 border-fantasy-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-fantasy-panel/90 border-b border-fantasy-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Egg size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'th' ? 'โรงเพาะไข่สัตว์เลี้ยงโบราณ' : 'Village Ancient Hatchery'}</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full font-mono">
                  {petEggs.length} {lang === 'th' ? 'ฟอง' : 'Eggs'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'th' ? 'วางไข่บนแท่นและแตะเพื่อฟักสัตว์เลี้ยงคู่หู' : 'Place an egg in the cradle and tap to hatch your companion.'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col md:flex-row gap-6 items-center justify-center">
          {/* Main Incubator Pedestal */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {hatchedPet && hatchedSpecies && hatchedStats ? (
              // Hatched Reveal Card
              <div className="flex flex-col items-center animate-scaleUp w-full max-w-sm bg-fantasy-panel/80 border-2 border-amber-400/80 rounded-2xl p-5 shadow-2xl">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 animate-pulse">
                  <Sparkles size={14} />
                  <span>{lang === 'th' ? 'ฟักไข่สำเร็จ!' : 'HATCH SUCCESSFUL!'}</span>
                </div>

                <div 
                  className="w-24 h-24 rounded-2xl my-3 flex items-center justify-center text-4xl shadow-2xl relative overflow-hidden border-2"
                  style={{
                    backgroundColor: `${hatchedSpecies.accentColor}20`,
                    borderColor: hatchedSpecies.accentColor,
                  }}
                >
                  <img
                    src={`/assets/pets/${hatchedSpecies.id}.png`}
                    alt={hatchedSpecies.nameEn}
                    onError={(e) => {
                      // Fallback visual icon if texture sheet hasn't been saved to disk
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-16 h-16 object-contain pixelated"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">
                    {hatchedSpecies.id === 'forest_slime' ? '🟢' : 
                     hatchedSpecies.id === 'ember_fox' ? '🦊' : 
                     hatchedSpecies.id === 'frost_bunny' ? '🐰' : 
                     hatchedSpecies.id === 'thunder_cub' ? '🐯' : 
                     hatchedSpecies.id === 'shadow_cat' ? '🐱' : 
                     hatchedSpecies.id === 'crystal_sprite' ? '🧚' : 
                     hatchedSpecies.id === 'moss_turtle' ? '🐢' : '🐲'}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-100">
                  {lang === 'th' ? hatchedSpecies.nameTh : hatchedSpecies.nameEn}
                </h3>
                <span 
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border mt-1"
                  style={{
                    backgroundColor: `${hatchedSpecies.accentColor}30`,
                    borderColor: hatchedSpecies.accentColor,
                    color: hatchedSpecies.accentColor,
                  }}
                >
                  {hatchedSpecies.rarity} • {hatchedSpecies.element}
                </span>

                <p className="text-xs text-slate-300 mt-2 text-center leading-relaxed">
                  {lang === 'th' ? hatchedSpecies.descriptionTh : hatchedSpecies.descriptionEn}
                </p>

                {/* Base Stats */}
                <div className="grid grid-cols-3 gap-2 w-full mt-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  <div className="flex flex-col items-center">
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <Heart size={11} /> HP
                    </span>
                    <span className="text-slate-200 font-mono">{hatchedStats.hp}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Swords size={11} /> ATK
                    </span>
                    <span className="text-slate-200 font-mono">{hatchedStats.atk}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sky-400 font-bold flex items-center gap-1">
                      <Shield size={11} /> DEF
                    </span>
                    <span className="text-slate-200 font-mono">{hatchedStats.def}</span>
                  </div>
                </div>

                {/* Ability Banner */}
                <div className="w-full mt-2 bg-fantasy-dark/90 p-2 rounded-xl border border-fantasy-border/60 text-left">
                  <div className="text-[10px] font-bold text-fantasy-gold flex items-center gap-1">
                    <Zap size={11} />
                    <span>{lang === 'th' ? hatchedSpecies.abilityNameTh : hatchedSpecies.abilityNameEn}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {lang === 'th' ? hatchedSpecies.abilityDescTh : hatchedSpecies.abilityDescEn}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full mt-4">
                  <button
                    onClick={() => {
                      setActivePet(hatchedPet.id);
                      closeModal();
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1"
                  >
                    <Check size={14} />
                    <span>{lang === 'th' ? 'เลือกเป็นคู่หูทันที' : 'Set as Companion'}</span>
                  </button>
                  <button
                    onClick={handleResetForAnotherEgg}
                    className="px-3 bg-fantasy-panel hover:bg-slate-800 border border-fantasy-border text-slate-300 hover:text-white text-xs font-bold py-2 rounded-xl transition-all"
                  >
                    {lang === 'th' ? 'ฟักไข่เพิ่ม' : 'Hatch More'}
                  </button>
                </div>
              </div>
            ) : selectedEgg && eggMeta ? (
              // Egg Incubation Cradle
              <div className="flex flex-col items-center">
                <div 
                  onClick={handleEggClick}
                  className={`w-36 h-48 rounded-full border-4 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden select-none active:scale-95 ${
                    isCracking ? 'scale-105 rotate-3' : 'hover:scale-105'
                  }`}
                  style={{
                    boxShadow: `0 0 35px ${eggMeta.glowColor}`,
                    backgroundColor: '#111827',
                    borderColor: eggMeta.color,
                  }}
                >
                  {/* Egg Shell Pixel Pattern */}
                  <div className="text-6xl animate-bounce">
                    🥚
                  </div>

                  {/* Cracks Overlay */}
                  {crackCount >= 1 && (
                    <div className="absolute inset-0 border-r-2 border-white/60 rotate-45 transform pointer-events-none" />
                  )}
                  {crackCount >= 2 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-amber-300/40 animate-pulse pointer-events-none" />
                  )}

                  <span className="absolute bottom-3 text-[10px] font-bold uppercase tracking-wider text-white drop-shadow bg-black/60 px-2 py-0.5 rounded-full">
                    {lang === 'th' ? `แตะเพื่อฟัก (${crackCount}/3)` : `Tap to crack (${crackCount}/3)`}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-100">
                    {lang === 'th' ? eggMeta.nameTh : eggMeta.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {lang === 'th' ? eggMeta.descriptionTh : eggMeta.descriptionEn}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Egg size={48} className="mx-auto mb-2 opacity-30 text-slate-500" />
                <p className="text-sm font-bold">{lang === 'th' ? 'ไม่มีไข่ในกระเป๋า' : 'No pet eggs in inventory'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'th' ? 'ออกล่ามอนสเตอร์ในป่า หรือสำรวจดันเจี้ยนเพื่อหาไข่สัตว์เลี้ยง!' : 'Defeat monsters in the forest or clear dungeon chests to discover rare eggs!'}
                </p>
              </div>
            )}
          </div>

          {/* Right: Egg Collection List */}
          <div className="w-full md:w-64 bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'th' ? 'ไข่ทั้งหมดที่มี' : 'Egg Inventory'} ({petEggs.length})
            </span>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {petEggs.map((egg) => {
                const meta = EGG_RARITY_METADATA[egg.rarity];
                const isSelected = selectedEgg?.id === egg.id;
                return (
                  <button
                    key={egg.id}
                    onClick={() => {
                      if (!hatchedPet) {
                        setSelectedEgg(egg);
                        setCrackCount(0);
                      }
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/30 shadow'
                        : 'border-slate-800 hover:border-slate-700 bg-fantasy-panel/40'
                    }`}
                  >
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg border"
                      style={{
                        backgroundColor: `${meta.color}20`,
                        borderColor: meta.color,
                      }}
                    >
                      🥚
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {lang === 'th' ? meta.nameTh : meta.nameEn}
                      </div>
                      <span 
                        className="text-[9px] uppercase font-bold"
                        style={{ color: meta.color }}
                      >
                        {egg.rarity}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
