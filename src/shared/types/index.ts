export type Language = 'en' | 'th';

export type StatType = 
  | 'hp' 
  | 'maxHp' 
  | 'mp' 
  | 'maxMp' 
  | 'sp' 
  | 'maxSp' 
  | 'attack' 
  | 'defense' 
  | 'critChance' 
  | 'critDamage' 
  | 'speed';

export interface CharacterStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  sp: number;
  maxSp: number;
  attack: number;
  defense: number;
  critChance: number;   // 0.0 to 1.0 (e.g. 0.15 = 15%)
  critDamage: number;   // multiplier, e.g. 1.5 = 150%
  speed: number;        // pixels per second (e.g. 150)
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemType = 
  | 'weapon' 
  | 'armor' 
  | 'accessory' 
  | 'consumable' 
  | 'material' 
  | 'quest' 
  | 'artifact';

export interface ItemAffix {
  stat: keyof CharacterStats;
  value: number;
  labelEn: string;
  labelTh: string;
}

export interface ItemDefinition {
  id: string;
  nameEn: string;
  nameTh: string;
  descriptionEn: string;
  descriptionTh: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  baseStats?: Partial<CharacterStats>;
  buyPrice: number;
  sellPrice: number;
  stackable: boolean;
  maxStack?: number;
  effectValue?: number; // e.g. heal amount for potion
}

export interface ItemInstance {
  instanceId: string;
  defId: string;
  quantity: number;
  rarity: ItemRarity;
  enhancementLevel: number; // e.g. +1, +2
  affixes: ItemAffix[];
}

export type Specialization = 
  | 'blade_dancer' 
  | 'guardian' 
  | 'fire_mage' 
  | 'frost_mage' 
  | 'shadow_assassin' 
  | 'echo_mage';

export type ElementType = 'physical' | 'fire' | 'ice' | 'lightning' | 'wind' | 'shadow' | 'crystal' | 'earth';

export interface SkillNode {
  id: string;
  tree: Specialization;
  nameEn: string;
  nameTh: string;
  descriptionEn: string;
  descriptionTh: string;
  tier: number;
  maxRank: number;
  currentRank: number;
  costSp: number;
  costMp: number;
  cooldownMs: number;
  icon: string;
  isActive: boolean; // active skill vs passive
  isUltimate?: boolean;
  element?: ElementType;
  damageMultiplier?: number;
  range?: number;
  prerequisites?: string[];
  statBonuses?: Partial<CharacterStats>;
}

export type QuestType = 
  | 'defeat_enemies' 
  | 'collect_materials' 
  | 'explore_location' 
  | 'talk_to_npc' 
  | 'defeat_boss';

export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'reward_claimed';

export interface QuestObjective {
  id: string;
  type: QuestType;
  targetId: string;
  targetCount: number;
  currentCount: number;
  descriptionEn: string;
  descriptionTh: string;
}

export interface QuestReward {
  exp: number;
  gold: number;
  echoShards: number;
  items?: { defId: string; quantity: number }[];
}

export interface QuestDefinition {
  id: string;
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  giverNpcId: string;
  minLevel: number;
  objectives: QuestObjective[];
  rewards: QuestReward;
  isRepeatable?: boolean;
  targetLocationEn?: string;
  targetLocationTh?: string;
  suggestedActionEn?: string;
  suggestedActionTh?: string;
  worldCoordinates?: { x: number; y: number; zone: 'village' | 'forest' | 'dungeon' };
}

export interface QuestState {
  questId: string;
  status: QuestStatus;
  objectives: { id: string; currentCount: number }[];
}

export interface DialogueChoice {
  textEn: string;
  textTh: string;
  nextNodeId?: string;
  action?: 'open_shop' | 'open_craft' | 'accept_quest' | 'claim_reward' | 'close';
  actionPayload?: string;
}

export interface DialogueNode {
  id: string;
  npcId: string;
  textEn: string;
  textTh: string;
  choices: DialogueChoice[];
}

export interface NPCDefinition {
  id: string;
  nameEn: string;
  nameTh: string;
  titleEn: string;
  titleTh: string;
  portrait: string;
  initialDialogueNodeId: string;
  role: 'healer' | 'blacksmith' | 'guild' | 'merchant' | 'elder';
}

export interface EnemyDefinition {
  id: string;
  nameEn: string;
  nameTh: string;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  expReward: number;
  goldReward: { min: number; max: number };
  detectionRadius: number;
  attackRange: number;
  attackCooldownMs: number;
  spriteKey: string;
  lootTable: { defId: string; dropRate: number }[];
  isBoss?: boolean;
}

export interface PlayerSavedData {
  id?: number;
  name: string;
  level: number;
  exp: number;
  gold: number;
  echoShards: number;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  currentSp: number;
  maxSp: number;
  specialization: Specialization;
  equippedWeapon?: ItemInstance;
  equippedArmor?: ItemInstance;
  equippedAccessory?: ItemInstance;
  currentRegion: string;
  positionX: number;
  positionY: number;
  updatedAt: string;
}

export interface GameSettings {
  language: Language;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  screenShake: boolean;
  reducedMotion: boolean;
  graphicsQuality?: 'low' | 'medium' | 'high';
}

export interface Achievement {
  id: string;
  titleEn: string;
  titleTh: string;
  descEn: string;
  descTh: string;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export type PetSpeciesId = 
  | 'forest_slime'
  | 'ember_fox'
  | 'frost_bunny'
  | 'thunder_cub'
  | 'shadow_cat'
  | 'crystal_sprite'
  | 'moss_turtle'
  | 'baby_dragon';

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface PetSpeciesDefinition {
  id: PetSpeciesId;
  nameEn: string;
  nameTh: string;
  species: string;
  descriptionEn: string;
  descriptionTh: string;
  rarity: PetRarity;
  element: ElementType;
  role: 'healer' | 'fire_dps' | 'ice_control' | 'shock_buffer' | 'crit_stealth' | 'mana_battery' | 'tank_shield' | 'legendary_breaker';
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    supportPower: number;
  };
  growthPerLevel: {
    hp: number;
    atk: number;
    def: number;
    supportPower: number;
  };
  abilityNameEn: string;
  abilityNameTh: string;
  abilityDescEn: string;
  abilityDescTh: string;
  abilityCooldownMs: number;
  spriteColor: number;
  accentColor: string;
}

export interface PetInstance {
  id: string;
  speciesId: PetSpeciesId;
  nickname: string;
  level: number;
  exp: number;
  maxExp: number;
  isActive: boolean;
  unlockedAt: number;
}

export interface PetEggInstance {
  id: string;
  rarity: PetRarity;
  speciesId?: PetSpeciesId;
  acquiredAt: number;
}
