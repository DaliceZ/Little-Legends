import React from 'react';
import { ALL_SKILLS_36 } from './skillData';

interface SkillIconProps {
  skillId: string;
  size?: number;
  showHotkey?: number;
  showCost?: boolean;
  cooldownRatio?: number;
  cooldownRemainingMs?: number;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SkillIcon: React.FC<SkillIconProps> = ({
  skillId,
  size = 48,
  showHotkey,
  showCost = false,
  cooldownRatio = 0,
  cooldownRemainingMs = 0,
  onClick,
  disabled = false,
  className = '',
}) => {
  const skill = ALL_SKILLS_36[skillId];
  if (!skill) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-slate-500 font-mono text-xs ${className}`}
      >
        ?
      </div>
    );
  }

  const isUltimate = skill.isUltimate || skill.tier === 4;
  const isCooldown = cooldownRatio > 0;

  // Frame colors based on element & tier
  const getBorderColor = () => {
    if (isUltimate) return 'border-amber-400 shadow-amber-500/30 shadow-lg';
    switch (skill.element) {
      case 'fire': return 'border-red-500/70 hover:border-red-400';
      case 'ice': return 'border-sky-400/70 hover:border-sky-300';
      case 'shadow': return 'border-purple-500/70 hover:border-purple-400';
      case 'crystal': return 'border-cyan-400/70 hover:border-cyan-300';
      case 'earth': return 'border-amber-600/70 hover:border-amber-500';
      case 'wind': return 'border-emerald-400/70 hover:border-emerald-300';
      default: return 'border-slate-500/70 hover:border-slate-400';
    }
  };

  const getBackgroundGradient = () => {
    switch (skill.element) {
      case 'fire': return 'from-red-950/80 via-slate-900 to-amber-950/40';
      case 'ice': return 'from-sky-950/80 via-slate-900 to-cyan-950/40';
      case 'shadow': return 'from-purple-950/80 via-slate-900 to-slate-950';
      case 'crystal': return 'from-cyan-950/80 via-slate-900 to-blue-950/40';
      case 'earth': return 'from-stone-900 via-amber-950/40 to-stone-950';
      case 'wind': return 'from-emerald-950/80 via-slate-900 to-teal-950/40';
      default: return 'from-slate-900 to-slate-950';
    }
  };

  // Render SVG Glyph for each of the 36 skills
  const renderGlyph = () => {
    switch (skill.id) {
      // Blade Dancer (Wind / Agility)
      case 'skill_bd_quick_slash':
        return (
          <g>
            <path d="M10 38 L38 10" stroke="#a7f3d0" strokeWidth="4" strokeLinecap="round" />
            <path d="M14 42 L42 14" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M8 30 Q 24 24 38 10" stroke="#ffffff" strokeWidth="2" fill="none" strokeDasharray="3 3" />
          </g>
        );
      case 'skill_bd_crescent':
        return (
          <g>
            <path d="M12 36 A 20 20 0 0 1 36 12" stroke="#34d399" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M16 38 A 16 16 0 0 1 38 16" stroke="#ffffff" strokeWidth="2" fill="none" />
            <polygon points="36,10 40,16 32,15" fill="#a7f3d0" />
          </g>
        );
      case 'skill_bd_dash_strike':
        return (
          <g>
            <path d="M6 24 L36 24" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
            <polygon points="42,24 32,18 34,24 32,30" fill="#6ee7b7" />
            <line x1="8" y1="18" x2="26" y2="18" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
            <line x1="8" y1="30" x2="26" y2="30" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
          </g>
        );
      case 'skill_bd_blade_storm':
        return (
          <g>
            <circle cx="24" cy="24" r="14" stroke="#34d399" strokeWidth="2.5" fill="none" strokeDasharray="6 4" />
            <path d="M24 10 L28 18 L24 16 L20 18 Z" fill="#6ee7b7" />
            <path d="M38 24 L30 28 L32 24 L30 20 Z" fill="#6ee7b7" />
            <path d="M24 38 L20 30 L24 32 L28 30 Z" fill="#6ee7b7" />
            <path d="M10 24 L18 20 L16 24 L18 28 Z" fill="#6ee7b7" />
            <circle cx="24" cy="24" r="3" fill="#ffffff" />
          </g>
        );
      case 'skill_bd_phantom_cut':
        return (
          <g>
            <path d="M10 14 L38 34" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
            <path d="M38 14 L10 34" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            <circle cx="24" cy="24" r="4" fill="#f3e8ff" />
            <path d="M14 8 L34 40" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 3" />
          </g>
        );
      case 'skill_bd_ultimate':
        return (
          <g>
            <circle cx="24" cy="24" r="18" stroke="#fbbf24" strokeWidth="2" fill="none" />
            <path d="M24 6 L27 18 L39 18 L29 25 L33 37 L24 30 L15 37 L19 25 L9 18 L21 18 Z" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="5" fill="#ffffff" />
          </g>
        );

      // Guardian (Earth / Defense)
      case 'skill_gd_shield_bash':
        return (
          <g>
            <path d="M14 12 L34 12 L34 26 C34 33 24 38 24 38 C24 38 14 33 14 26 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="2.5" />
            <polygon points="24,18 28,24 20,24" fill="#fef3c7" />
            <circle cx="24" cy="27" r="2.5" fill="#fef3c7" />
          </g>
        );
      case 'skill_gd_iron_guard':
        return (
          <g>
            <rect x="13" y="11" width="22" height="26" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />
            <line x1="24" y1="11" x2="24" y2="37" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="13" y1="24" x2="35" y2="24" stroke="#cbd5e1" strokeWidth="2" />
          </g>
        );
      case 'skill_gd_ground_slam':
        return (
          <g>
            <path d="M24 8 L24 28" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <rect x="17" y="6" width="14" height="8" rx="2" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M10 38 L16 32 L24 38 L32 32 L38 38" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'skill_gd_counter':
        return (
          <g>
            <circle cx="24" cy="24" r="14" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
            <path d="M16 16 L32 32 M32 16 L16 32" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="24" r="4" fill="#ffffff" />
          </g>
        );
      case 'skill_gd_aura':
        return (
          <g>
            <circle cx="24" cy="24" r="16" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="4 3" />
            <circle cx="24" cy="24" r="9" fill="#d97706" opacity="0.6" />
            <polygon points="24,14 27,21 34,24 27,27 24,34 21,27 14,24 21,21" fill="#fef3c7" />
          </g>
        );
      case 'skill_gd_ultimate':
        return (
          <g>
            <path d="M12 10 L36 10 L36 28 C36 36 24 42 24 42 C24 42 12 36 12 28 Z" fill="#78350f" stroke="#fbbf24" strokeWidth="3" />
            <path d="M24 16 L27 23 L34 24 L29 29 L30 36 L24 32 L18 36 L19 29 L14 24 L21 23 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          </g>
        );

      // Flame Mage (Fire / Burst)
      case 'skill_fm_fireball':
        return (
          <g>
            <path d="M24 8 C32 16 36 24 34 32 C32 38 26 40 22 40 C16 40 12 36 12 30 C12 22 18 16 24 8 Z" fill="#ef4444" stroke="#f97316" strokeWidth="2" />
            <ellipse cx="23" cy="29" rx="6" ry="7" fill="#fbbf24" />
            <circle cx="23" cy="30" r="3" fill="#ffffff" />
          </g>
        );
      case 'skill_fm_flame_wave':
        return (
          <g>
            <path d="M8 32 Q 24 14 40 32" stroke="#ea580c" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M12 26 Q 24 10 36 26" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M16 20 Q 24 8 32 20" stroke="#fef08a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'skill_fm_burning_circle':
        return (
          <g>
            <circle cx="24" cy="24" r="14" stroke="#dc2626" strokeWidth="3" fill="none" />
            <circle cx="24" cy="24" r="9" stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="3 3" />
            <circle cx="24" cy="24" r="4" fill="#fbbf24" />
            <line x1="24" y1="6" x2="24" y2="10" stroke="#fca5a5" strokeWidth="2" />
            <line x1="24" y1="38" x2="24" y2="42" stroke="#fca5a5" strokeWidth="2" />
            <line x1="6" y1="24" x2="10" y2="24" stroke="#fca5a5" strokeWidth="2" />
            <line x1="38" y1="24" x2="42" y2="24" stroke="#fca5a5" strokeWidth="2" />
          </g>
        );
      case 'skill_fm_meteor':
        return (
          <g>
            <path d="M10 10 L28 28" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
            <path d="M14 14 L30 30" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="32" r="9" fill="#78350f" stroke="#ea580c" strokeWidth="2" />
            <circle cx="31" cy="31" r="5" fill="#f97316" />
            <circle cx="30" cy="30" r="2" fill="#ffffff" />
          </g>
        );
      case 'skill_fm_phoenix':
        return (
          <g>
            <path d="M24 10 C24 10 12 18 10 28 C14 26 18 26 22 28 C22 28 24 16 24 10 Z" fill="#ef4444" />
            <path d="M24 10 C24 10 36 18 38 28 C34 26 30 26 26 28 C26 28 24 16 24 10 Z" fill="#f97316" />
            <polygon points="24,18 27,28 21,28" fill="#fbbf24" />
            <circle cx="24" cy="14" r="2.5" fill="#ffffff" />
          </g>
        );
      case 'skill_fm_ultimate':
        return (
          <g>
            <circle cx="24" cy="24" r="16" fill="#dc2626" opacity="0.3" />
            <circle cx="24" cy="24" r="11" fill="#ea580c" />
            <circle cx="24" cy="24" r="6" fill="#fbbf24" />
            <circle cx="24" cy="24" r="3" fill="#ffffff" />
            <path d="M24 4 L24 44 M4 24 L44 24 M10 10 L38 38 M10 38 L38 10" stroke="#fef08a" strokeWidth="2" strokeDasharray="3 3" />
          </g>
        );

      // Frost Mage (Ice / Control)
      case 'skill_fr_ice_spear':
        return (
          <g>
            <polygon points="24,6 30,28 24,42 18,28" fill="#38bdf8" stroke="#bae6fd" strokeWidth="2" />
            <line x1="24" y1="6" x2="24" y2="42" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        );
      case 'skill_fr_frost_nova':
        return (
          <g>
            <path d="M24 8 L24 40 M8 24 L40 24 M13 13 L35 35 M13 35 L35 13" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="24,18 28,24 24,30 20,24" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
          </g>
        );
      case 'skill_fr_frozen_armor':
        return (
          <g>
            <polygon points="24,8 36,16 34,34 24,40 14,34 12,16" fill="#0284c7" stroke="#7dd3fc" strokeWidth="2.5" />
            <polygon points="24,14 30,19 28,30 24,33 20,30 18,19" fill="#bae6fd" opacity="0.7" />
          </g>
        );
      case 'skill_fr_blizzard':
        return (
          <g>
            <path d="M12 18 Q 24 8 36 18 Q 28 26 20 28 Q 26 34 34 32" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="16" cy="14" r="2" fill="#ffffff" />
            <circle cx="34" cy="16" r="2.5" fill="#ffffff" />
            <circle cx="28" cy="34" r="2" fill="#ffffff" />
            <circle cx="14" cy="32" r="2.5" fill="#ffffff" />
          </g>
        );
      case 'skill_fr_crystal_prison':
        return (
          <g>
            <polygon points="24,6 38,16 38,32 24,42 10,32 10,16" fill="#0369a1" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="24" y1="6" x2="24" y2="42" stroke="#bae6fd" strokeWidth="1.5" />
            <line x1="10" y1="16" x2="38" y2="32" stroke="#bae6fd" strokeWidth="1.5" />
            <line x1="10" y1="32" x2="38" y2="16" stroke="#bae6fd" strokeWidth="1.5" />
          </g>
        );
      case 'skill_fr_ultimate':
        return (
          <g>
            <polygon points="24,4 40,24 24,44 8,24" fill="#0284c7" stroke="#e0f2fe" strokeWidth="3" />
            <polygon points="24,11 33,24 24,37 15,24" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="4" fill="#ffffff" />
          </g>
        );

      // Shadow Assassin (Void / Stealth)
      case 'skill_sa_shadow_step':
        return (
          <g>
            <ellipse cx="24" cy="32" rx="14" ry="7" fill="#581c87" opacity="0.7" />
            <path d="M18 16 C18 12 24 10 24 10 C24 10 30 12 30 16 C30 22 26 28 24 30 C22 28 18 22 18 16 Z" fill="#a855f7" />
            <circle cx="22" cy="16" r="1.5" fill="#f43f5e" />
            <circle cx="26" cy="16" r="1.5" fill="#f43f5e" />
          </g>
        );
      case 'skill_sa_poison_blade':
        return (
          <g>
            <path d="M12 36 L34 14 L30 10 L8 32 Z" fill="#15803d" stroke="#22c55e" strokeWidth="2" />
            <circle cx="34" cy="12" r="3" fill="#4ade80" />
            <circle cx="38" cy="16" r="2" fill="#86efac" />
            <circle cx="28" cy="8" r="2" fill="#86efac" />
          </g>
        );
      case 'skill_sa_phantom_clone':
        return (
          <g>
            <circle cx="18" cy="20" r="7" fill="#6b21a8" opacity="0.6" />
            <circle cx="30" cy="24" r="8" fill="#9333ea" stroke="#c084fc" strokeWidth="1.5" />
            <circle cx="28" cy="23" r="1.5" fill="#ffffff" />
            <circle cx="33" cy="23" r="1.5" fill="#ffffff" />
          </g>
        );
      case 'skill_sa_dark_veil':
        return (
          <g>
            <path d="M12 18 C16 12 32 12 36 18 C38 28 32 36 24 38 C16 36 10 28 12 18 Z" fill="#3b0764" stroke="#a855f7" strokeWidth="2" />
            <line x1="16" y1="22" x2="22" y2="24" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="22" x2="26" y2="24" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'skill_sa_soul_reaper':
        return (
          <g>
            <path d="M12 38 L30 14" stroke="#7e22ce" strokeWidth="3" strokeLinecap="round" />
            <path d="M30 14 C36 8 40 14 36 22 C34 26 30 24 30 24" stroke="#c084fc" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="24" cy="24" r="3" fill="#f43f5e" />
          </g>
        );
      case 'skill_sa_ultimate':
        return (
          <g>
            <circle cx="24" cy="24" r="15" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
            <path d="M16 20 C16 14 32 14 32 20 C32 27 28 32 24 33 C20 32 16 27 16 20 Z" fill="#581c87" stroke="#e879f9" strokeWidth="1.5" />
            <circle cx="21" cy="21" r="2" fill="#ef4444" />
            <circle cx="27" cy="21" r="2" fill="#ef4444" />
          </g>
        );

      // Echo Sorcerer (Crystal / Astral)
      case 'skill_es_echo_bolt':
        return (
          <g>
            <polygon points="24,6 32,24 24,42 16,24" fill="#06b6d4" stroke="#67e8f9" strokeWidth="2" />
            <circle cx="24" cy="24" r="4" fill="#ffffff" />
          </g>
        );
      case 'skill_es_crystal_barrier':
        return (
          <g>
            <polygon points="24,8 36,15 36,33 24,40 12,33 12,15" fill="#0891b2" stroke="#a5f3fc" strokeWidth="2.5" />
            <circle cx="24" cy="24" r="6" fill="#e0f2fe" opacity="0.6" />
          </g>
        );
      case 'skill_es_resonance_pulse':
        return (
          <g>
            <circle cx="24" cy="24" r="16" stroke="#22d3ee" strokeWidth="2" fill="none" strokeDasharray="3 3" />
            <circle cx="24" cy="24" r="10" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
            <circle cx="24" cy="24" r="4" fill="#ffffff" />
          </g>
        );
      case 'skill_es_echo_rift':
        return (
          <g>
            <ellipse cx="24" cy="24" rx="16" ry="7" fill="#0e7490" transform="rotate(-30 24 24)" />
            <ellipse cx="24" cy="24" rx="10" ry="4" fill="#67e8f9" transform="rotate(-30 24 24)" />
            <circle cx="24" cy="24" r="3" fill="#ffffff" />
          </g>
        );
      case 'skill_es_astral_beam':
        return (
          <g>
            <line x1="8" y1="40" x2="40" y2="8" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
            <line x1="8" y1="40" x2="40" y2="8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <polygon points="40,8 34,14 40,16" fill="#cffafe" />
          </g>
        );
      case 'skill_es_ultimate':
        return (
          <g>
            <circle cx="24" cy="24" r="17" stroke="#38bdf8" strokeWidth="2" fill="#082f49" />
            <polygon points="24,6 30,18 42,24 30,30 24,42 18,30 6,24 18,18" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="5" fill="#f0f9ff" />
          </g>
        );

      default:
        return (
          <circle cx="24" cy="24" r="12" fill="#64748b" />
        );
    }
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{ width: size, height: size }}
      className={`relative group rounded-xl border-2 bg-gradient-to-br ${getBackgroundGradient()} ${getBorderColor()} flex items-center justify-center transition-all select-none overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'
      } ${className}`}
      title={`${skill.nameEn} / ${skill.nameTh}\n${skill.descriptionEn}`}
    >
      {/* Visual Glyph */}
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full p-1 drop-shadow-md pointer-events-none"
      >
        {renderGlyph()}
      </svg>

      {/* Tier / Ultimate indicator shine */}
      {isUltimate && (
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-amber-300/20 pointer-events-none" />
      )}

      {/* Cooldown Dark Overlay & Sweep */}
      {isCooldown && (
        <div 
          className="absolute inset-0 bg-black/75 flex items-center justify-center pointer-events-none"
          style={{
            clipPath: `polygon(50% 50%, 50% 0%, ${cooldownRatio >= 0.125 ? '100% 0%,' : ''} ${cooldownRatio >= 0.375 ? '100% 100%,' : ''} ${cooldownRatio >= 0.625 ? '0% 100%,' : ''} ${cooldownRatio >= 0.875 ? '0% 0%,' : ''} ${50 + 50 * Math.sin(cooldownRatio * Math.PI * 2)}% ${50 - 50 * Math.cos(cooldownRatio * Math.PI * 2)}%)`
          }}
        >
          {cooldownRemainingMs > 0 && (
            <span className="text-white font-mono font-bold text-xs drop-shadow">
              {(cooldownRemainingMs / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      )}

      {/* Hotkey Badge in Top-Right */}
      {showHotkey !== undefined && (
        <span className="absolute -top-1 -right-1 bg-slate-950/90 border border-slate-700 text-fantasy-gold font-mono text-[9px] font-bold px-1 rounded-sm shadow-md pointer-events-none">
          {showHotkey}
        </span>
      )}

      {/* Resource Cost Badge in Bottom-Right */}
      {showCost && (skill.costMp > 0 || skill.costSp > 0) && (
        <span className={`absolute bottom-0 right-0 px-1 rounded-tl text-[8px] font-mono font-bold pointer-events-none ${
          skill.costMp > 0 
            ? 'bg-blue-950/90 text-blue-300 border-t border-l border-blue-700' 
            : 'bg-emerald-950/90 text-emerald-300 border-t border-l border-emerald-700'
        }`}>
          {skill.costMp > 0 ? `${skill.costMp}m` : `${skill.costSp}s`}
        </span>
      )}
    </div>
  );
};
