import { create } from 'zustand';
import { 
  CharacterStats, 
  ItemInstance, 
  QuestState, 
  Specialization, 
  GameSettings,
  PetInstance,
  PetEggInstance,
  PetSpeciesId,
  PetRarity
} from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../persistence/database';
import { saveService } from '../../persistence/saveService';
import { InventoryManager } from '../../features/inventory/inventoryManager';
import { getItemDefinition } from '../../features/items/itemRegistry';
import { getQuestDefinition } from '../../features/quests/questRegistry';
import { CRAFTING_RECIPES } from '../../features/crafting/craftingRegistry';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { createPetInstance, calculateRequiredPetExp } from '../../features/pets/petRegistry';
import { EggDropManager } from '../../features/pets/eggDropManager';
import { skillCastingEngine } from '../../features/combat/SkillCastingEngine';

export type ActiveModal = 
  | 'none' 
  | 'inventory' 
  | 'character' 
  | 'skills' 
  | 'quests' 
  | 'shop' 
  | 'crafting' 
  | 'settings' 
  | 'gameover' 
  | 'pause'
  | 'sandbox'
  | 'map'
  | 'pets'
  | 'hatchery';

export interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'loot';
}

interface GameState {
  activeModal: ActiveModal;
  currentDialogue: { npcId: string; nodeId: string } | null;
  notifications: NotificationToast[];
  currentZone: 'village' | 'forest' | 'dungeon';
  dungeonTier: number;
  isSandbox: boolean;
  hotbar: string[];
  kaelPortrait: string;
  
  // Player Progression
  level: number;
  exp: number;
  gold: number;
  echoShards: number;
  specialization: Specialization;
  stats: CharacterStats;
  equippedWeapon?: ItemInstance;
  equippedArmor?: ItemInstance;
  equippedAccessory?: ItemInstance;
  inventory: ItemInstance[];
  quests: QuestState[];
  skills: { id: string; currentRank: number }[];
  settings: GameSettings;
  pets: PetInstance[];
  petEggs: PetEggInstance[];
  activePetId: string | null;

  // Actions
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  setDialogue: (dialogue: { npcId: string; nodeId: string } | null) => void;
  closeDialogue: () => void;
  showNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'loot') => void;
  removeNotification: (id: string) => void;
  setZone: (zone: 'village' | 'forest' | 'dungeon', tier?: number) => void;
  setIsSandbox: (isSandbox: boolean) => void;
  setKaelPortrait: (url: string) => void;
  setHotbarSkill: (slotIndex: number, skillId: string) => void;

  addPet: (speciesId: PetSpeciesId, nickname?: string) => PetInstance;
  setActivePet: (petId: string | null) => void;
  addEgg: (rarity: PetRarity, speciesId?: PetSpeciesId) => void;
  hatchEggAtSlot: (eggId: string) => PetInstance | null;
  feedPet: (petId: string, expAmount: number) => boolean;
  renamePet: (petId: string, newName: string) => void;

  setPlayerStats: (stats: Partial<CharacterStats>) => void;
  setQuests: (quests: QuestState[]) => void;
  updateExpAndGold: (expDelta: number, goldDelta: number, echoShardDelta?: number) => void;
  equipItem: (instanceId: string) => void;
  unequipItem: (slot: 'weapon' | 'armor' | 'accessory') => void;
  useConsumable: (instanceId: string) => void;
  addItemToInventory: (defId: string, quantity?: number) => boolean;
  removeItemFromInventory: (instanceId: string, quantity?: number) => void;

  acceptQuest: (questId: string) => void;
  claimQuestReward: (questId: string) => void;
  craftRecipe: (recipeId: string) => boolean;
  buyItem: (defId: string) => boolean;
  sellItem: (instanceId: string) => void;
  upgradeSkill: (skillId: string) => void;

  setSettings: (settings: Partial<GameSettings>) => void;
  saveCurrentGame: () => Promise<void>;
  loadSavedGame: () => Promise<boolean>;
  resetToNewGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  activeModal: 'none',
  currentDialogue: null,
  notifications: [],
  currentZone: 'village',
  dungeonTier: 1,
  isSandbox: false,
  hotbar: [
    'skill_bd_quick_slash',
    'skill_bd_crescent',
    'skill_bd_dash_strike',
    'skill_bd_blade_storm',
    'skill_bd_phantom_cut',
    'skill_bd_ultimate',
  ],
  kaelPortrait: '',

  level: 1,
  exp: 0,
  gold: 50,
  echoShards: 1,
  specialization: 'blade_dancer',

  stats: {
    hp: 120,
    maxHp: 120,
    mp: 50,
    maxMp: 50,
    sp: 100,
    maxSp: 100,
    attack: 16,
    defense: 8,
    critChance: 0.1,
    critDamage: 1.5,
    speed: 160,
  },

  equippedWeapon: InventoryManager.createItemInstance('item_worn_sword') || undefined,
  equippedArmor: InventoryManager.createItemInstance('item_wanderer_jacket') || undefined,
  equippedAccessory: InventoryManager.createItemInstance('item_echo_pendant') || undefined,

  inventory: [
    InventoryManager.createItemInstance('item_health_potion', 3)!,
    InventoryManager.createItemInstance('item_mana_potion', 2)!,
  ].filter(Boolean) as ItemInstance[],

  quests: [
    {
      questId: 'quest_cleansing_forest',
      status: 'active',
      objectives: [
        { id: 'obj_slimes', currentCount: 0 },
        { id: 'obj_bats', currentCount: 0 },
      ],
    },
  ],

  skills: [
    { id: 'skill_whirlwind', currentRank: 1 },
    { id: 'skill_fleetfoot', currentRank: 0 },
  ],

  settings: DEFAULT_SETTINGS,
  pets: [],
  petEggs: [
    EggDropManager.createEggInstance('common', 'forest_slime'),
  ],
  activePetId: null,

  openModal: (modal) => {
    soundManager.playSfx('click');
    skillCastingEngine.cancelCurrentCast('Menu opened');
    set({ activeModal: modal });
  },

  closeModal: () => {
    soundManager.playSfx('click');
    set({ activeModal: 'none' });
  },

  setDialogue: (dialogue) => {
    if (dialogue) {
      skillCastingEngine.cancelCurrentCast('Dialogue opened');
    }
    set({ currentDialogue: dialogue });
  },

  closeDialogue: () => {
    soundManager.playSfx('click');
    set({ currentDialogue: null });
  },

  addPet: (speciesId, nickname) => {
    const newPet = createPetInstance(speciesId, nickname);
    set((state) => ({
      pets: [...state.pets, newPet],
      activePetId: state.activePetId ? state.activePetId : newPet.id,
    }));
    return newPet;
  },

  setActivePet: (petId) => {
    soundManager.playSfx('click');
    set((state) => ({
      pets: state.pets.map((p) => ({ ...p, isActive: p.id === petId })),
      activePetId: petId,
    }));
  },

  addEgg: (rarity, speciesId) => {
    const egg = EggDropManager.createEggInstance(rarity, speciesId);
    set((state) => ({
      petEggs: [...state.petEggs, egg],
    }));
    get().showNotification('PET EGG DISCOVERED!', `Found a ${rarity.toUpperCase()} pet egg!`, 'loot');
  },

  hatchEggAtSlot: (eggId) => {
    const egg = get().petEggs.find((e) => e.id === eggId);
    if (!egg) return null;

    const speciesId = EggDropManager.hatchEgg(egg);
    const newPet = createPetInstance(speciesId);

    set((state) => ({
      petEggs: state.petEggs.filter((e) => e.id !== eggId),
      pets: [...state.pets, newPet],
      activePetId: state.activePetId ? state.activePetId : newPet.id,
    }));

    soundManager.playSfx('victory');
    return newPet;
  },

  feedPet: (petId, expAmount) => {
    const pet = get().pets.find((p) => p.id === petId);
    if (!pet) return false;

    let newExp = pet.exp + expAmount;
    let newLevel = pet.level;
    let newMaxExp = pet.maxExp;

    while (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = calculateRequiredPetExp(newLevel);
    }

    set((state) => ({
      pets: state.pets.map((p) =>
        p.id === petId
          ? { ...p, level: newLevel, exp: newExp, maxExp: newMaxExp }
          : p
      ),
    }));

    soundManager.playSfx('pickup');
    return true;
  },

  renamePet: (petId, newName) => {
    set((state) => ({
      pets: state.pets.map((p) => (p.id === petId ? { ...p, nickname: newName } : p)),
    }));
  },

  showNotification: (title, message, type = 'info') => {
    const id = `notif_${Date.now()}_${Math.random()}`;
    set((state) => ({
      notifications: [...state.notifications.slice(-4), { id, title, message, type }],
    }));
    setTimeout(() => {
      get().removeNotification(id);
    }, 3500);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  setZone: (zone, tier = 1) => {
    set({ currentZone: zone, dungeonTier: tier });
    if (zone === 'village') {
      soundManager.playMusic('village');
    } else {
      soundManager.playMusic('dungeon');
    }
  },

  setIsSandbox: (isSandbox) => {
    set({ isSandbox });
  },

  setKaelPortrait: (url) => {
    set({ kaelPortrait: url });
  },

  setHotbarSkill: (slotIndex, skillId) => {
    const cur = [...get().hotbar];
    if (slotIndex >= 0 && slotIndex < cur.length) {
      cur[slotIndex] = skillId;
      set({ hotbar: cur });
    }
  },

  setPlayerStats: (stats) => {
    set((state) => ({ stats: { ...state.stats, ...stats } }));
  },

  setQuests: (quests) => {
    set({ quests });
  },

  updateExpAndGold: (expDelta, goldDelta, echoShardDelta = 0) => {
    const state = get();
    let nextExp = state.exp + expDelta;
    let nextLevel = state.level;
    let nextStats = { ...state.stats };

    let neededExp = Math.floor(100 * Math.pow(nextLevel, 1.45));
    while (nextExp >= neededExp) {
      nextExp -= neededExp;
      nextLevel += 1;
      nextStats.maxHp += 20;
      nextStats.hp = nextStats.maxHp;
      nextStats.maxMp += 10;
      nextStats.mp = nextStats.maxMp;
      nextStats.attack += 3;
      nextStats.defense += 2;
      soundManager.playSfx('levelup');
      get().showNotification(
        'LEVEL UP!',
        `Kael reached Level ${nextLevel}! Attributes enhanced.`,
        'success'
      );
      neededExp = Math.floor(100 * Math.pow(nextLevel, 1.45));
    }

    set({
      exp: nextExp,
      level: nextLevel,
      gold: Math.max(0, state.gold + goldDelta),
      echoShards: Math.max(0, state.echoShards + echoShardDelta),
      stats: nextStats,
    });
  },

  equipItem: (instanceId) => {
    const state = get();
    const item = state.inventory.find((i) => i.instanceId === instanceId);
    if (!item) return;

    const def = getItemDefinition(item.defId);
    if (!def) return;

    soundManager.playSfx('click');
    let prevEquipped: ItemInstance | undefined;

    let newWeapon = state.equippedWeapon;
    let newArmor = state.equippedArmor;
    let newAccessory = state.equippedAccessory;

    if (def.type === 'weapon') {
      prevEquipped = state.equippedWeapon;
      newWeapon = item;
    } else if (def.type === 'armor') {
      prevEquipped = state.equippedArmor;
      newArmor = item;
    } else if (def.type === 'accessory') {
      prevEquipped = state.equippedAccessory;
      newAccessory = item;
    }

    // Remove item from inventory, return previously equipped item to inventory
    let nextInv = state.inventory.filter((i) => i.instanceId !== instanceId);
    if (prevEquipped) {
      nextInv.push(prevEquipped);
    }

    set({
      inventory: nextInv,
      equippedWeapon: newWeapon,
      equippedArmor: newArmor,
      equippedAccessory: newAccessory,
    });

    get().showNotification(
      'EQUIPPED',
      `Equipped ${def.nameEn}.`,
      'info'
    );
  },

  unequipItem: (slot) => {
    const state = get();
    let unequipped: ItemInstance | undefined;
    let newWeapon = state.equippedWeapon;
    let newArmor = state.equippedArmor;
    let newAccessory = state.equippedAccessory;

    if (slot === 'weapon' && state.equippedWeapon) {
      unequipped = state.equippedWeapon;
      newWeapon = undefined;
    } else if (slot === 'armor' && state.equippedArmor) {
      unequipped = state.equippedArmor;
      newArmor = undefined;
    } else if (slot === 'accessory' && state.equippedAccessory) {
      unequipped = state.equippedAccessory;
      newAccessory = undefined;
    }

    if (!unequipped) return;

    const addResult = InventoryManager.addItem(state.inventory, unequipped);
    if (addResult.success) {
      soundManager.playSfx('click');
      set({
        inventory: addResult.updatedInventory,
        equippedWeapon: newWeapon,
        equippedArmor: newArmor,
        equippedAccessory: newAccessory,
      });
    } else {
      get().showNotification('INVENTORY FULL', 'Cannot unequip item.', 'warning');
    }
  },

  useConsumable: (instanceId) => {
    const state = get();
    const item = state.inventory.find((i) => i.instanceId === instanceId);
    if (!item) return;

    const def = getItemDefinition(item.defId);
    if (!def || def.type !== 'consumable') return;

    soundManager.playSfx('potion');

    // Heal effect
    const nextStats = { ...state.stats };
    if (def.id === 'item_health_potion') {
      const heal = def.effectValue || 50;
      nextStats.hp = Math.min(nextStats.maxHp, nextStats.hp + heal);
      get().showNotification('RESTORED', `Recovered ${heal} HP.`, 'success');
    } else if (def.id === 'item_mana_potion') {
      const mana = def.effectValue || 35;
      nextStats.mp = Math.min(nextStats.maxMp, nextStats.mp + mana);
      get().showNotification('RESTORED', `Recovered ${mana} MP.`, 'success');
    }

    const { updatedInventory } = InventoryManager.removeItem(state.inventory, instanceId, 1);
    set({
      stats: nextStats,
      inventory: updatedInventory,
    });
  },

  addItemToInventory: (defId, quantity = 1) => {
    const state = get();
    const item = InventoryManager.createItemInstance(defId, quantity);
    if (!item) return false;

    const result = InventoryManager.addItem(state.inventory, item);
    if (result.success) {
      soundManager.playSfx('pickup');
      const def = getItemDefinition(defId);
      get().showNotification(
        'LOOT OBTAINED',
        `+${quantity} ${def ? def.nameEn : defId}`,
        'loot'
      );
      set({ inventory: result.updatedInventory });
      return true;
    } else {
      get().showNotification('BAG FULL', 'Inventory is completely full!', 'warning');
      return false;
    }
  },

  removeItemFromInventory: (instanceId, quantity = 1) => {
    const state = get();
    const { updatedInventory } = InventoryManager.removeItem(state.inventory, instanceId, quantity);
    set({ inventory: updatedInventory });
  },

  acceptQuest: (questId) => {
    const state = get();
    const existing = state.quests.find((q) => q.questId === questId);
    if (existing) return;

    const def = getQuestDefinition(questId);
    if (!def) return;

    const newQuest: QuestState = {
      questId,
      status: 'active',
      objectives: def.objectives.map((o) => ({ id: o.id, currentCount: 0 })),
    };

    soundManager.playSfx('quest');
    set({ quests: [...state.quests, newQuest] });
    get().showNotification('NEW QUEST', def.titleEn, 'info');
  },

  claimQuestReward: (questId) => {
    const state = get();
    const qIndex = state.quests.findIndex((q) => q.questId === questId);
    if (qIndex === -1) return;

    const quest = state.quests[qIndex];
    if (quest.status !== 'completed') return;

    const def = getQuestDefinition(questId);
    if (!def) return;

    soundManager.playSfx('quest');

    // Grant rewards
    get().updateExpAndGold(def.rewards.exp, def.rewards.gold, def.rewards.echoShards);
    if (def.rewards.items) {
      for (const item of def.rewards.items) {
        get().addItemToInventory(item.defId, item.quantity);
      }
    }

    const nextQuests = [...state.quests];
    nextQuests[qIndex] = { ...quest, status: 'reward_claimed' };
    set({ quests: nextQuests });

    get().showNotification(
      'QUEST COMPLETED!',
      `Claimed: +${def.rewards.exp} EXP, +${def.rewards.gold} Gold!`,
      'success'
    );
  },

  craftRecipe: (recipeId) => {
    const state = get();
    const recipe = CRAFTING_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;

    // Check gold & echo shards
    if (state.gold < recipe.goldCost || state.echoShards < recipe.echoShardCost) {
      get().showNotification('INSUFFICIENT FUNDS', 'Not enough gold or echo shards.', 'warning');
      return false;
    }

    // Check materials
    for (const mat of recipe.materials) {
      const owned = state.inventory
        .filter((i) => i.defId === mat.defId)
        .reduce((sum, i) => sum + i.quantity, 0);
      if (owned < mat.quantity) {
        get().showNotification('MISSING MATERIALS', 'Not enough crafting ingredients.', 'warning');
        return false;
      }
    }

    // Deduct materials
    let curInv = [...state.inventory];
    for (const mat of recipe.materials) {
      let needed = mat.quantity;
      const matching = curInv.filter((i) => i.defId === mat.defId);
      for (const item of matching) {
        if (needed <= 0) break;
        if (item.quantity <= needed) {
          needed -= item.quantity;
          curInv = curInv.filter((i) => i.instanceId !== item.instanceId);
        } else {
          item.quantity -= needed;
          needed = 0;
        }
      }
    }

    // Add result item
    const craftedItem = InventoryManager.createItemInstance(recipe.resultDefId, recipe.resultQuantity);
    if (!craftedItem) return false;

    const addRes = InventoryManager.addItem(curInv, craftedItem);
    if (!addRes.success) {
      get().showNotification('INVENTORY FULL', 'Cannot fit crafted item.', 'warning');
      return false;
    }

    soundManager.playSfx('levelup');
    set({
      gold: state.gold - recipe.goldCost,
      echoShards: state.echoShards - recipe.echoShardCost,
      inventory: addRes.updatedInventory,
    });

    get().showNotification('CRAFTED SUCCESS', `Forged ${recipe.nameEn}!`, 'success');
    return true;
  },

  buyItem: (defId) => {
    const state = get();
    const def = getItemDefinition(defId);
    if (!def) return false;

    if (state.gold < def.buyPrice) {
      get().showNotification('CANNOT AFFORD', 'You do not have enough gold.', 'warning');
      return false;
    }

    const bought = InventoryManager.createItemInstance(defId, 1);
    if (!bought) return false;

    const addRes = InventoryManager.addItem(state.inventory, bought);
    if (!addRes.success) {
      get().showNotification('INVENTORY FULL', 'No free space in inventory.', 'warning');
      return false;
    }

    soundManager.playSfx('pickup');
    set({
      gold: state.gold - def.buyPrice,
      inventory: addRes.updatedInventory,
    });

    get().showNotification('PURCHASED', `Bought ${def.nameEn} for ${def.buyPrice} gold.`, 'info');
    return true;
  },

  sellItem: (instanceId) => {
    const state = get();
    const item = state.inventory.find((i) => i.instanceId === instanceId);
    if (!item) return;

    const def = getItemDefinition(item.defId);
    if (!def) return;

    const gain = def.sellPrice * item.quantity;
    const { updatedInventory } = InventoryManager.removeItem(state.inventory, instanceId, item.quantity);

    soundManager.playSfx('pickup');
    set({
      gold: state.gold + gain,
      inventory: updatedInventory,
    });

    get().showNotification('SOLD', `Sold ${def.nameEn} for +${gain} gold.`, 'info');
  },

  upgradeSkill: (skillId) => {
    const state = get();
    const skillIdx = state.skills.findIndex((s) => s.id === skillId);
    if (skillIdx === -1) return;

    soundManager.playSfx('levelup');
    const nextSkills = [...state.skills];
    nextSkills[skillIdx].currentRank += 1;
    set({ skills: nextSkills });
    get().showNotification('SKILL UPGRADED', 'Skill Rank Increased!', 'success');
  },

  setSettings: (partial) => {
    const nextSettings = { ...get().settings, ...partial };
    set({ settings: nextSettings });
    soundManager.setVolumes(nextSettings.masterVolume, nextSettings.sfxVolume, nextSettings.musicVolume);
    saveService.saveSettings(nextSettings);
  },

  saveCurrentGame: async () => {
    const state = get();
    await saveService.saveGame(
      1,
      {
        name: 'Kael',
        level: state.level,
        exp: state.exp,
        gold: state.gold,
        echoShards: state.echoShards,
        currentHp: state.stats.hp,
        maxHp: state.stats.maxHp,
        currentMp: state.stats.mp,
        maxMp: state.stats.maxMp,
        currentSp: state.stats.sp,
        maxSp: state.stats.maxSp,
        specialization: state.specialization,
        equippedWeapon: state.equippedWeapon,
        equippedArmor: state.equippedArmor,
        equippedAccessory: state.equippedAccessory,
        currentRegion: state.currentZone,
        positionX: 480,
        positionY: 320,
        updatedAt: new Date().toISOString(),
      },
      state.inventory,
      state.quests,
      state.skills
    );
    soundManager.playSfx('crystal');
    get().showNotification('SAVED', 'Game progress saved to browser storage!', 'success');
  },

  loadSavedGame: async () => {
    const data = await saveService.loadGame(1);
    if (!data) return false;

    set({
      level: data.player.level,
      exp: data.player.exp,
      gold: data.player.gold,
      echoShards: data.player.echoShards,
      specialization: data.player.specialization,
      equippedWeapon: data.player.equippedWeapon,
      equippedArmor: data.player.equippedArmor,
      equippedAccessory: data.player.equippedAccessory,
      inventory: data.inventory,
      quests: data.quests,
      skills: data.skills,
      stats: {
        ...get().stats,
        hp: data.player.currentHp,
        maxHp: data.player.maxHp,
        mp: data.player.currentMp,
        maxMp: data.player.maxMp,
        sp: data.player.currentSp,
        maxSp: data.player.maxSp,
      },
    });

    get().showNotification('LOADED', 'Game progress restored!', 'success');
    return true;
  },

  resetToNewGame: () => {
    set({
      level: 1,
      exp: 0,
      gold: 60,
      echoShards: 1,
      stats: {
        hp: 120,
        maxHp: 120,
        mp: 50,
        maxMp: 50,
        sp: 100,
        maxSp: 100,
        attack: 16,
        defense: 8,
        critChance: 0.1,
        critDamage: 1.5,
        speed: 160,
      },
      equippedWeapon: InventoryManager.createItemInstance('item_worn_sword') || undefined,
      equippedArmor: InventoryManager.createItemInstance('item_wanderer_jacket') || undefined,
      equippedAccessory: InventoryManager.createItemInstance('item_echo_pendant') || undefined,
      inventory: [
        InventoryManager.createItemInstance('item_health_potion', 3)!,
        InventoryManager.createItemInstance('item_mana_potion', 2)!,
      ],
      quests: [
        {
          questId: 'quest_cleansing_forest',
          status: 'active',
          objectives: [
            { id: 'obj_slimes', currentCount: 0 },
            { id: 'obj_bats', currentCount: 0 },
          ],
        },
      ],
      activeModal: 'none',
      currentDialogue: null,
    });
  },
}));
