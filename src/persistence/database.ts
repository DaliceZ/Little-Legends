import Dexie, { type Table } from 'dexie';
import { 
  PlayerSavedData, 
  ItemInstance, 
  QuestState, 
  GameSettings, 
  Achievement,
  PetInstance,
  PetEggInstance
} from '../shared/types';

export class LittleLegendsDatabase extends Dexie {
  saves!: Table<PlayerSavedData, number>;
  inventory!: Table<ItemInstance & { saveSlot: number }, string>;
  quests!: Table<QuestState & { saveSlot: number }, string>;
  skills!: Table<{ id: string; currentRank: number; saveSlot: number }, string>;
  achievements!: Table<Achievement, string>;
  settings!: Table<GameSettings & { id: string }, string>;
  pets!: Table<PetInstance & { saveSlot: number }, string>;
  petEggs!: Table<PetEggInstance & { saveSlot: number }, string>;

  constructor() {
    super('LittleLegendsDB');
    this.version(1).stores({
      saves: '++id, updatedAt, level',
      inventory: 'instanceId, saveSlot, defId, rarity',
      quests: '[questId+saveSlot], saveSlot, status',
      skills: '[id+saveSlot], saveSlot',
      achievements: 'id, unlocked',
      settings: 'id',
    });
    this.version(2).stores({
      pets: 'id, saveSlot, speciesId, isActive',
      petEggs: 'id, saveSlot, rarity',
    });
  }
}

export const db = new LittleLegendsDatabase();

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'en',
  masterVolume: 0.8,
  sfxVolume: 0.8,
  musicVolume: 0.6,
  screenShake: true,
  reducedMotion: false,
  graphicsQuality: 'high',
};
