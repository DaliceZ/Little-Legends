import { PetSpeciesDefinition, PetSpeciesId, PetInstance } from '../../shared/types';

export const PET_SPECIES_REGISTRY: Record<PetSpeciesId, PetSpeciesDefinition> = {
  forest_slime: {
    id: 'forest_slime',
    nameEn: 'Forest Slime',
    nameTh: 'สไลม์พงไพร',
    species: 'Slime',
    descriptionEn: 'A bouncy, cheerful forest slime that loves nature. Periodically sprays refreshing dew to heal its master.',
    descriptionTh: 'สไลม์ตัวนุ่มเด้งที่ร่าเริงและรักธรรมชาติ คอยพ่นละอองน้ำค้างเพื่อฟื้นฟูพลังชีวิตให้เจ้านาย',
    rarity: 'common',
    element: 'wind',
    role: 'healer',
    baseStats: {
      hp: 80,
      atk: 10,
      def: 6,
      supportPower: 20, // Heals 20 HP
    },
    growthPerLevel: {
      hp: 15,
      atk: 2,
      def: 1.5,
      supportPower: 5,
    },
    abilityNameEn: 'Healing Mists',
    abilityNameTh: 'ละอองฟื้นฟูชีวา',
    abilityDescEn: 'Restores player HP and sprays sticky dew slowing nearby enemies by 25%.',
    abilityDescTh: 'ฟื้นฟูพลังชีวิตให้ผู้เล่น และพ่นเมือกทำให้ศัตรูรอบข้างเคลื่อนที่ช้าลง 25%',
    abilityCooldownMs: 5000,
    spriteColor: 0x4ade80,
    accentColor: '#4ade80',
  },
  ember_fox: {
    id: 'ember_fox',
    nameEn: 'Ember Fox',
    nameTh: 'จิ้งจอกเพลิงอัคคี',
    species: 'Pyro Fox',
    descriptionEn: 'A spirited fiery kitsune with glowing amber fur. Emits warm sparks and leaps at monsters with ferocious blazing bites.',
    descriptionTh: 'จิ้งจอกขนสีส้มเพลิงที่เปี่ยมด้วยพลังวิญญาณ กระโจนกัดศัตรูด้วยเขี้ยวเปลวเพลิงที่เผาไหม้อย่างรุนแรง',
    rarity: 'uncommon',
    element: 'fire',
    role: 'fire_dps',
    baseStats: {
      hp: 70,
      atk: 22,
      def: 4,
      supportPower: 30, // 30% burn damage bonus
    },
    growthPerLevel: {
      hp: 12,
      atk: 4.5,
      def: 1.0,
      supportPower: 6,
    },
    abilityNameEn: 'Blazing Bite',
    abilityNameTh: 'เขี้ยวเพลิงผลาญ',
    abilityDescEn: 'Lunges at the nearest enemy delivering a fiery bite dealing 180% ATK damage and burning them.',
    abilityDescTh: 'พุ่งโจมตีศัตรูที่ใกล้ที่สุด สร้างความเสียหายไฟ 180% และติดสถานะเผาไหม้',
    abilityCooldownMs: 4000,
    spriteColor: 0xf97316,
    accentColor: '#f97316',
  },
  frost_bunny: {
    id: 'frost_bunny',
    nameEn: 'Frost Bunny',
    nameTh: 'กระต่ายเหมันต์',
    species: 'Arctic Hare',
    descriptionEn: 'A fluffy snow-white rabbit that hops gracefully. Conjures freezing icicles that chill and slow hostile creatures.',
    descriptionTh: 'กระต่ายหิมะขนปุกปุยที่กระโดดอย่างคล่องแคล่ว เสกหนามน้ำแข็งเพื่อชะลอและแช่แข็งศัตรู',
    rarity: 'common',
    element: 'ice',
    role: 'ice_control',
    baseStats: {
      hp: 65,
      atk: 14,
      def: 5,
      supportPower: 35, // 35% slow
    },
    growthPerLevel: {
      hp: 10,
      atk: 3,
      def: 1.2,
      supportPower: 4,
    },
    abilityNameEn: 'Glacial Icicle',
    abilityNameTh: 'เข็มน้ำแข็งเยือกแข็ง',
    abilityDescEn: 'Hurls sharp icicles dealing ice damage and slowing enemy attack and movement speed by 40%.',
    abilityDescTh: 'ยิงหนามน้ำแข็งใส่ศัตรู ลดความเร็วในการโจมตีและการเคลื่อนที่ลง 40%',
    abilityCooldownMs: 4500,
    spriteColor: 0x38bdf8,
    accentColor: '#38bdf8',
  },
  thunder_cub: {
    id: 'thunder_cub',
    nameEn: 'Thunder Cub',
    nameTh: 'พยัคฆ์สายฟ้า',
    species: 'Storm Tiger',
    descriptionEn: 'An energetic feline crackling with static electricity. Grants its master heightened reflexes and lightning speed.',
    descriptionTh: 'ลูกเสือน้อยที่มีประกายสายฟ้าวิ่งวนรอบตัว ช่วยเพิ่มปฏิกิริยาตอบสนองและความเร็วในการเคลื่อนที่ให้เจ้านาย',
    rarity: 'rare',
    element: 'wind',
    role: 'shock_buffer',
    baseStats: {
      hp: 85,
      atk: 18,
      def: 6,
      supportPower: 25, // 25% speed buff
    },
    growthPerLevel: {
      hp: 14,
      atk: 3.5,
      def: 1.8,
      supportPower: 3,
    },
    abilityNameEn: 'Static Discharge',
    abilityNameTh: 'ประจุอัสนีบาต',
    abilityDescEn: 'Discharges electric sparks that shock surrounding enemies and boosts player movement speed by 25%.',
    abilityDescTh: 'ปล่อยคลื่นกระแสไฟฟ้าช็อตศัตรูรอบตัว และมอบบัฟความเร็วเดิน +25% ให้ผู้เล่น',
    abilityCooldownMs: 5500,
    spriteColor: 0xfacc15,
    accentColor: '#facc15',
  },
  shadow_cat: {
    id: 'shadow_cat',
    nameEn: 'Shadow Cat',
    nameTh: 'แมวดำเงามายา',
    species: 'Void Panther',
    descriptionEn: 'A mysterious sleek feline with glowing violet eyes that blends seamlessly into the dark shadows.',
    descriptionTh: 'แมวดำดวงตาสีม่วงประกายลึกลับที่ซ่อนตัวในเงามืดอย่างแนบเนียน เพิ่มอัตราคริติคอลให้เจ้านาย',
    rarity: 'rare',
    element: 'shadow',
    role: 'crit_stealth',
    baseStats: {
      hp: 75,
      atk: 24,
      def: 5,
      supportPower: 15, // +15% Crit Chance
    },
    growthPerLevel: {
      hp: 12,
      atk: 4.8,
      def: 1.2,
      supportPower: 2,
    },
    abilityNameEn: 'Void Pounce',
    abilityNameTh: 'ตะปบเงาสังหาร',
    abilityDescEn: 'Strikes from the void with an automatic critical attack, granting the player +15% Critical Chance.',
    abilityDescTh: 'โผล่ออกมาจากเงามืดและตะปบศัตรูแบบคริติคอล พร้อมมอบโบนัสคริติคอล +15% ให้ผู้เล่น',
    abilityCooldownMs: 5000,
    spriteColor: 0xa855f7,
    accentColor: '#a855f7',
  },
  crystal_sprite: {
    id: 'crystal_sprite',
    nameEn: 'Crystal Sprite',
    nameTh: 'ภูตผลึกมนตรา',
    species: 'Echo Fae',
    descriptionEn: 'A radiant, winged fairy resonating with Echo Crystal energy. Shields its master and refills their mana pool.',
    descriptionTh: 'ภูตน้อยติดปีกเรืองแสงที่เชื่อมโยงกับผลึกสะท้อน คอยเติมพลังมานาและสร้างเกราะแก้วพิทักษ์',
    rarity: 'epic',
    element: 'crystal',
    role: 'mana_battery',
    baseStats: {
      hp: 60,
      atk: 16,
      def: 8,
      supportPower: 12, // Restores 12 MP
    },
    growthPerLevel: {
      hp: 10,
      atk: 3.2,
      def: 2.0,
      supportPower: 3,
    },
    abilityNameEn: 'Aura of Lucidity',
    abilityNameTh: 'ออร่ามนตรากระจ่าง',
    abilityDescEn: 'Restores 12 MP to the player and grants a shimmering crystal barrier that absorbs 60 damage.',
    abilityDescTh: 'ฟื้นฟูมานา 12 หน่วย และกางบาเรียผลึกแก้วดูดซับความเสียหาย 60 หน่วย',
    abilityCooldownMs: 6000,
    spriteColor: 0x67e8f9,
    accentColor: '#67e8f9',
  },
  moss_turtle: {
    id: 'moss_turtle',
    nameEn: 'Moss Turtle',
    nameTh: 'เต่าศิลาพฤกษา',
    species: 'Rock Tortoise',
    descriptionEn: 'An ancient, sturdy tortoise bearing ancient runes on its moss-covered stone carapace. An unyielding defender.',
    descriptionTh: 'เต่าหินโบราณหลังมีพืชพรรณและอักขระศิลา ทนทานแข็งแกร่ง ช่วยรับความเสียหายแทนเจ้านาย',
    rarity: 'uncommon',
    element: 'earth',
    role: 'tank_shield',
    baseStats: {
      hp: 120,
      atk: 10,
      def: 18,
      supportPower: 12, // +12 DEF
    },
    growthPerLevel: {
      hp: 22,
      atk: 1.8,
      def: 3.5,
      supportPower: 2.5,
    },
    abilityNameEn: 'Earthen Shell',
    abilityNameTh: 'กระดองศิลาพิทักษ์',
    abilityDescEn: 'Boosts player defense by +12 and creates an earthen shockwave that taunts nearby foes.',
    abilityDescTh: 'เพิ่มพลังป้องกันให้ผู้เล่น +12 และส่งคลื่นดินยั่วยุศัตรูให้หันมาโจมตีตนเอง',
    abilityCooldownMs: 7000,
    spriteColor: 0x84cc16,
    accentColor: '#84cc16',
  },
  baby_dragon: {
    id: 'baby_dragon',
    nameEn: 'Baby Dragon',
    nameTh: 'มังกรน้อยแห่งกลียุค',
    species: 'Celestial Drake',
    descriptionEn: 'A legendary dragon hatchling with majestic horns and shimmering scales. Unleashes devastating celestial dragonfire!',
    descriptionTh: 'ลูกมังกรในตำนานที่มีเขาคู่สง่างามและเกล็ดมังกรส่องประกาย พ่นเพลิงสวรรค์ทำลายล้างเกราะศัตรูอย่างทรงพลัง!',
    rarity: 'legendary',
    element: 'fire',
    role: 'legendary_breaker',
    baseStats: {
      hp: 110,
      atk: 32,
      def: 12,
      supportPower: 50,
    },
    growthPerLevel: {
      hp: 20,
      atk: 6.5,
      def: 2.5,
      supportPower: 10,
    },
    abilityNameEn: 'Celestial Breath',
    abilityNameTh: 'ลมหายใจเพลิงสวรรค์',
    abilityDescEn: 'Exhales an intense wave of cosmic dragonfire hitting all foes in front for 260% ATK and sundering 30% enemy DEF.',
    abilityDescTh: 'พ่นคลื่นเพลิงมังกรสวรรค์เป็นแนวกว้าง โจมตีศัตรูทั้งหมดด้วยพลัง 260% และลดเกราะศัตรู 30%',
    abilityCooldownMs: 5000,
    spriteColor: 0xec4899,
    accentColor: '#ec4899',
  },
};

export function getPetSpecies(speciesId: PetSpeciesId): PetSpeciesDefinition {
  return PET_SPECIES_REGISTRY[speciesId];
}

export function getAllPetSpecies(): PetSpeciesDefinition[] {
  return Object.values(PET_SPECIES_REGISTRY);
}

export function createPetInstance(speciesId: PetSpeciesId, customNickname?: string): PetInstance {
  const species = getPetSpecies(speciesId);
  return {
    id: `pet_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    speciesId,
    nickname: customNickname || species.nameEn,
    level: 1,
    exp: 0,
    maxExp: 100,
    isActive: false,
    unlockedAt: Date.now(),
  };
}

export function calculatePetStats(pet: PetInstance) {
  const species = getPetSpecies(pet.speciesId);
  const lvlOffset = pet.level - 1;
  return {
    hp: Math.round(species.baseStats.hp + species.growthPerLevel.hp * lvlOffset),
    atk: Math.round(species.baseStats.atk + species.growthPerLevel.atk * lvlOffset),
    def: Math.round(species.baseStats.def + species.growthPerLevel.def * lvlOffset),
    supportPower: Math.round(species.baseStats.supportPower + species.growthPerLevel.supportPower * lvlOffset),
  };
}

export function calculateRequiredPetExp(level: number): number {
  return Math.round(100 * Math.pow(1.35, level - 1));
}
