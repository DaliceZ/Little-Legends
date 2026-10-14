import { db, DEFAULT_SETTINGS } from './database';
import { 
  PlayerSavedData, 
  ItemInstance, 
  QuestState, 
  GameSettings, 
  Achievement,
  PetInstance,
  PetEggInstance
} from '../shared/types';

export interface FullSaveExport {
  version: number;
  exportedAt: string;
  saveSlot: number;
  player: PlayerSavedData;
  inventory: ItemInstance[];
  quests: QuestState[];
  skills: { id: string; currentRank: number }[];
  pets?: PetInstance[];
  petEggs?: PetEggInstance[];
  achievements: Achievement[];
  settings: GameSettings;
}

export const saveService = {
  async getSettings(): Promise<GameSettings> {
    try {
      const setting = await db.settings.get('global');
      return setting ? setting : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Failed to load settings from DB:', e);
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: GameSettings): Promise<void> {
    await db.settings.put({ ...settings, id: 'global' });
  },

  async saveGame(
    slot: number,
    player: PlayerSavedData,
    inventory: ItemInstance[],
    quests: QuestState[],
    skills: { id: string; currentRank: number }[],
    pets: PetInstance[] = [],
    petEggs: PetEggInstance[] = []
  ): Promise<void> {
    await db.transaction('rw', [db.saves, db.inventory, db.quests, db.skills, db.pets, db.petEggs], async () => {
      // 1. Save player record
      await db.saves.put({
        ...player,
        id: slot,
        updatedAt: new Date().toISOString(),
      });

      // 2. Clear old slot inventory & put new
      await db.inventory.where('saveSlot').equals(slot).delete();
      if (inventory.length > 0) {
        await db.inventory.bulkPut(
          inventory.map((item) => ({ ...item, saveSlot: slot }))
        );
      }

      // 3. Clear old slot quests & put new
      await db.quests.where('saveSlot').equals(slot).delete();
      if (quests.length > 0) {
        await db.quests.bulkPut(
          quests.map((q) => ({ ...q, saveSlot: slot }))
        );
      }

      // 4. Clear old slot skills & put new
      await db.skills.where('saveSlot').equals(slot).delete();
      if (skills.length > 0) {
        await db.skills.bulkPut(
          skills.map((s) => ({ ...s, saveSlot: slot }))
        );
      }

      // 5. Clear old slot pets & put new
      await db.pets.where('saveSlot').equals(slot).delete();
      if (pets.length > 0) {
        await db.pets.bulkPut(
          pets.map((p) => ({ ...p, saveSlot: slot }))
        );
      }

      // 6. Clear old slot petEggs & put new
      await db.petEggs.where('saveSlot').equals(slot).delete();
      if (petEggs.length > 0) {
        await db.petEggs.bulkPut(
          petEggs.map((e) => ({ ...e, saveSlot: slot }))
        );
      }
    });
  },

  async loadGame(slot: number): Promise<{
    player: PlayerSavedData;
    inventory: ItemInstance[];
    quests: QuestState[];
    skills: { id: string; currentRank: number }[];
    pets: PetInstance[];
    petEggs: PetEggInstance[];
  } | null> {
    try {
      const player = await db.saves.get(slot);
      if (!player) return null;

      const rawInventory = await db.inventory.where('saveSlot').equals(slot).toArray();
      const inventory: ItemInstance[] = rawInventory.map(({ saveSlot, ...item }) => item);

      const rawQuests = await db.quests.where('saveSlot').equals(slot).toArray();
      const quests: QuestState[] = rawQuests.map(({ saveSlot, ...q }) => q);

      const rawSkills = await db.skills.where('saveSlot').equals(slot).toArray();
      const skills = rawSkills.map(({ saveSlot, ...s }) => s);

      const rawPets = await db.pets.where('saveSlot').equals(slot).toArray();
      const pets: PetInstance[] = rawPets.map(({ saveSlot, ...p }) => p);

      const rawEggs = await db.petEggs.where('saveSlot').equals(slot).toArray();
      const petEggs: PetEggInstance[] = rawEggs.map(({ saveSlot, ...e }) => e);

      return { player, inventory, quests, skills, pets, petEggs };
    } catch (err) {
      console.error('Failed to load save from slot', slot, err);
      return null;
    }
  },

  async hasSave(slot: number = 1): Promise<boolean> {
    const count = await db.saves.where('id').equals(slot).count();
    return count > 0;
  },

  async exportSaveToJson(slot: number = 1): Promise<string | null> {
    const data = await this.loadGame(slot);
    if (!data) return null;

    const settings = await this.getSettings();
    const achievements = await db.achievements.toArray();

    const exportBundle: FullSaveExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      saveSlot: slot,
      player: data.player,
      inventory: data.inventory,
      quests: data.quests,
      skills: data.skills,
      pets: data.pets,
      petEggs: data.petEggs,
      achievements,
      settings,
    };

    return JSON.stringify(exportBundle, null, 2);
  },

  async importSaveFromJson(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString) as FullSaveExport;
      if (!parsed || typeof parsed !== 'object' || !parsed.player) {
        throw new Error('Invalid save structure');
      }

      const slot = parsed.saveSlot || 1;
      await this.saveGame(
        slot,
        parsed.player,
        parsed.inventory || [],
        parsed.quests || [],
        parsed.skills || [],
        parsed.pets || [],
        parsed.petEggs || []
      );

      if (parsed.settings) {
        await this.saveSettings(parsed.settings);
      }

      return true;
    } catch (e) {
      console.error('Failed to import save:', e);
      return false;
    }
  },

  async clearSlot(slot: number = 1): Promise<void> {
    await db.transaction('rw', [db.saves, db.inventory, db.quests, db.skills, db.pets, db.petEggs], async () => {
      await db.saves.delete(slot);
      await db.inventory.where('saveSlot').equals(slot).delete();
      await db.quests.where('saveSlot').equals(slot).delete();
      await db.skills.where('saveSlot').equals(slot).delete();
      await db.pets.where('saveSlot').equals(slot).delete();
      await db.petEggs.where('saveSlot').equals(slot).delete();
    });
  },
};
