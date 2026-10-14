import { describe, it, expect, beforeEach } from 'vitest';
import { sandboxManager } from '../src/features/sandbox/sandboxManager';

describe('Sandbox & Cheats Management Engine', () => {
  beforeEach(() => {
    sandboxManager.resetStats();
    sandboxManager.setToggle('godMode', false);
    sandboxManager.setToggle('infiniteMana', false);
    sandboxManager.setToggle('infiniteStamina', false);
    sandboxManager.setToggle('zeroCooldowns', false);
    sandboxManager.setToggle('disableEnemyAI', false);
    sandboxManager.setToggle('invulnerableEnemies', false);
  });

  it('initializes with default toggles disabled and 0 damage dealt', () => {
    const config = sandboxManager.getConfig();
    expect(config.godMode).toBe(false);
    expect(config.infiniteMana).toBe(false);
    expect(config.totalDamageDealt).toBe(0);
    expect(config.dps).toBe(0);
    expect(config.combatLogs.length).toBe(0);
  });

  it('toggles developer cheats correctly', () => {
    sandboxManager.setToggle('godMode', true);
    sandboxManager.setToggle('zeroCooldowns', true);

    expect(sandboxManager.getConfig().godMode).toBe(true);
    expect(sandboxManager.getConfig().zeroCooldowns).toBe(true);
    expect(sandboxManager.getConfig().infiniteMana).toBe(false);
  });

  it('records combat damage and calculates live DPS', () => {
    sandboxManager.recordDamage('Kael', 'slime', 150, false, 'fire');
    sandboxManager.recordDamage('Kael', 'wolf', 300, true, 'crystal');

    const config = sandboxManager.getConfig();
    expect(config.totalDamageDealt).toBe(450);
    expect(config.dps).toBe(150); // 450 / 3
    expect(config.combatLogs.length).toBe(2);
    expect(config.combatLogs[0].target).toBe('wolf');
    expect(config.combatLogs[0].isCrit).toBe(true);
    expect(config.combatLogs[1].target).toBe('slime');
  });

  it('resets telemetry data properly', () => {
    sandboxManager.recordDamage('Kael', 'golem', 500, false, 'earth');
    expect(sandboxManager.getConfig().totalDamageDealt).toBe(500);

    sandboxManager.resetStats();
    expect(sandboxManager.getConfig().totalDamageDealt).toBe(0);
    expect(sandboxManager.getConfig().dps).toBe(0);
    expect(sandboxManager.getConfig().combatLogs.length).toBe(0);
  });
});
