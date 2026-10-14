import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getPetSpecies, calculatePetStats } from '../../features/pets/petRegistry';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { 
  X, 
  Heart, 
  Swords, 
  Shield, 
  Zap, 
  Check, 
  Sparkles, 
  Egg, 
  Edit2, 
  CheckCheck,
  ArrowUpCircle
} from 'lucide-react';

export const PetModal: React.FC = () => {
  const { 
    pets, 
    activePetId, 
    setActivePet, 
    feedPet, 
    renamePet, 
    closeModal, 
    openModal, 
    gold, 
    updateExpAndGold, 
    settings 
  } = useGameStore();

  const lang = settings.language;
  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    activePetId || (pets.length > 0 ? pets[0].id : null)
  );
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editNameInput, setEditNameInput] = useState<string>('');

  const selectedPet = pets.find((p) => p.id === selectedPetId) || (pets.length > 0 ? pets[0] : null);
  const species = selectedPet ? getPetSpecies(selectedPet.speciesId) : null;
  const stats = selectedPet ? calculatePetStats(selectedPet) : null;
  const isActive = selectedPet ? selectedPet.id === activePetId : false;

  const handleStartRename = () => {
    if (!selectedPet) return;
    setEditNameInput(selectedPet.nickname);
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (!selectedPet || !editNameInput.trim()) return;
    renamePet(selectedPet.id, editNameInput.trim());
    setIsEditingName(false);
    soundManager.playSfx('click');
  };

  const handleFeedPet = () => {
    if (!selectedPet) return;
    if (gold < 25) {
      useGameStore.getState().showNotification('LOW GOLD', 'Need 25 Gold to feed pet treats!', 'warning');
      return;
    }

    updateExpAndGold(0, -25);
    feedPet(selectedPet.id, 60);
    soundManager.playSfx('pickup');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-fantasy-dark border-2 border-fantasy-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-fantasy-panel/90 border-b border-fantasy-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'th' ? 'สัตว์เลี้ยงคู่หูร่วมรบ' : 'Pet Companions'}</span>
                <span className="text-[10px] bg-fantasy-panel text-fantasy-crystal border border-fantasy-border px-2 py-0.5 rounded-full font-mono">
                  {pets.length} Unlocked
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'th' ? 'จัดการและอัปเกรดสัตว์เลี้ยงคู่หูเพื่อช่วยต่อสู้และฟื้นฟู' : 'Manage, level up, and summon companions for combat and support.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('hatchery')}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Egg size={14} />
              <span>{lang === 'th' ? 'โรงเพาะไข่' : 'Hatchery'}</span>
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col md:flex-row gap-6">
          {/* Left: Pet Roster */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'th' ? 'สัตว์เลี้ยงของคุณ' : 'Your Companions'}
            </span>

            {pets.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                <span className="text-3xl">🥚</span>
                <p className="text-xs text-slate-400 font-bold mt-2">
                  {lang === 'th' ? 'ยังไม่มีสัตว์เลี้ยง' : 'No companions yet'}
                </p>
                <button
                  onClick={() => openModal('hatchery')}
                  className="mt-3 bg-amber-500 text-fantasy-darkest text-xs font-bold px-3 py-1.5 rounded-lg shadow"
                >
                  {lang === 'th' ? 'ไปฟักไข่' : 'Visit Hatchery'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {pets.map((pet) => {
                  const sp = getPetSpecies(pet.speciesId);
                  const isCurActive = pet.id === activePetId;
                  const isCurSelected = pet.id === selectedPet?.id;

                  return (
                    <button
                      key={pet.id}
                      onClick={() => {
                        setSelectedPetId(pet.id);
                        setIsEditingName(false);
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        isCurSelected
                          ? 'border-fantasy-crystal bg-fantasy-panel/90 shadow-md'
                          : 'border-slate-800 hover:border-slate-700 bg-fantasy-panel/30'
                      }`}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border relative shadow-inner"
                        style={{
                          backgroundColor: `${sp.accentColor}20`,
                          borderColor: sp.accentColor,
                        }}
                      >
                        {pet.speciesId === 'forest_slime' ? '🟢' : 
                         pet.speciesId === 'ember_fox' ? '🦊' : 
                         pet.speciesId === 'frost_bunny' ? '🐰' : 
                         pet.speciesId === 'thunder_cub' ? '🐯' : 
                         pet.speciesId === 'shadow_cat' ? '🐱' : 
                         pet.speciesId === 'crystal_sprite' ? '🧚' : 
                         pet.speciesId === 'moss_turtle' ? '🐢' : '🐲'}
                        {isCurActive && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                        )}
                      </div>

                      <div className="flex-1 truncate">
                        <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                          <span className="truncate">{pet.nickname}</span>
                          <span className="text-[10px] text-fantasy-gold font-mono font-bold">Lv.{pet.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span 
                            className="text-[9px] uppercase font-bold"
                            style={{ color: sp.accentColor }}
                          >
                            {sp.rarity}
                          </span>
                          {isCurActive && (
                            <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/80 px-1 rounded border border-emerald-800">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Selected Pet Details */}
          {selectedPet && species && stats ? (
            <div className="flex-1 bg-fantasy-panel/60 border border-fantasy-border rounded-2xl p-5 flex flex-col justify-between shadow-xl">
              <div className="flex flex-col gap-4">
                {/* Pet Banner */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-2xl relative"
                      style={{
                        backgroundColor: `${species.accentColor}20`,
                        borderColor: species.accentColor,
                      }}
                    >
                      {selectedPet.speciesId === 'forest_slime' ? '🟢' : 
                       selectedPet.speciesId === 'ember_fox' ? '🦊' : 
                       selectedPet.speciesId === 'frost_bunny' ? '🐰' : 
                       selectedPet.speciesId === 'thunder_cub' ? '🐯' : 
                       selectedPet.speciesId === 'shadow_cat' ? '🐱' : 
                       selectedPet.speciesId === 'crystal_sprite' ? '🧚' : 
                       selectedPet.speciesId === 'moss_turtle' ? '🐢' : '🐲'}
                    </div>

                    <div>
                      {isEditingName ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editNameInput}
                            onChange={(e) => setEditNameInput(e.target.value)}
                            className="bg-slate-900 border border-fantasy-crystal px-2 py-1 rounded text-xs text-white font-bold"
                            maxLength={16}
                            autoFocus
                          />
                          <button
                            onClick={handleSaveRename}
                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                          >
                            <CheckCheck size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-100">{selectedPet.nickname}</h3>
                          <button 
                            onClick={handleStartRename}
                            className="text-slate-400 hover:text-white"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}

                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{lang === 'th' ? species.nameTh : species.nameEn}</span>
                        <span>•</span>
                        <span 
                          className="font-bold uppercase text-[10px]"
                          style={{ color: species.accentColor }}
                        >
                          {species.rarity} {species.element}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Level & Active status badge */}
                  <div className="flex flex-col items-end">
                    <span className="text-xs bg-slate-900 border border-slate-700 text-fantasy-gold font-mono font-bold px-2.5 py-1 rounded-lg">
                      Level {selectedPet.level}
                    </span>
                    {isActive ? (
                      <span className="mt-1.5 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700 font-bold px-2 py-0.5 rounded-full">
                        ACTIVE COMPANION
                      </span>
                    ) : (
                      <span className="mt-1.5 text-[10px] text-slate-500 font-mono">
                        Resting in camp
                      </span>
                    )}
                  </div>
                </div>

                {/* EXP Progression Bar */}
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-[11px] mb-1 font-mono">
                    <span className="text-slate-400">Experience</span>
                    <span className="text-fantasy-gold">{selectedPet.exp} / {selectedPet.maxExp} EXP</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (selectedPet.exp / selectedPet.maxExp) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Pet Combat Stats */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                      <Heart size={11} /> HP
                    </span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{stats.hp}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Swords size={11} /> ATK
                    </span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{stats.atk}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1">
                      <Shield size={11} /> DEF
                    </span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{stats.def}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Zap size={11} /> PWR
                    </span>
                    <span className="text-sm font-bold text-slate-200 font-mono">+{stats.supportPower}</span>
                  </div>
                </div>

                {/* Unique Companion Ability */}
                <div className="bg-fantasy-dark/95 p-3 rounded-xl border border-fantasy-border/70 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-fantasy-gold flex items-center gap-1.5">
                      <Zap size={13} />
                      {lang === 'th' ? species.abilityNameTh : species.abilityNameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      CD: {(species.abilityCooldownMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'th' ? species.abilityDescTh : species.abilityDescEn}
                  </p>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex gap-3 mt-4 pt-3 border-t border-fantasy-border/40">
                {isActive ? (
                  <button
                    onClick={() => setActivePet(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition-all"
                  >
                    {lang === 'th' ? 'ยกเลิกการเรียกคู่หู' : 'Dismiss Companion'}
                  </button>
                ) : (
                  <button
                    onClick={() => setActivePet(selectedPet.id)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check size={15} />
                    <span>{lang === 'th' ? 'เลือกเป็นคู่หูร่วมรบ' : 'Summon Companion'}</span>
                  </button>
                )}

                <button
                  onClick={handleFeedPet}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  title="Feed 25 Gold treats to grant 60 EXP"
                >
                  <ArrowUpCircle size={15} />
                  <span>{lang === 'th' ? 'ให้อาหาร (25 ทอง)' : 'Feed Treat (25g)'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              {lang === 'th' ? 'เลือกสัตว์เลี้ยงเพื่อดูรายละเอียด' : 'Select a companion to view details'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
