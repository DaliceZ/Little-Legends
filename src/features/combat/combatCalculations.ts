import { CharacterStats } from '../../shared/types';

export interface DamageResult {
  rawDamage: number;
  mitigatedDamage: number;
  isCritical: boolean;
  finalDamage: number;
}

/**
 * Calculates outgoing combat damage from an attacker against a defender.
 * Implements mitigated damage curves, crit caps, and minimum damage guarantees.
 */
export function calculateDamage(
  attackerAttack: number,
  defenderDefense: number,
  critChance: number = 0.05,
  critDamageMultiplier: number = 1.5,
  skillMultiplier: number = 1.0,
  randomRoll: number = Math.random() // injectable for deterministic testing
): DamageResult {
  // 1. Calculate Base Raw Damage
  const baseDamage = Math.max(1, attackerAttack * skillMultiplier);

  // 2. Armor Mitigation Formula: Damage * (100 / (100 + Defense))
  const defense = Math.max(0, defenderDefense);
  const mitigationFactor = 100 / (100 + defense);
  const mitigatedDamage = baseDamage * mitigationFactor;

  // 3. Critical Strike Roll (Capped at 75% max crit rate)
  const effectiveCritRate = Math.min(0.75, Math.max(0, critChance));
  const isCritical = randomRoll < effectiveCritRate;
  const criticalMultiplier = isCritical ? Math.max(1.0, critDamageMultiplier) : 1.0;

  // 4. Calculate Final Damage with random variance (+/- 10%)
  const variance = 0.9 + (randomRoll * 0.2); // between 0.9 and 1.1
  const calculatedDamage = Math.round(mitigatedDamage * criticalMultiplier * variance);

  // 5. Guaranteed Minimum Damage Rule
  const finalDamage = Math.max(1, calculatedDamage);

  return {
    rawDamage: Math.round(baseDamage),
    mitigatedDamage: Math.round(mitigatedDamage),
    isCritical,
    finalDamage,
  };
}

/**
 * Calculates experience required to advance from level to level + 1.
 */
export function calculateNextLevelExp(level: number): number {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.45));
}

/**
 * Level up attribute growth formula.
 */
export function calculateLevelUpStats(currentStats: CharacterStats): CharacterStats {
  return {
    ...currentStats,
    maxHp: currentStats.maxHp + 20,
    hp: currentStats.maxHp + 20, // Full heal on level up
    maxMp: currentStats.maxMp + 10,
    mp: currentStats.maxMp + 10,
    maxSp: currentStats.maxSp + 5,
    sp: currentStats.maxSp + 5,
    attack: currentStats.attack + 3,
    defense: currentStats.defense + 2,
    critChance: Math.min(0.75, currentStats.critChance + 0.01),
    critDamage: currentStats.critDamage + 0.02,
    speed: currentStats.speed,
  };
}
