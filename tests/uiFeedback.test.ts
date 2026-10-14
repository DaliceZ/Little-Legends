import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../src/app/store/useGameStore';
import { sandboxManager } from '../src/features/sandbox/sandboxManager';
import { saveService } from '../src/persistence/saveService';
import { db } from '../src/persistence/database';
import { createPetInstance } from '../src/features/pets/petRegistry';
import { EggDropManager } from '../src/features/pets/eggDropManager';

describe('UI Feedback & Centralized Notifications', () => {
  beforeEach(() => {
    useGameStore.setState({
      notifications: [],
      gold: 100,
      exp: 0,
      level: 1,
      stats: {
        hp: 50,
        maxHp: 120,
        mp: 10,
        maxMp: 50,
        sp: 20,
        maxSp: 100,
        attack: 16,
        defense: 8,
        critChance: 0.1,
        critDamage: 1.5,
        speed: 160,
      },
    });
    sandboxManager.clearCommandHistory();
    (vi.spyOn(saveService, 'saveSettings') as any).mockResolvedValue(undefined);
  });

  it('adds notifications with type and valueDelta', () => {
    const store = useGameStore.getState();
    store.showNotification('QUEST COMPLETE', 'Defeated goblins in the grove', 'success', '+200 Gold');

    const notifs = useGameStore.getState().notifications;
    expect(notifs.length).toBe(1);
    expect(notifs[0].title).toBe('QUEST COMPLETE');
    expect(notifs[0].message).toBe('Defeated goblins in the grove');
    expect(notifs[0].type).toBe('success');
    expect(notifs[0].valueDelta).toBe('+200 Gold');
    expect(notifs[0].timestamp).toBeDefined();
  });

  it('throttles duplicate notifications within 1200ms', () => {
    const store = useGameStore.getState();
    store.showNotification('INVENTORY FULL', 'Cannot pick up item', 'warning');
    // Immediate identical call
    store.showNotification('INVENTORY FULL', 'Cannot pick up item', 'warning');
    store.showNotification('INVENTORY FULL', 'Cannot pick up item', 'warning');

    const notifs = useGameStore.getState().notifications;
    expect(notifs.length).toBe(1);

    // Different notification should not be throttled
    store.showNotification('LEVEL UP', 'Reached level 2', 'success');
    expect(useGameStore.getState().notifications.length).toBe(2);
  });

  it('removes notification by id', () => {
    const store = useGameStore.getState();
    store.showNotification('NOTICE', 'A temporary notice', 'info');
    const id = useGameStore.getState().notifications[0].id;

    store.removeNotification(id);
    expect(useGameStore.getState().notifications.length).toBe(0);
  });
});

describe('Sandbox Console 3.0 Command Registry', () => {
  beforeEach(() => {
    sandboxManager.clearCommandHistory();
    useGameStore.setState({ gold: 50, exp: 0, level: 1 });
  });

  it('executes help command returning available commands', () => {
    const res = sandboxManager.executeCommand('help');
    expect(res.success).toBe(true);
    expect(res.message).toContain('Available Sandbox Commands:');
    expect(res.message).toContain('godmode');
    expect(res.message).toContain('gold');
  });

  it('modifies godmode via command', () => {
    const res = sandboxManager.executeCommand('godmode on');
    expect(res.success).toBe(true);
    expect(res.changedValue).toBe(true);
    expect(sandboxManager.getConfig().godMode).toBe(true);

    const toggleRes = sandboxManager.executeCommand('godmode off');
    expect(toggleRes.success).toBe(true);
    expect(toggleRes.changedValue).toBe(false);
    expect(sandboxManager.getConfig().godMode).toBe(false);
  });

  it('modifies player gold and reflects in store', () => {
    const res = sandboxManager.executeCommand('gold 250');
    expect(res.success).toBe(true);
    expect(useGameStore.getState().gold).toBe(300);
  });

  it('executes heal command restoring vitals', () => {
    useGameStore.setState({
      stats: {
        hp: 10,
        maxHp: 120,
        mp: 5,
        maxMp: 60,
        sp: 15,
        maxSp: 100,
        attack: 16,
        defense: 8,
        critChance: 0.1,
        critDamage: 1.5,
        speed: 160,
      },
    });

    const res = sandboxManager.executeCommand('heal');
    expect(res.success).toBe(true);
    expect(useGameStore.getState().stats.hp).toBe(120);
    expect(useGameStore.getState().stats.mp).toBe(60);
    expect(useGameStore.getState().stats.sp).toBe(100);
  });

  it('handles invalid commands gracefully with error feedback', () => {
    const res = sandboxManager.executeCommand('invalid_command_xyz');
    expect(res.success).toBe(false);
    expect(res.message).toContain("Unknown command: 'invalid_command_xyz'");
  });

  it('logs command executions in command history', () => {
    sandboxManager.executeCommand('gold 100');
    sandboxManager.executeCommand('heal');

    const history = sandboxManager.getCommandHistory();
    expect(history.length).toBe(2);
    expect(history[0].command).toBe('heal');
    expect(history[1].command).toBe('gold 100');
  });
});

describe('Save Service Pet & Egg Persistence', () => {
  it('saves and restores pets and eggs with full fidelity', async () => {
    const memoryStore: {
      saves: any[];
      inventory: any[];
      quests: any[];
      skills: any[];
      pets: any[];
      petEggs: any[];
    } = {
      saves: [],
      inventory: [],
      quests: [],
      skills: [],
      pets: [],
      petEggs: [],
    };

    (vi.spyOn(db, 'transaction') as any).mockImplementation(async (_mode: any, _tables: any, callback: any) => {
      return callback();
    });

    (vi.spyOn(db.saves, 'put') as any).mockImplementation(async (data: any) => {
      memoryStore.saves = [data];
      return data.id;
    });
    (vi.spyOn(db.saves, 'get') as any).mockImplementation(async (slot: any) => {
      return memoryStore.saves.find((s) => s.id === slot) || null;
    });

    (vi.spyOn(db.inventory, 'where') as any).mockImplementation((_field: any) => ({
      equals: (_val: any) => ({
        delete: async () => { memoryStore.inventory = []; },
        toArray: async () => memoryStore.inventory,
      }),
    }));
    (vi.spyOn(db.inventory, 'bulkPut') as any).mockImplementation(async (items: any) => {
      memoryStore.inventory.push(...items);
      return items.map((i: any) => i.instanceId);
    });

    (vi.spyOn(db.quests, 'where') as any).mockImplementation((_field: any) => ({
      equals: (_val: any) => ({
        delete: async () => { memoryStore.quests = []; },
        toArray: async () => memoryStore.quests,
      }),
    }));
    (vi.spyOn(db.quests, 'bulkPut') as any).mockImplementation(async (items: any) => {
      memoryStore.quests.push(...items);
      return items.map((i: any) => i.questId);
    });

    (vi.spyOn(db.skills, 'where') as any).mockImplementation((_field: any) => ({
      equals: (_val: any) => ({
        delete: async () => { memoryStore.skills = []; },
        toArray: async () => memoryStore.skills,
      }),
    }));
    (vi.spyOn(db.skills, 'bulkPut') as any).mockImplementation(async (items: any) => {
      memoryStore.skills.push(...items);
      return items.map((i: any) => i.id);
    });

    (vi.spyOn(db.pets, 'where') as any).mockImplementation((_field: any) => ({
      equals: (_val: any) => ({
        delete: async () => { memoryStore.pets = []; },
        toArray: async () => memoryStore.pets,
      }),
    }));
    (vi.spyOn(db.pets, 'bulkPut') as any).mockImplementation(async (items: any) => {
      memoryStore.pets.push(...items);
      return items.map((i: any) => i.id);
    });

    (vi.spyOn(db.petEggs, 'where') as any).mockImplementation((_field: any) => ({
      equals: (_val: any) => ({
        delete: async () => { memoryStore.petEggs = []; },
        toArray: async () => memoryStore.petEggs,
      }),
    }));
    (vi.spyOn(db.petEggs, 'bulkPut') as any).mockImplementation(async (items: any) => {
      memoryStore.petEggs.push(...items);
      return items.map((i: any) => i.id);
    });

    const pet1 = createPetInstance('baby_dragon', 'Draco');
    const egg1 = EggDropManager.createEggInstance('legendary', 'baby_dragon');

    const testSlot = 1;
    await saveService.saveGame(
      testSlot,
      {
        id: testSlot,
        name: 'Kael',
        level: 5,
        exp: 200,
        gold: 1500,
        echoShards: 3,
        currentHp: 120,
        maxHp: 120,
        currentMp: 50,
        maxMp: 50,
        currentSp: 100,
        maxSp: 100,
        specialization: 'blade_dancer',
        currentRegion: 'village',
        positionX: 480,
        positionY: 320,
        updatedAt: new Date().toISOString(),
      },
      [],
      [],
      [],
      [pet1],
      [egg1]
    );

    const loaded = await saveService.loadGame(testSlot);
    expect(loaded).not.toBeNull();
    expect(loaded?.pets.length).toBe(1);
    expect(loaded?.pets[0].speciesId).toBe('baby_dragon');
    expect(loaded?.pets[0].nickname).toBe('Draco');
    expect(loaded?.petEggs.length).toBe(1);
    expect(loaded?.petEggs[0].rarity).toBe('legendary');
  });

  it('updates settings for graphics quality, screen shake, and reduced motion', () => {
    const store = useGameStore.getState();
    store.setSettings({
      graphicsQuality: 'medium',
      screenShake: false,
      reducedMotion: true,
    });

    const updated = useGameStore.getState().settings;
    expect(updated.graphicsQuality).toBe('medium');
    expect(updated.screenShake).toBe(false);
    expect(updated.reducedMotion).toBe(true);
  });
});
