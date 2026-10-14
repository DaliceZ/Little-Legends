import { describe, it, expect } from 'vitest';
import { 
  calculateDamage, 
  calculateNextLevelExp, 
  calculateLevelUpStats 
} from '../src/features/combat/combatCalculations';
import { CharacterStats } from '../src/shared/types';

describe('Combat Calculations Engine', () => {
  it('calculates base damage with zero defense correctly', () => {
    // Attack 20 vs Defense 0 -> Mitigated damage is 20
    const result = calculateDamage(20, 0, 0.0, 1.5, 1.0, 0.5);
    expect(result.rawDamage).toBe(20);
    expect(result.mitigatedDamage).toBe(20);
    expect(result.isCritical).toBe(false);
    expect(result.finalDamage).toBeGreaterThanOrEqual(18);
    expect(result.finalDamage).toBeLessThanOrEqual(22);
  });

  it('mitigates damage based on armor defense formula', () => {
    // Attack 100 vs Defense 100 -> Mitigation = 100 / (100 + 100) = 50%
    const result = calculateDamage(100, 100, 0.0, 1.5, 1.0, 0.5);
    expect(result.mitigatedDamage).toBe(50);
  });

  it('guarantees a minimum damage of at least 1 even against extreme defense', () => {
    const result = calculateDamage(5, 9999, 0.0, 1.5, 1.0, 0.0);
    expect(result.finalDamage).toBeGreaterThanOrEqual(1);
  });

  it('applies critical strike multiplier when roll < critChance', () => {
    // Crit chance 20% (0.2), roll is 0.1 -> critical hit triggers
    const normal = calculateDamage(50, 0, 0.0, 2.0, 1.0, 0.5);
    const crit = calculateDamage(50, 0, 0.2, 2.0, 1.0, 0.1);

    expect(crit.isCritical).toBe(true);
    expect(crit.finalDamage).toBeGreaterThan(normal.finalDamage);
  });

  it('caps critical strike chance at 75% maximum', () => {
    // Even if crit chance is 100% (1.0), roll of 0.8 is not a critical hit (capped at 0.75)
    const result = calculateDamage(50, 0, 1.0, 2.0, 1.0, 0.8);
    expect(result.isCritical).toBe(false);
  });

  it('scales next level experience progressively', () => {
    const expLvl1 = calculateNextLevelExp(1);
    const expLvl2 = calculateNextLevelExp(2);
    const expLvl5 = calculateNextLevelExp(5);

    expect(expLvl1).toBe(100);
    expect(expLvl2).toBeGreaterThan(expLvl1);
    expect(expLvl5).toBeGreaterThan(expLvl2);
  });

  it('enhances character attributes upon leveling up', () => {
    const initialStats: CharacterStats = {
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      sp: 100,
      maxSp: 100,
      attack: 15,
      defense: 10,
      critChance: 0.1,
      critDamage: 1.5,
      speed: 150,
    };

    const upgraded = calculateLevelUpStats(initialStats);
    expect(upgraded.maxHp).toBe(120);
    expect(upgraded.hp).toBe(120); // Full heal on level up
    expect(upgraded.maxMp).toBe(60);
    expect(upgraded.attack).toBe(18);
    expect(upgraded.defense).toBe(12);
  });
});
