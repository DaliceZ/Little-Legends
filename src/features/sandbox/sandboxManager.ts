import { useGameStore } from '../../app/store/useGameStore';
import { ITEM_REGISTRY } from '../items/itemRegistry';
import { ALL_SKILLS_36 } from '../skills/skillData';
import { PetRarity, PetSpeciesId } from '../../shared/types';
import { soundManager } from '../../shared/utils/soundSynthesizer';

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

export interface CommandResult {
  success: boolean;
  message: string;
  changedValue?: any;
}

export interface CommandHistoryEntry {
  id: string;
  command: string;
  timestamp: string;
  result: CommandResult;
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
  private commandHistory: CommandHistoryEntry[] = [];

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

    // Keep last 25 combat logs
    const log: CombatLogEntry = {
      id: `log_${now}_${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      source,
      target,
      damage,
      isCrit,
      element,
    };
    this.config.combatLogs = [log, ...this.config.combatLogs.slice(0, 24)];
  }

  resetStats() {
    this.config.totalDamageDealt = 0;
    this.config.dps = 0;
    this.config.combatLogs = [];
    this.dpsWindow = [];
  }

  getCommandHistory(): CommandHistoryEntry[] {
    return this.commandHistory;
  }

  clearCommandHistory() {
    this.commandHistory = [];
  }

  executeCommand(input: string): CommandResult {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, message: 'Empty command.' };
    }

    const tokens = trimmed.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    let result: CommandResult;

    switch (cmd) {
      case 'help': {
        result = {
          success: true,
          message: [
            'Available Sandbox Commands:',
            '  godmode [on|off]          - Invincibility (never die)',
            '  mana [on|off]             - Infinite MP resource',
            '  stamina [on|off]          - Infinite SP stamina',
            '  cooldowns [on|off]        - Zero cooldowns on all skills',
            '  ai [on|off]               - Freeze / unfreeze enemy AI',
            '  gold <amount>             - Add or remove gold',
            '  exp <amount>              - Add player EXP',
            '  shards <amount>           - Add Echo Shards',
            '  heal                      - Restore HP, MP, SP to maximum',
            '  spawn <itemId> [count]    - Spawn item into inventory',
            '  spawnegg <rarity> [spec]  - Spawn pet egg (common..legendary)',
            '  addpet <speciesId>        - Unlock companion pet',
            '  hatchall                  - Instantly hatch all eggs',
            '  feedpet <exp>             - Boost active pet EXP',
            '  unlockskills              - Unlock all 36 skills max rank',
            '  tp <village|dungeon1|3>   - Instant teleport zone',
            '  dps [reset]               - Inspect or reset combat DPS',
            '  clear                     - Clear console command logs',
          ].join('\n'),
        };
        break;
      }

      case 'godmode': {
        const next = args[0] ? args[0].toLowerCase() === 'on' : !this.config.godMode;
        this.config.godMode = next;
        soundManager.playSfx('crystal');
        result = {
          success: true,
          message: `God Mode: ${next ? 'ENABLED' : 'DISABLED'}`,
          changedValue: next,
        };
        break;
      }

      case 'mana': {
        const next = args[0] ? args[0].toLowerCase() === 'on' : !this.config.infiniteMana;
        this.config.infiniteMana = next;
        soundManager.playSfx('crystal');
        result = {
          success: true,
          message: `Infinite Mana: ${next ? 'ENABLED' : 'DISABLED'}`,
          changedValue: next,
        };
        break;
      }

      case 'stamina': {
        const next = args[0] ? args[0].toLowerCase() === 'on' : !this.config.infiniteStamina;
        this.config.infiniteStamina = next;
        soundManager.playSfx('crystal');
        result = {
          success: true,
          message: `Infinite Stamina: ${next ? 'ENABLED' : 'DISABLED'}`,
          changedValue: next,
        };
        break;
      }

      case 'cooldowns': {
        const next = args[0] ? args[0].toLowerCase() === 'on' : !this.config.zeroCooldowns;
        this.config.zeroCooldowns = next;
        soundManager.playSfx('crystal');
        result = {
          success: true,
          message: `Zero Cooldowns: ${next ? 'ENABLED' : 'DISABLED'}`,
          changedValue: next,
        };
        break;
      }

      case 'ai': {
        const next = args[0] ? args[0].toLowerCase() === 'off' : !this.config.disableEnemyAI;
        this.config.disableEnemyAI = next;
        soundManager.playSfx('click');
        result = {
          success: true,
          message: `Enemy AI: ${next ? 'FROZEN (Disabled)' : 'ACTIVE (Enabled)'}`,
          changedValue: next,
        };
        break;
      }

      case 'gold': {
        const amount = parseInt(args[0], 10);
        if (isNaN(amount)) {
          result = { success: false, message: 'Invalid gold amount. Usage: gold <number>' };
          break;
        }
        useGameStore.getState().updateExpAndGold(0, amount, 0);
        soundManager.playSfx('pickup');
        result = {
          success: true,
          message: `Gold modified by ${amount >= 0 ? '+' : ''}${amount}. Current: ${useGameStore.getState().gold}`,
          changedValue: useGameStore.getState().gold,
        };
        break;
      }

      case 'exp': {
        const amount = parseInt(args[0], 10);
        if (isNaN(amount) || amount <= 0) {
          result = { success: false, message: 'Invalid EXP amount. Usage: exp <positive number>' };
          break;
        }
        useGameStore.getState().updateExpAndGold(amount, 0, 0);
        soundManager.playSfx('levelup');
        result = {
          success: true,
          message: `Granted ${amount} EXP. Player is now Level ${useGameStore.getState().level}!`,
          changedValue: useGameStore.getState().level,
        };
        break;
      }

      case 'shards': {
        const amount = parseInt(args[0], 10);
        if (isNaN(amount)) {
          result = { success: false, message: 'Invalid Echo Shards amount. Usage: shards <number>' };
          break;
        }
        useGameStore.getState().updateExpAndGold(0, 0, amount);
        soundManager.playSfx('crystal');
        result = {
          success: true,
          message: `Echo Shards modified by ${amount >= 0 ? '+' : ''}${amount}. Current: ${useGameStore.getState().echoShards}`,
          changedValue: useGameStore.getState().echoShards,
        };
        break;
      }

      case 'heal': {
        const state = useGameStore.getState();
        state.setPlayerStats({
          hp: state.stats.maxHp,
          mp: state.stats.maxMp,
          sp: state.stats.maxSp,
        });
        soundManager.playSfx('potion');
        result = {
          success: true,
          message: `Kael fully restored: HP ${state.stats.maxHp}/${state.stats.maxHp}, MP ${state.stats.maxMp}/${state.stats.maxMp}, SP ${state.stats.maxSp}/${state.stats.maxSp}`,
        };
        break;
      }

      case 'spawn': {
        const itemId = args[0];
        const count = parseInt(args[1], 10) || 1;
        if (!itemId) {
          result = { success: false, message: 'Usage: spawn <itemId> [count]' };
          break;
        }
        const itemDef = ITEM_REGISTRY[itemId] || Object.values(ITEM_REGISTRY).find(i => i.id.toLowerCase() === itemId.toLowerCase());
        if (!itemDef) {
          result = { success: false, message: `Item definition not found: '${itemId}'. View Items tab for IDs.` };
          break;
        }
        const added = useGameStore.getState().addItemToInventory(itemDef.id, count);
        if (added) {
          soundManager.playSfx('pickup');
          result = {
            success: true,
            message: `Spawned ${count}x '${itemDef.nameEn}' into inventory.`,
            changedValue: itemDef.id,
          };
        } else {
          result = { success: false, message: 'Failed to spawn item: inventory is full (max 24 slots).' };
        }
        break;
      }

      case 'spawnegg': {
        const rarity = (args[0]?.toLowerCase() as PetRarity) || 'common';
        const species = args[1] as PetSpeciesId | undefined;
        const validRarities: PetRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        if (!validRarities.includes(rarity)) {
          result = { success: false, message: `Invalid rarity '${rarity}'. Choose: common, uncommon, rare, epic, legendary` };
          break;
        }
        useGameStore.getState().addEgg(rarity, species);
        soundManager.playSfx('pickup');
        result = {
          success: true,
          message: `Added ${rarity.toUpperCase()} pet egg to hatchery. Total eggs: ${useGameStore.getState().petEggs.length}`,
        };
        break;
      }

      case 'addpet': {
        const speciesId = args[0] as PetSpeciesId;
        if (!speciesId) {
          result = { success: false, message: 'Usage: addpet <speciesId> (e.g. baby_dragon, ember_fox, crystal_golem)' };
          break;
        }
        const newPet = useGameStore.getState().addPet(speciesId);
        soundManager.playSfx('victory');
        result = {
          success: true,
          message: `Unlocked companion pet: ${newPet.speciesId} (Lv. ${newPet.level})`,
          changedValue: newPet.id,
        };
        break;
      }

      case 'hatchall': {
        const state = useGameStore.getState();
        if (state.petEggs.length === 0) {
          result = { success: false, message: 'No eggs in hatchery to hatch.' };
          break;
        }
        const count = state.petEggs.length;
        const eggs = [...state.petEggs];
        eggs.forEach((e) => state.hatchEggAtSlot(e.id));
        soundManager.playSfx('victory');
        result = {
          success: true,
          message: `Instantly hatched ${count} egg(s)! New companions added to roster.`,
          changedValue: count,
        };
        break;
      }

      case 'feedpet': {
        const amount = parseInt(args[0], 10) || 500;
        const state = useGameStore.getState();
        if (!state.activePetId) {
          result = { success: false, message: 'No active pet equipped. Equip a pet first!' };
          break;
        }
        const success = state.feedPet(state.activePetId, amount);
        if (success) {
          soundManager.playSfx('levelup');
          result = {
            success: true,
            message: `Fed ${amount} EXP to active companion.`,
          };
        } else {
          result = { success: false, message: 'Failed to feed pet.' };
        }
        break;
      }

      case 'unlockskills': {
        const allSkillNodes = Object.values(ALL_SKILLS_36).map((s) => ({
          id: s.id,
          currentRank: s.maxRank,
        }));
        useGameStore.setState({ skills: allSkillNodes });
        soundManager.playSfx('levelup');
        result = {
          success: true,
          message: `All 36 skills unlocked at maximum rank across all 4 talent specializations!`,
          changedValue: 36,
        };
        break;
      }

      case 'tp': {
        const target = args[0]?.toLowerCase();
        const game = (window as any).Phaser?.GAMES?.[0];
        if (!game) {
          result = { success: false, message: 'Phaser game instance not ready.' };
          break;
        }
        if (target === 'village') {
          game.scene.start('WorldScene');
          result = { success: true, message: 'Teleported to Everlight Village.' };
        } else if (target === 'dungeon1' || target === 'dungeon') {
          game.scene.start('DungeonScene', { tier: 1 });
          result = { success: true, message: 'Teleported to Dungeon Tier 1.' };
        } else if (target === 'dungeon3' || target === 'boss') {
          game.scene.start('DungeonScene', { tier: 3 });
          result = { success: true, message: 'Teleported to Dungeon Tier 3 (Boss Chamber).' };
        } else {
          result = { success: false, message: `Unknown teleport target '${target}'. Choose: village, dungeon1, dungeon3` };
        }
        break;
      }

      case 'dps': {
        if (args[0] === 'reset') {
          this.resetStats();
          result = { success: true, message: 'Combat telemetry and DPS window reset to 0.' };
        } else {
          result = {
            success: true,
            message: `Current DPS (3s window): ${this.config.dps} | Total Damage Dealt: ${this.config.totalDamageDealt} | Log entries: ${this.config.combatLogs.length}`,
            changedValue: { dps: this.config.dps, total: this.config.totalDamageDealt },
          };
        }
        break;
      }

      case 'clear': {
        this.clearCommandHistory();
        result = { success: true, message: 'Console command history cleared.' };
        break;
      }

      default: {
        result = {
          success: false,
          message: `Unknown command: '${cmd}'. Type 'help' to see all available commands.`,
        };
        break;
      }
    }

    // Save entry to command history
    const entry: CommandHistoryEntry = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      command: input,
      timestamp: new Date().toLocaleTimeString(),
      result,
    };
    this.commandHistory.unshift(entry);

    return result;
  }
}

export const sandboxManager = new SandboxManager();
