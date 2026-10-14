import { describe, it, expect, beforeEach } from 'vitest';
import { SkillCastingEngine } from '../src/features/combat/SkillCastingEngine';
import { useGameStore } from '../src/app/store/useGameStore';
import { sandboxManager } from '../src/features/sandbox/sandboxManager';

describe('SkillCastingEngine State Machine & Casting Pipeline', () => {
  let engine: SkillCastingEngine;

  beforeEach(() => {
    engine = SkillCastingEngine.getInstance();
    engine.resetAllCooldowns();
    engine.cancelCurrentCast('Test Reset');

    // Reset game store player state to standard defaults
    const store = useGameStore.getState();
    store.closeModal();
    store.setPlayerStats({
      maxHp: 150,
      hp: 150,
      maxMp: 80,
      mp: 80,
      maxSp: 100,
      sp: 100,
      attack: 25,
      defense: 12,
      critChance: 0.1,
      critDamage: 1.5,
    });

    // Reset sandbox toggles
    sandboxManager.setToggle('zeroCooldowns', false);
    sandboxManager.setToggle('infiniteMana', false);
    sandboxManager.setToggle('infiniteStamina', false);
  });

  it('initializes with singleton instance in IDLE state', () => {
    expect(engine).toBeDefined();
    expect(engine.getState()).toBe('IDLE');
    expect(engine.getCurrentSkill()).toBeNull();
  });

  it('validates skill cast requirements correctly', () => {
    // 1. Non-existent skill
    const invalidResult = engine.canCast('non_existent_skill_id');
    expect(invalidResult.canCast).toBe(false);
    expect(invalidResult.reason).toBe('Skill not found');

    // 2. Valid skill with sufficient resources
    const validResult = engine.canCast('skill_bd_quick_slash');
    expect(validResult.canCast).toBe(true);

    // 3. Insufficient SP
    const store = useGameStore.getState();
    store.setPlayerStats({ sp: 2 }); // quick slash requires 15 SP
    const lowSpResult = engine.canCast('skill_bd_quick_slash');
    expect(lowSpResult.canCast).toBe(false);
    expect(lowSpResult.reason).toBe('Not enough stamina');

    // 4. Insufficient MP
    store.setPlayerStats({ sp: 100, mp: 5 }); // blade storm requires 10 MP
    const lowMpResult = engine.canCast('skill_bd_blade_storm');
    expect(lowMpResult.canCast).toBe(false);
    expect(lowMpResult.reason).toBe('Not enough mana');

    // 5. Defeated player
    store.setPlayerStats({ hp: 0 });
    const deadResult = engine.canCast('skill_bd_quick_slash');
    expect(deadResult.canCast).toBe(false);
    expect(deadResult.reason).toBe('Player is defeated');
  });

  it('rejects skill cast while a modal is open', () => {
    const store = useGameStore.getState();
    store.openModal('inventory');
    const result = engine.canCast('skill_bd_quick_slash');
    expect(result.canCast).toBe(false);
    expect(result.reason).toBe('Cannot cast while in menu or dialogue');
  });

  it('tracks cooldown timers and handles cooldown queries', () => {
    const skillId = 'skill_bd_quick_slash';
    expect(engine.getCooldownRemaining(skillId)).toBe(0);
    expect(engine.getCooldownRatio(skillId)).toBe(0);

    // Simulate putting skill on cooldown (simulate cast committing cooldown)
    const mockContext: any = {
      scene: {
        time: {
          delayedCall: (_delay: number, _callback: () => void) => {
            return { remove: () => {} };
          }
        },
        tweens: {
          add: (_config: any) => ({ stop: () => {} })
        },
        cameras: { main: { shake: () => {} } }
      },
      player: {
        x: 100,
        y: 100,
        setVelocity: () => {},
        setTint: () => {},
        clearTint: () => {},
        setScale: () => {}
      },
      currentDirection: 'right',
      getEnemies: () => []
    };

    // Cast skill
    const castSuccess = engine.castSkill(skillId, mockContext);
    expect(castSuccess).toBe(true);

    // While casting, another cast should be rejected
    const secondCast = engine.canCast(skillId);
    expect(secondCast.canCast).toBe(false);
    expect(secondCast.reason).toBe('Already casting another skill');

    // Interrupt/Cancel cast
    engine.cancelCurrentCast('Test cancellation', true);
    expect(engine.getState()).toBe('IDLE');
  });

  it('honors sandbox zeroCooldowns toggle', () => {
    sandboxManager.setToggle('zeroCooldowns', true);
    // When zeroCooldowns is active, cooldown remaining is always 0
    expect(engine.getCooldownRemaining('skill_bd_quick_slash')).toBe(0);
    expect(engine.getCooldownRatio('skill_bd_quick_slash')).toBe(0);
  });
});
