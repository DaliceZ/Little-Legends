export interface CombatLogEntry {
  id: string;
  timestamp: string;
  source: string;
  target: string;
  damage: number;
  isCrit: boolean;
  element: string;
}

export interface SandboxConfig {
  godMode: boolean;
  infiniteMana: boolean;
  infiniteStamina: boolean;
  zeroCooldowns: boolean;
  disableEnemyAI: boolean;
  invulnerableEnemies: boolean;
  dps: number;
  totalDamageDealt: number;
  combatLogs: CombatLogEntry[];
}

export const initialSandboxConfig: SandboxConfig = {
  godMode: false,
  infiniteMana: false,
  infiniteStamina: false,
  zeroCooldowns: false,
  disableEnemyAI: false,
  invulnerableEnemies: false,
  dps: 0,
  totalDamageDealt: 0,
  combatLogs: [],
};

class SandboxManager {
  private config: SandboxConfig = { ...initialSandboxConfig };
  private dpsWindow: { timestamp: number; damage: number }[] = [];

  getConfig(): SandboxConfig {
    return this.config;
  }

  setToggle(key: keyof SandboxConfig, value: boolean) {
    (this.config as any)[key] = value;
  }

  recordDamage(source: string, target: string, damage: number, isCrit: boolean, element: string = 'physical') {
    const now = Date.now();
    this.config.totalDamageDealt += damage;
    this.dpsWindow.push({ timestamp: now, damage });

    // Clean DPS window older than 3 seconds
    this.dpsWindow = this.dpsWindow.filter((w) => now - w.timestamp < 3000);
    const windowSum = this.dpsWindow.reduce((sum, w) => sum + w.damage, 0);
    this.config.dps = Math.round(windowSum / 3);

    // Keep last 15 combat logs
    const log: CombatLogEntry = {
      id: `log_${now}_${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      source,
      target,
      damage,
      isCrit,
      element,
    };
    this.config.combatLogs = [log, ...this.config.combatLogs.slice(0, 14)];
  }

  resetStats() {
    this.config.totalDamageDealt = 0;
    this.config.dps = 0;
    this.config.combatLogs = [];
    this.dpsWindow = [];
  }
}

export const sandboxManager = new SandboxManager();
