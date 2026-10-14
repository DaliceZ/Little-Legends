import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/app/store/useGameStore';

describe('Dungeon Gameplay & Exploration Features (Milestone 3)', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.setState({
      stats: {
        hp: 120,
        maxHp: 120,
        mp: 60,
        maxMp: 60,
        sp: 100,
        maxSp: 100,
        attack: 15,
        defense: 5,
        speed: 150,
        critChance: 0.1,
        critDamage: 1.5,
      },
      dungeonBlessing: null,
      dungeonsCleared: 0,
      monstersDefeated: {},
    });
  });

  describe('Ancient Shrines & Blessings', () => {
    it('applies Phoenix Vigor: increases Max HP and fully restores HP/MP', () => {
      const store = useGameStore.getState();
      // Player was wounded
      useGameStore.setState({
        stats: { ...store.stats, hp: 40, mp: 10 },
      });

      const initialStats = useGameStore.getState().stats;
      const newMaxHp = initialStats.maxHp + 25;

      useGameStore.getState().setPlayerStats({
        ...initialStats,
        maxHp: newMaxHp,
        hp: newMaxHp,
        mp: initialStats.maxMp,
      });
      useGameStore.getState().setDungeonBlessing('Phoenix Vigor (+25 Max HP & Full Heal)');

      const updated = useGameStore.getState();
      expect(updated.stats.maxHp).toBe(145);
      expect(updated.stats.hp).toBe(145);
      expect(updated.stats.mp).toBe(60);
      expect(updated.dungeonBlessing).toContain('Phoenix Vigor');
    });

    it('applies Zephyr Swiftness: boosts Crit Chance and Movement Speed', () => {
      const stats = useGameStore.getState().stats;
      useGameStore.getState().setPlayerStats({
        ...stats,
        critChance: stats.critChance + 0.15,
        speed: stats.speed + 25,
      });
      useGameStore.getState().setDungeonBlessing('Zephyr Swiftness (+15% Crit & +25 Speed)');

      const updated = useGameStore.getState();
      expect(updated.stats.critChance).toBeCloseTo(0.25, 2);
      expect(updated.stats.speed).toBe(175);
      expect(updated.dungeonBlessing).toContain('Zephyr Swiftness');
    });

    it('applies Dragon Wrath: boosts Attack and Defense', () => {
      const stats = useGameStore.getState().stats;
      useGameStore.getState().setPlayerStats({
        ...stats,
        attack: stats.attack + 8,
        defense: stats.defense + 4,
      });
      useGameStore.getState().setDungeonBlessing('Dragon Wrath (+8 Atk & +4 Def)');

      const updated = useGameStore.getState();
      expect(updated.stats.attack).toBe(23);
      expect(updated.stats.defense).toBe(9);
      expect(updated.dungeonBlessing).toContain('Dragon Wrath');
    });
  });

  describe('Dungeon Clears & Kill Tracking', () => {
    it('records defeated monsters by type', () => {
      const store = useGameStore.getState();
      store.recordMonsterDefeated('bat');
      store.recordMonsterDefeated('bat');
      store.recordMonsterDefeated('mushroom');
      store.recordMonsterDefeated('golem');

      const updated = useGameStore.getState();
      expect(updated.monstersDefeated['bat']).toBe(2);
      expect(updated.monstersDefeated['mushroom']).toBe(1);
      expect(updated.monstersDefeated['golem']).toBe(1);
    });

    it('increments dungeonsCleared and resets blessings on return to village', () => {
      useGameStore.getState().setDungeonBlessing('Phoenix Vigor');
      expect(useGameStore.getState().dungeonBlessing).toBe('Phoenix Vigor');
      expect(useGameStore.getState().dungeonsCleared).toBe(0);

      // Simulate boss defeated and returning to village
      useGameStore.getState().incrementDungeonsCleared();
      useGameStore.getState().setDungeonBlessing(null);

      const updated = useGameStore.getState();
      expect(updated.dungeonsCleared).toBe(1);
      expect(updated.dungeonBlessing).toBeNull();
    });
  });

  describe('Boss Phase & Enrage State Calculations', () => {
    interface DummyBoss {
      type: string;
      isBoss: boolean;
      hp: number;
      maxHp: number;
      attack: number;
      speed: number;
      isEnraged?: boolean;
      bossPhase?: number;
    }

    it('triggers enrage when boss HP reaches 50% or below', () => {
      const boss: DummyBoss = {
        type: 'golem',
        isBoss: true,
        hp: 450,
        maxHp: 450,
        attack: 28,
        speed: 55,
      };

      const checkAndTriggerEnrage = (enemy: DummyBoss) => {
        if (enemy.isBoss && !enemy.isEnraged && enemy.hp > 0 && enemy.hp <= enemy.maxHp * 0.5) {
          enemy.isEnraged = true;
          enemy.bossPhase = 2;
          enemy.attack = Math.round(enemy.attack * 1.35);
          enemy.speed = Math.round(enemy.speed * 1.35);
        }
      };

      // Deal damage down to 60%
      boss.hp = 270;
      checkAndTriggerEnrage(boss);
      expect(boss.isEnraged).toBeUndefined();

      // Deal damage down to 50%
      boss.hp = 225;
      checkAndTriggerEnrage(boss);
      expect(boss.isEnraged).toBe(true);
      expect(boss.bossPhase).toBe(2);
      expect(boss.attack).toBe(38); // 28 * 1.35 = 37.8 -> 38
      expect(boss.speed).toBe(74); // 55 * 1.35 = 74.25 -> 74

      // Subsequent hits do not re-multiply stats
      const enragedAtk = boss.attack;
      boss.hp = 100;
      checkAndTriggerEnrage(boss);
      expect(boss.attack).toBe(enragedAtk);
    });
  });
});
